"use client";

import type { JSX, ReactNode } from "react";
import ErrorBoundary from "@/lib/contexts/ErrorBoundary";
import { useLanguage } from "@/lib/LanguageContext";
import { principalContent } from "@/lib/constants/principal";
import type { TourSummary } from "@/lib/types/index";
import SiteHeader from "@/app/components/navigation/SiteHeader";
import HomeHero from "@/app/components/home/HomeHero";
import HomeConversionRail from "@/app/components/home/HomeConversionRail";
import HomeTrustSection from "@/app/components/home/HomeTrustSection";
import ToursShowcase from "@/app/components/home/ToursShowcase";
import HomeFaqFooter from "@/app/components/home/HomeFaqFooter";
import HomeStructuredData from "@/app/home/HomeStructuredData";
import HomeTourDiscovery from "@/app/components/home/HomeTourDiscovery";

export default function HomeClient({ children, tours }: { children: ReactNode; tours: TourSummary[] }): JSX.Element {
  const { lang } = useLanguage();
  const copy = principalContent[lang].errors;
  const ciudadEsmeralda = tours.find((tour) => ["tour-ciudad-esmeralda", "ciudad-esmeralda"].includes(tour.slug));
  const otherTours = tours.filter((tour) => !["tour-ciudad-esmeralda", "ciudad-esmeralda"].includes(tour.slug)).slice(0, 3);
  return (
    <ErrorBoundary fallback={<div className="flex h-screen items-center justify-center bg-white text-xl text-red-600">{copy.criticalFallback}</div>}>
      <main className="lva-public-shell min-h-screen overflow-x-hidden font-sans">
        <SiteHeader />
        <HomeStructuredData tours={tours} locale={lang} />
        <HomeHero />
        <HomeTourDiscovery tours={tours} />
        <HomeTrustSection tour={ciudadEsmeralda} />
        {otherTours.length > 0 && <ToursShowcase tours={otherTours} />}
        {children}
        <HomeConversionRail />
        <HomeFaqFooter />
      </main>
    </ErrorBoundary>
  );
}
