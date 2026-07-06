"use client";

import React, { JSX } from "react";
import ErrorBoundary from "@/lib/contexts/ErrorBoundary";
import { useLanguage } from "@/lib/LanguageContext";
import { principalContent } from "@/lib/constants/principal";
import { useReservationData } from "@/lib/hooks/useReservationData";

import HomeNav from "@/app/components/home/HomeNav";
import HomeHero from "@/app/components/home/HomeHero";
import ToursShowcase from "@/app/components/home/ToursShowcase";
import HomeOrganicsFeature from "@/app/components/home/HomeOrganicsFeature";
import FeaturedStory from "@/app/components/home/FeaturedStory";
import SocialProof from "@/app/components/home/SocialProof";
import HomeFaqFooter from "@/app/components/home/HomeFaqFooter";
import { BOOKING_HREF } from "@/app/components/home/home-utils";

export default function Home(): JSX.Element {
  const { lang } = useLanguage();
  const { tours } = useReservationData();
  const copy = principalContent[lang].errors;

  const handleSelectTour = (slug: string) => {
    window.location.href = `${BOOKING_HREF}?tour=${encodeURIComponent(slug)}`;
  };

  return (
    <ErrorBoundary
      fallback={
        <div className="flex h-screen items-center justify-center bg-white text-xl text-red-600">
          {copy.criticalFallback}
        </div>
      }
    >
      <main className="min-h-screen overflow-x-hidden bg-[#FAF9F6] font-sans text-stone-900 dark:bg-[#0b0a09] dark:text-stone-100">
        <HomeNav />
        <HomeHero tours={tours} />
        <ToursShowcase tours={tours} onSelectTour={handleSelectTour} />
        <HomeOrganicsFeature />
        <FeaturedStory tours={tours} />
        <SocialProof />
        <HomeFaqFooter tours={tours} />
      </main>
    </ErrorBoundary>
  );
}
