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
    <section id="booking" className="relative overflow-hidden bg-zinc-950 pt-6 -mt-px">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#030807] to-transparent" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-[400px] w-[900px] -translate-x-1/2 bg-teal-900/15 blur-[140px]" />

      <div className="relative z-10 container mx-auto px-3 py-5 md:px-8 md:py-8">
        <div className="mx-auto mb-6 max-w-5xl overflow-hidden rounded-3xl border border-white/[0.07] bg-white/[0.03] px-5 py-5 shadow-[0_18px_50px_rgba(0,0,0,0.32)] backdrop-blur-sm sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-emerald-200">
                {lang === "es" ? "Paso 2" : "Step 2"}
              </p>
              <h2 className="mt-2 text-2xl font-black text-white">
                {lang === "es" ? "Escogé la fecha perfecta" : "Pick your perfect date"}
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-zinc-300">
              {lang === "es"
                ? "El calendario está listo abajo; elegí tu fecha y continuá con los detalles de la reserva."
                : "The calendar is ready below; choose your date and continue with booking details."}
            </p>
          </div>
        </div>

        {selectedTourSlug ? (
          <div className="mx-auto grid max-w-[1560px] items-start gap-5 xl:gap-6 lg:grid-cols-[minmax(560px,0.47fr)_minmax(0,0.53fr)]">
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
