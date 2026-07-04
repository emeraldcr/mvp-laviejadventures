"use client";

import React, { Suspense } from "react";
import { useLanguage } from "@/lib/LanguageContext";
import CalendarSection from "@/app/components/sections/CalendarSection";
import ReservationSection from "@/app/components/sections/ReservationSection";

type Props = {
  selectedTourSlug: string | null;
  initialPackageId?: string;
};

export default function BookingSection({ selectedTourSlug, initialPackageId }: Props) {
  const { lang } = useLanguage();

  return (
    <section id="booking" className="relative overflow-hidden bg-[#f4f1ea] pt-6 dark:bg-[#0b0a09]">
      <div className="relative z-10 container mx-auto px-3 py-5 md:px-8 md:py-8">
        <div className="mx-auto mb-6 max-w-5xl rounded-2xl border border-stone-200 bg-white px-5 py-5 shadow-sm dark:border-white/10 dark:bg-stone-900 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-emerald-700 dark:text-emerald-300">
                {lang === "es" ? "Fecha" : "Date"}
              </p>
              <h2 className="mt-2 text-2xl font-black text-stone-950 dark:text-stone-50">
                {lang === "es" ? "Escogé el día de tu aventura" : "Pick your adventure day"}
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-stone-600 dark:text-stone-300">
              {lang === "es"
                ? "Tocá una fecha disponible. Después elegís paquete, hora y personas en 3 pasos rápidos."
                : "Tap an available date. Then choose package, time, and guests in 3 quick steps."}
            </p>
          </div>
        </div>

        {selectedTourSlug ? (
          <div className="mx-auto grid max-w-[1560px] items-start gap-5 xl:gap-6 lg:grid-cols-[minmax(560px,0.47fr)_minmax(0,0.53fr)]">
            <div className="rounded-2xl border border-stone-200 bg-white pb-4 shadow-sm dark:border-white/10 dark:bg-stone-900 lg:sticky lg:top-20">
              <CalendarSection />
            </div>
            <div className="rounded-2xl border border-stone-200 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-stone-900 sm:p-4">
              <Suspense fallback={<ReservationFallback />}>
                <ReservationSection
                  preselectedTourSlug={selectedTourSlug}
                  preselectedPackageId={initialPackageId}
                />
              </Suspense>
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-2xl rounded-2xl border border-emerald-200 bg-emerald-50 px-6 py-8 text-center dark:border-emerald-800/50 dark:bg-emerald-950/30">
            <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
              {lang === "es"
                ? "Primero elegí el tour que querés reservar arriba."
                : "Choose the tour you want to book above first."}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

function ReservationFallback() {
  return (
    <div className="flex min-h-[260px] items-center justify-center rounded-2xl border border-stone-200 bg-stone-50 p-6 text-center dark:border-white/10 dark:bg-stone-900/60">
      <div>
        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-600" />
        <p className="text-sm font-bold text-stone-600 dark:text-stone-300">Preparando la reserva...</p>
      </div>
    </div>
  );
}
