"use client";

import React, { JSX } from "react";
import DynamicHeroHeader from "@/app/components/sections/DynamicHeroHeader";
import ErrorBoundary from "@/lib/contexts/ErrorBoundary";
import { useLanguage } from "@/lib/LanguageContext";
import { principalContent } from "@/lib/constants/principal";

import ConversionSection from "@/app/components/sections/ConversionSection";
import ToursImmersionSection from "@/app/components/sections/ToursImmersionSection";
import SiteFooter from "@/app/components/sections/SiteFooter";

export default function Home(): JSX.Element {
  const { lang } = useLanguage();
  const copy = principalContent[lang].errors;

  const handleSelectTour = (slug: string) => {
    window.location.href = `/reservar?tour=${encodeURIComponent(slug)}`;
  };

  return (
    <ErrorBoundary
      fallback={
        <div className="flex h-screen items-center justify-center bg-black text-xl text-red-600">
          {copy.criticalFallback}
        </div>
      }
    >
      <main className="min-h-screen overflow-x-hidden bg-black">
        <DynamicHeroHeader onSelectTour={handleSelectTour} />
        <ToursImmersionSection onSelectTour={handleSelectTour} />
        <ConversionSection />
        <SiteFooter />
      </main>
    </ErrorBoundary>
  );
}
