"use client";

import { useState, useEffect } from "react";
import type { MainTourInfo, TourSummary } from "@/lib/types/index";

export const DEFAULT_BOOKABLE_TOUR: TourSummary = {
  id: "tour-ciudad-esmeralda",
  slug: "tour-ciudad-esmeralda",
  titleEs: "Tour Ciudad Esmeralda",
  titleEn: "Ciudad Esmeralda Tour",
};

export function useReservationData() {
  const [tourInfo, setTourInfo] = useState<MainTourInfo | null>(null);
  const [tours, setTours] = useState<TourSummary[]>([DEFAULT_BOOKABLE_TOUR]);
  const [ivaRatePercent, setIvaRatePercent] = useState<number>(13);

  useEffect(() => {
    fetch("/api/tours/main")
      .then((r) => r.json())
      .then((data) => { if (data?.tour) setTourInfo(data.tour); })
      .catch(() => {});

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
          .map((t: { id?: string; slug?: string; titleEs?: string; titleEn?: string }) => ({
            id: t.id ?? t.slug ?? "",
            slug: t.slug ?? "",
            titleEs: t.titleEs ?? "Tour",
            titleEn: t.titleEn ?? "Tour",
          }))
          .filter((t: TourSummary) => Boolean(t.slug));
        const hasMain = mapped.some((t) => t.slug === DEFAULT_BOOKABLE_TOUR.slug);
        setTours(hasMain ? mapped : [DEFAULT_BOOKABLE_TOUR, ...mapped]);
      })
      .catch(() => { setTours([DEFAULT_BOOKABLE_TOUR]); });
  }, []);

  return { tourInfo, tours, ivaRatePercent };
}
