"use client";

import React from "react";
import { useLanguage } from "@/lib/LanguageContext";
import { useReservationData } from "@/app/hooks/useReservationData";
import TourSelectionCards from "@/app/components/tours/TourSelectionCards";
import { principalContent } from "@/lib/constants/principal";

type Props = {
  onSelectTour: (slug: string) => void;
  selectedTourSlug?: string | null;
};

export default function ToursImmersionSection({ onSelectTour, selectedTourSlug }: Props) {
  const { lang } = useLanguage();
  const { tours } = useReservationData();
  const copy = principalContent[lang].tours;

  return (
    <section id="tours" className="relative bg-black pb-10 pt-4 md:pb-14">
      <div className="container mx-auto px-4 md:px-8">
        <div className="mb-8 text-center">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.28em] text-cyan-300">
            {copy.eyebrow}
          </p>
          <h2 className="text-3xl font-black text-white md:text-5xl">
            {copy.title}
          </h2>
        </div>

        <TourSelectionCards
          tours={tours}
          onSelectTour={onSelectTour}
          selectedTourSlug={selectedTourSlug}
        />
      </div>
    </section>
  );
}