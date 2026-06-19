"use client";

import React, { JSX, useEffect, useState } from "react";
import DynamicHeroHeader from "@/app/components/sections/DynamicHeroHeader";
import ErrorBoundary from "@/lib/contexts/ErrorBoundary";
import { CalendarProvider } from "@/lib/CalendarContext";
import { useLanguage } from "@/lib/LanguageContext";
import { principalContent } from "@/lib/constants/principal";

import ConversionSection from "@/app/components/sections/ConversionSection";
import ToursImmersionSection from "@/app/components/sections/ToursImmersionSection";
import BookingSection from "@/app/components/sections/BookingSection";
import SiteFooter from "@/app/components/sections/SiteFooter";

export default function Home(): JSX.Element {
  const [selectedTourSlug, setSelectedTourSlug] = useState<string | null>(null);
  const { lang } = useLanguage();
  const copy = principalContent[lang].errors;

  // Handle direct tour link (e.g. ?tour=some-tour)
  useEffect(() => {
    const requestedTourSlug = new URLSearchParams(window.location.search).get("tour")?.trim();
    let frameId: number | undefined;

    if (requestedTourSlug) {
      frameId = window.requestAnimationFrame(() => setSelectedTourSlug(requestedTourSlug));
    }

    return () => {
      if (frameId) window.cancelAnimationFrame(frameId);
    };
  }, []);

  const handleSelectTour = (slug: string) => {
    setSelectedTourSlug(slug);
    window.history.replaceState({}, "", `/?tour=${slug}#booking`);
    document.getElementById("booking")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <ErrorBoundary
      fallback={
        <div className="flex h-screen items-center justify-center bg-black text-xl text-red-600">
          {copy.criticalFallback}
        </div>
      }
    >
      <CalendarProvider selectedTourSlug={selectedTourSlug}>
        <main className="min-h-screen overflow-x-hidden bg-black">
          <DynamicHeroHeader onSelectTour={handleSelectTour} />
          <ToursImmersionSection
            onSelectTour={handleSelectTour}
            selectedTourSlug={selectedTourSlug}
          />
          <BookingSection selectedTourSlug={selectedTourSlug} />
          <ConversionSection />
          <SiteFooter />
        </main>
      </CalendarProvider>
    </ErrorBoundary>
  );
}
