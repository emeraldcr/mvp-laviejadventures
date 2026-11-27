"use client";

import { useState, useEffect, useCallback } from "react";
import { CIUDAD_ESMERALDA_PACKAGES } from "@/lib/tours/packages";
import type { TourSummary } from "@/lib/tours/types";

export const DEFAULT_BOOKABLE_TOUR: TourSummary = {
  id: "tour-ciudad-esmeralda",
  slug: "tour-ciudad-esmeralda",
  titleEs: "Tour Ciudad Esmeralda – Cañón del Río La Vieja",
  titleEn: "Ciudad Esmeralda Tour – La Vieja River Canyon",
  descriptionEs: "Caminata por senderos, río y cañón hacia la Cascada El Zafiro y sus pozas naturales.",
  descriptionEn: "A hike through trails, river, and canyon to El Zafiro Waterfall and its natural pools.",
  duration: "3-4 horas",
  difficulty: "Moderado",
  priceCRC: 28750,
  location: "Sucre de Ciudad Quesada, San Carlos, Alajuela, Costa Rica",
  packages: CIUDAD_ESMERALDA_PACKAGES,
};

export function useReservationData() {
  const [tours, setTours] = useState<TourSummary[]>([DEFAULT_BOOKABLE_TOUR]);
  const [ivaRatePercent, setIvaRatePercent] = useState<number>(13);
  const [catalogStatus, setCatalogStatus] = useState<"loading" | "ready" | "error">("loading");
  const [requestVersion, setRequestVersion] = useState(0);
  const retryCatalog = useCallback(() => { setCatalogStatus("loading"); setRequestVersion((value) => value + 1); }, []);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20_000);
    fetch("/api/settings/iva")
      .then((r) => r.json())
      .then((data) => {
        const rate = Number(data?.ivaRate);
        if (active && !Number.isNaN(rate) && rate >= 0) setIvaRatePercent(rate);
      })
      .catch(() => {});

    fetch("/api/tours", { signal: controller.signal })
      .then((r) => { if (!r.ok) throw new Error("Tour catalog unavailable"); return r.json(); })
      .then((data) => {
        if (!Array.isArray(data?.tours)) throw new Error("Invalid tour catalog");
        const remoteTours = data.tours;
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
        if (active) {
          setTours(mapped);
          setCatalogStatus("ready");
        }
      })
      .catch(() => { if (active) setCatalogStatus("error"); })
      .finally(() => clearTimeout(timeout));
    return () => { active = false; clearTimeout(timeout); controller.abort(); };
  }, [requestVersion]);

  return { tours, ivaRatePercent, catalogStatus, retryCatalog };
}
