"use client";

import React, { JSX, useEffect, useState } from "react";
import CalendarSection from "@/app/components/sections/CalendarSection";
import ReservationSection from "@/app/components/sections/ReservationSection";
import DynamicHeroHeader from "@/app/components/sections/DynamicHeroHeader";
import ErrorBoundary from "@/lib/errorBoundary";
import { CalendarProvider } from "@/app/context/CalendarContext";
import { useCalendarContext } from "@/app/context/CalendarContext";
import { motion } from "framer-motion";
import { CalendarDays, ClipboardList } from "lucide-react";
import { useLanguage } from "@/app/context/LanguageContext";
import { useSession } from "next-auth/react";
import { useReservationData } from "@/app/hooks/useReservationData";
import TourSelectionCards from "@/app/components/tours/TourSelectionCards";
import { principalContent } from "@/lib/constants/principal";

function ConversionSection() {
  const { lang } = useLanguage();
  const copy = principalContent[lang].conversion;

  return (
    <section className="relative bg-black pb-12 pt-8 md:pb-16 md:pt-10">
      <div className="container mx-auto space-y-8 px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 gap-4 md:grid-cols-3"
        >
          {copy.faqs.map((item) => (
            <article key={item.question} className="rounded-2xl border border-white/10 bg-zinc-900/55 p-5">
              <h4 className="mb-2 text-sm font-semibold text-white">{item.question}</h4>
              <p className="text-sm leading-relaxed text-zinc-300">{item.answer}</p>
            </article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function ToursImmersionSection({
  onSelectTour,
  selectedTourSlug,
}: {
  onSelectTour: (slug: string) => void;
  selectedTourSlug?: string | null;
}) {
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

        <TourSelectionCards tours={tours} onSelectTour={onSelectTour} selectedTourSlug={selectedTourSlug} />
      </div>
    </section>
  );
}

function BookingSection({ selectedTourSlug }: { selectedTourSlug: string | null }) {
  const { lang } = useLanguage();
  const { status } = useSession();
  const { selectDay } = useCalendarContext();
  const copy = principalContent[lang].booking;

  useEffect(() => {
    selectDay(null);
  }, [selectedTourSlug, selectDay]);

  if (status === "loading") {
    return (
      <div className="relative z-10 container mx-auto px-4 py-16 text-center md:px-8 md:py-28">
        <div className="text-lg text-zinc-400">
          {copy.loading}
        </div>
      </div>
    );
  }

  return (
    <section id="booking" className="relative overflow-hidden bg-zinc-950">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[900px] -translate-x-1/2 bg-teal-900/15 blur-[140px]" />
      <div className="pointer-events-none absolute left-0 top-40 h-[350px] w-[350px] bg-teal-800/8 blur-[120px]" />
      <div className="pointer-events-none absolute right-0 top-40 h-[350px] w-[350px] bg-cyan-900/8 blur-[120px]" />

      <div className="relative z-10 container mx-auto px-4 py-16 md:px-8 md:py-28">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55 }}
          className="mb-12 text-center"
        >
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.28em] text-teal-400">
            {copy.eyebrow}
          </p>
          <h2 className="mb-4 text-3xl font-black leading-tight text-white sm:text-4xl md:text-5xl">
            {copy.title}
          </h2>
          <p className="mx-auto max-w-xl text-base leading-relaxed text-zinc-400 md:text-lg">
            {copy.description}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="mb-12 flex items-center justify-center gap-3"
        >
          <div className="flex items-center gap-2 rounded-full border border-teal-500/25 bg-teal-500/12 px-4 py-2 shadow-[0_0_18px_rgba(20,184,166,0.12)]">
            <CalendarDays size={13} className="text-teal-400" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-teal-300">
              {copy.steps.date}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-px w-3 bg-zinc-700" />
            <div className="h-1.5 w-1.5 rounded-full bg-zinc-700" />
            <div className="h-px w-3 bg-zinc-700" />
          </div>
          <div className="flex items-center gap-2 rounded-full border border-zinc-700/60 bg-zinc-800/50 px-4 py-2">
            <ClipboardList size={13} className="text-zinc-500" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">
              {copy.steps.details}
            </span>
          </div>
        </motion.div>

        {selectedTourSlug ? (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="grid grid-cols-1 items-start gap-5 lg:grid-cols-7"
          >
            <div className="rounded-3xl border border-white/[0.07] bg-white/[0.025] shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-sm lg:col-span-4">
              <CalendarSection />
            </div>

            <div className="lg:sticky lg:top-24 lg:col-span-3">
              <div className="rounded-3xl border border-white/[0.07] bg-white/[0.025] shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-sm">
                <ReservationSection preselectedTourSlug={selectedTourSlug} />
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="mx-auto max-w-2xl rounded-3xl border border-teal-500/20 bg-teal-500/8 px-6 py-8 text-center shadow-[0_20px_60px_rgba(0,0,0,0.32)]">
            <p className="text-sm font-semibold text-teal-300">
              {lang === "es" ? "Primero elegí el tour que querés reservar arriba." : "Choose the tour you want to book above first."}
            </p>
          </div>
        )}
      </div>

      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black to-transparent" />
    </section>
  );
}

export default function Home(): JSX.Element {
  const [selectedTourSlug, setSelectedTourSlug] = useState<string | null>(null);
  const { lang } = useLanguage();
  const copy = principalContent[lang].errors;

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
      <CalendarProvider>
        <main className="min-h-screen overflow-x-hidden bg-black">
          <DynamicHeroHeader />
          <ToursImmersionSection onSelectTour={handleSelectTour} selectedTourSlug={selectedTourSlug} />
          <ConversionSection />
          <BookingSection selectedTourSlug={selectedTourSlug} />
        </main>
      </CalendarProvider>
    </ErrorBoundary>
  );
}
