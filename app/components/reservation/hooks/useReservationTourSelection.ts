"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { TOUR_INFO } from "@/lib/tour-info";
import { DEFAULT_DEPARTURE_TIMES } from "@/lib/reservation/constants";
import {
  getExcludedAddonIds,
  getPackageDepartureTimes,
  getPackageDisplayName,
  getPackageId,
  getTourPackageOptions,
  resolveInitialPackage,
  resolveRecommendedPackage,
} from "@/lib/reservation/pricing";
import { isPackageAvailableOnDate } from "@/lib/tour-packages";
import { resolveSelectedTourSlug, getDefaultMainTourInfo } from "../reservationDetails.helpers";
import type { MainTourInfo, TourPackageOption, TourSummary } from "@/lib/types/index";

export function useReservationTourSelection({
  tours,
  initialSelectedTourSlug,
  initialSelectedPackageId,
  reservationDateIso,
  tickets,
  lang,
  tourInfo,
  defaultCancellationPolicy,
}: {
  tours: TourSummary[];
  initialSelectedTourSlug?: string;
  initialSelectedPackageId?: string;
  reservationDateIso: string;
  tickets: number;
  lang: "es" | "en";
  tourInfo?: MainTourInfo | null;
  defaultCancellationPolicy: string;
}) {
  const [selectedTourInfo, setSelectedTourInfo] = useState<{ slug: string; tour: MainTourInfo } | null>(null);
  const selectedTourSlug = resolveSelectedTourSlug(tours, null, initialSelectedTourSlug);
  const selectedTour = tours.find((tour) => tour.slug === selectedTourSlug) ?? tours[0] ?? null;
  const packageOptions = useMemo(() => getTourPackageOptions(selectedTour), [selectedTour]);
  const [selectedPackageId, setSelectedPackageId] = useState("");
  const [hasConfirmedPackage, setHasConfirmedPackage] = useState(false);
  const selectedPackage = useMemo(
    () => packageOptions.find((pkg) => pkg.id === selectedPackageId) ?? packageOptions[0] ?? null,
    [packageOptions, selectedPackageId],
  );
  const excludedAddonIds = useMemo(() => getExcludedAddonIds(selectedPackage), [selectedPackage]);
  const packageLabel = selectedPackage
    ? getPackageDisplayName(selectedPackage, lang === "es")
    : lang === "es" ? "Entrada General" : "General Entry";
  const packagePriceUSD = selectedPackage?.price ?? 30;
  const selectedTourName = selectedTour
    ? (lang === "es" ? selectedTour.titleEs : selectedTour.titleEn)
    : (lang === "es" ? "Tour" : "Tour");
  const selectedTourDescription = selectedTour
    ? (lang === "es" ? selectedTour.descriptionEs : selectedTour.descriptionEn) ?? selectedTour.descriptionEs ?? selectedTour.descriptionEn ?? ""
    : "";

  const selectedTourFallbackInfo = useMemo<MainTourInfo | null>(() => {
    if (!selectedTour) return null;

    const priceLabel = typeof selectedTour.priceCRC === "number"
      ? new Intl.NumberFormat("es-CR", {
          style: "currency",
          currency: "CRC",
          maximumFractionDigits: 0,
        }).format(selectedTour.priceCRC)
      : "";

    return {
      name: selectedTourName,
      operator: TOUR_INFO.operator,
      duration: selectedTour.duration ?? "",
      price: priceLabel,
      location: selectedTour.location ?? "",
      inclusions: selectedTour.inclusions ?? [],
      exclusions: selectedTour.exclusions ?? [],
      cancellationPolicy: selectedTour.cancellationPolicy ?? "",
      details: selectedTourDescription,
      restrictions: selectedTour.restrictions ?? "",
      contact: TOUR_INFO.contact,
    };
  }, [selectedTour, selectedTourDescription, selectedTourName]);

  const defaultMainTourInfo = getDefaultMainTourInfo();
  const apiSelectedTourInfo = selectedTourInfo?.slug === selectedTourSlug ? selectedTourInfo.tour : null;
  const resolvedTourInfo: MainTourInfo = apiSelectedTourInfo
    ? {
        ...(selectedTourFallbackInfo ?? tourInfo ?? defaultMainTourInfo),
        ...apiSelectedTourInfo,
        duration: apiSelectedTourInfo.duration || selectedTourFallbackInfo?.duration || tourInfo?.duration || defaultMainTourInfo.duration,
        price: apiSelectedTourInfo.price || selectedTourFallbackInfo?.price || tourInfo?.price || defaultMainTourInfo.price,
        location: apiSelectedTourInfo.location || selectedTourFallbackInfo?.location || tourInfo?.location || defaultMainTourInfo.location,
        inclusions: apiSelectedTourInfo.inclusions.length > 0 ? apiSelectedTourInfo.inclusions : selectedTourFallbackInfo?.inclusions ?? tourInfo?.inclusions ?? defaultMainTourInfo.inclusions,
        exclusions: apiSelectedTourInfo.exclusions.length > 0 ? apiSelectedTourInfo.exclusions : selectedTourFallbackInfo?.exclusions ?? tourInfo?.exclusions ?? defaultMainTourInfo.exclusions,
        cancellationPolicy: apiSelectedTourInfo.cancellationPolicy || selectedTourFallbackInfo?.cancellationPolicy || tourInfo?.cancellationPolicy || defaultMainTourInfo.cancellationPolicy,
        details: apiSelectedTourInfo.details || selectedTourFallbackInfo?.details || tourInfo?.details || defaultMainTourInfo.details,
        restrictions: apiSelectedTourInfo.restrictions || selectedTourFallbackInfo?.restrictions || tourInfo?.restrictions || defaultMainTourInfo.restrictions,
        contact: apiSelectedTourInfo.contact ?? selectedTourFallbackInfo?.contact ?? tourInfo?.contact ?? defaultMainTourInfo.contact,
      }
    : selectedTourFallbackInfo ?? (tourInfo
        ? { ...defaultMainTourInfo, ...tourInfo, cancellationPolicy: tourInfo.cancellationPolicy ?? defaultMainTourInfo.cancellationPolicy }
        : defaultMainTourInfo);

  const availableTimeSlots = useMemo(() => {
    const fromPackage = getPackageDepartureTimes(selectedPackage);
    return fromPackage.length > 0 ? fromPackage : DEFAULT_DEPARTURE_TIMES;
  }, [selectedPackage]);

  const isPackageDisabled = useCallback(
    (pkg: TourPackageOption) => !isPackageAvailableOnDate(pkg, reservationDateIso),
    [reservationDateIso],
  );

  useEffect(() => {
    const packageFromUrl = typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("package")
      : null;
    const requestedPackageId = packageFromUrl || initialSelectedPackageId;
    if (requestedPackageId) {
      setSelectedPackageId(getPackageId(resolveInitialPackage(packageOptions, requestedPackageId)));
      return;
    }
    const recommended = resolveRecommendedPackage(packageOptions, isPackageDisabled);
    const fallback = resolveInitialPackage(packageOptions, null);
    setSelectedPackageId(getPackageId(recommended ?? fallback));
  }, [selectedTourSlug, packageOptions, initialSelectedPackageId, isPackageDisabled]);

  useEffect(() => {
    if (packageOptions.length === 0 || !selectedPackageId) return;
    const current = packageOptions.find((pkg) => getPackageId(pkg) === selectedPackageId) ?? null;
    if (current && !isPackageDisabled(current)) return;

    const recommended = resolveRecommendedPackage(packageOptions, isPackageDisabled);
    if (recommended) {
      setSelectedPackageId(getPackageId(recommended));
      return;
    }
    const firstOpen = packageOptions.find((pkg) => !isPackageDisabled(pkg));
    if (firstOpen) setSelectedPackageId(getPackageId(firstOpen));
  }, [isPackageDisabled, packageOptions, selectedPackageId]);

  useEffect(() => {
    if (typeof window === "undefined" || !selectedTourSlug || !selectedPackageId) return;

    const url = new URL(window.location.href);
    url.searchParams.set("tour", selectedTourSlug);
    url.searchParams.set("date", reservationDateIso);
    if (tickets > 1) url.searchParams.set("pax", String(tickets));
    else url.searchParams.delete("pax");
    url.searchParams.set("package", selectedPackageId);

    const next = `${url.pathname}${url.search}`;
    if (`${window.location.pathname}${window.location.search}` !== next) {
      window.history.replaceState({}, "", next);
    }
  }, [reservationDateIso, selectedPackageId, selectedTourSlug, tickets]);

  useEffect(() => {
    let isMounted = true;
    fetch(`/api/tours/main?slug=${encodeURIComponent(selectedTourSlug)}`)
      .then((response) => response.json())
      .then((data) => {
        if (isMounted && data?.tour) setSelectedTourInfo({ slug: selectedTourSlug, tour: data.tour as MainTourInfo });
      })
      .catch(() => {
        if (isMounted && tourInfo && !selectedTourFallbackInfo) {
          setSelectedTourInfo({ slug: selectedTourSlug, tour: tourInfo });
        }
      });

    return () => { isMounted = false; };
  }, [selectedTourSlug, selectedTourFallbackInfo, tourInfo]);

  const seemsSpanish = useCallback((value?: string) => {
    if (!value) return false;
    return /[áéíóúñ]|\b(entrada|guía|recorrido|cañón|horas|cancelación|solo|adultos|incluye)\b/i.test(value);
  }, []);
  const localizedCancellationPolicy = useMemo(() => {
    if (lang === "es") return resolvedTourInfo.cancellationPolicy || defaultCancellationPolicy;
    if (!seemsSpanish(resolvedTourInfo.cancellationPolicy)) {
      return resolvedTourInfo.cancellationPolicy || defaultCancellationPolicy;
    }
    return defaultCancellationPolicy;
  }, [lang, resolvedTourInfo.cancellationPolicy, seemsSpanish, defaultCancellationPolicy]);

  return {
    selectedTourSlug,
    selectedTour,
    packageOptions,
    selectedPackageId,
    setSelectedPackageId,
    hasConfirmedPackage,
    setHasConfirmedPackage,
    selectedPackage,
    excludedAddonIds,
    packageLabel,
    packagePriceUSD,
    selectedTourName,
    availableTimeSlots,
    isPackageDisabled,
    localizedCancellationPolicy,
  };
}
