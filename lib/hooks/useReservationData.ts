"use client";

import { useState, useEffect } from "react";
import { BIRDWATCHING_PACKAGES } from "@/lib/tour-packages";
import type { TourSummary } from "@/lib/types/index";

export const DEFAULT_BOOKABLE_TOUR: TourSummary = {
  id: "avistamiento-aves-norteno",
  slug: "avistamiento-aves-norteno",
  titleEs: "Avistamiento de Aves Norteno",
  titleEn: "Northern Birdwatching",
  descriptionEs: "Observacion guiada de aves con binoculares, senderos de bosque y explicaciones sobre comportamiento, habitat y conservacion.",
  descriptionEn: "Guided birdwatching with binoculars, forest trails, and insight into behavior, habitats, and conservation.",
  duration: "2 horas",
  difficulty: "Facil",
  priceCRC: 24990,
  location: "Juan Castro Blanco, Alajuela Norte, Costa Rica",
  packages: BIRDWATCHING_PACKAGES,
};

export function useReservationData() {
  const [tours, setTours] = useState<TourSummary[]>([DEFAULT_BOOKABLE_TOUR]);
  const [ivaRatePercent, setIvaRatePercent] = useState<number>(13);

  useEffect(() => {
    fetch("/api/settings/iva")
      .then((r) => r.json())
      .then((data) => {
        const rate = Number(data?.ivaRate);
        if (!Number.isNaN(rate) && rate >= 0) setIvaRatePercent(rate);
      })
      .catch(() => {});

    fetch("/api/tours")
      .then((r) => r.json())
      .then((data) => {
        const remoteTours = Array.isArray(data?.tours) ? data.tours : [];
        const mapped: TourSummary[] = remoteTours
          .map((t: {
            id?: string;
            slug?: string;
            titleEs?: string;
            titleEn?: string;
            descriptionEs?: string;
            descriptionEn?: string;
            duration?: string;
            difficulty?: string;
            priceCRC?: number;
            location?: string;
            inclusions?: string[];
            exclusions?: string[];
            cancellationPolicy?: string;
            restrictions?: string;
            packages?: TourSummary["packages"];
            tagEs?: string;
            tagEn?: string;
          }) => ({
            id: t.id ?? t.slug ?? "",
            slug: t.slug ?? "",
            titleEs: t.titleEs ?? "Tour",
            titleEn: t.titleEn ?? "Tour",
            descriptionEs: t.descriptionEs,
            descriptionEn: t.descriptionEn,
            duration: t.duration,
            difficulty: t.difficulty,
            priceCRC: t.priceCRC,
            location: t.location,
            inclusions: t.inclusions,
            exclusions: t.exclusions,
            cancellationPolicy: t.cancellationPolicy,
            restrictions: t.restrictions,
            packages: Array.isArray(t.packages) ? t.packages : [],
            tagEs: t.tagEs,
            tagEn: t.tagEn,
          }))
          .filter((t: TourSummary) => Boolean(t.slug));
        const hasMain = mapped.some((t) => t.slug === DEFAULT_BOOKABLE_TOUR.slug);
        setTours(hasMain ? mapped : [DEFAULT_BOOKABLE_TOUR, ...mapped]);
      })
      .catch(() => { setTours([DEFAULT_BOOKABLE_TOUR]); });
  }, []);

  return { tours, ivaRatePercent };
}
