"use client";

import React, { Suspense, useEffect } from "react";
import { useLanguage } from "@/lib/LanguageContext";
import { useCalendarContext } from "@/lib/CalendarContext";
import CalendarSection from "@/app/components/sections/CalendarSection";
import ReservationSection from "@/app/components/sections/ReservationSection";

type Props = {
  selectedTourSlug: string | null;
};

export default function BookingSection({ selectedTourSlug }: Props) {
  const { lang } = useLanguage();
  const { selectDay } = useCalendarContext();

  useEffect(() => {
    selectDay(null);
  }, [selectedTourSlug, selectDay]);

  return (
    <section id="booking" className="relative overflow-hidden bg-zinc-950">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[400px] w-[900px] -translate-x-1/2 bg-teal-900/15 blur-[140px]" />

      <div className="relative z-10 container mx-auto px-3 py-5 md:px-8 md:py-8">
        {selectedTourSlug ? (
          <div className="mx-auto grid max-w-7xl items-start gap-4 lg:grid-cols-[minmax(0,0.44fr)_minmax(0,0.56fr)]">
            <div className="rounded-3xl border border-white/[0.07] bg-white/[0.025] pb-4 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-sm lg:sticky lg:top-20">
              <CalendarSection />
            </div>
            <div className="rounded-3xl border border-white/[0.07] bg-white/[0.025] p-3 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-sm sm:p-4">
              <Suspense fallback={<ReservationFallback />}>
                <ReservationSection preselectedTourSlug={selectedTourSlug} />
              </Suspense>
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-2xl rounded-3xl border border-teal-500/20 bg-teal-500/8 px-6 py-8 text-center shadow-[0_20px_60px_rgba(0,0,0,0.32)]">
            <p className="text-sm font-semibold text-teal-300">
              {lang === "es"
                ? "Primero elegí el tour que querés reservar arriba."
                : "Choose the tour you want to book above first."}
            </p>
          </div>
        )}
      </div>

      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black to-transparent" />
    </section>
  );
}

function ReservationFallback() {
  return (
    <div className="flex min-h-[260px] items-center justify-center rounded-2xl border border-white/10 bg-black/25 p-6 text-center">
      <div>
        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-emerald-300/20 border-t-emerald-300" />
        <p className="text-sm font-bold text-white/75">Preparando la reserva...</p>
      </div>
    </div>
  );
}
