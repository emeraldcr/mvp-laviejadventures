"use client";

import { Suspense, useState } from "react";
import { getTourPackageOptions, resolveInitialPackage } from "@/lib/booking/packages/pricing";
import type { TourSummary } from "@/lib/tours/types";
import UpcomingDepartures from "./UpcomingDepartures";
import { CalendarDays } from "lucide-react";
import { useLanguage } from "@/lib/site/contexts/LanguageContext";
import { useCalendarContext } from "@/lib/booking/calendar/CalendarContext";
import CalendarSection from "@/app/components/sections/CalendarSection";
import ReservationSection from "@/app/components/sections/ReservationSection";

type Props = {
  selectedTourSlug: string | null;
  initialPackageId?: string;
  tour: TourSummary | null;
};

export default function BookingSection({ selectedTourSlug, initialPackageId, tour }: Props) {
  const [chosenPackage, setChosenPackage] = useState(initialPackageId);
  const choosePackage = (id: string) => {
    setChosenPackage(id);
    const url = new URL(window.location.href);
    url.searchParams.set("package", id);
    window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
  };
  const { lang } = useLanguage();
  const { selectedDay, selectDay, availability, availabilityStatus, retryAvailability } = useCalendarContext();
  const showDetails = selectedDay !== null && availabilityStatus === "ready" && (availability[selectedDay] ?? 0) > 0;

  return (
    <section
      id="booking"
      className="relative min-h-[calc(100svh-4rem)] overflow-x-hidden bg-[#f4f1ea] dark:bg-[#0b0a09]"
    >
      <div className="container relative z-10 mx-auto px-2 pt-20 pb-3 sm:px-4 sm:pt-24 sm:pb-4 md:px-8 md:pt-28 md:pb-6">
        {selectedTourSlug ? (
          <>
            {!showDetails && (
              <div className="mx-auto mb-4 max-w-2xl text-center md:mb-5">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-400">
                  {lang === "es"
                    ? "Paso 1 de 3 · Su aventura comienza aquí"
                    : "Step 1 of 3 · Your adventure starts here"}
                </p>
                <h1 className="mt-2 text-2xl font-black tracking-tight text-stone-900 dark:text-white sm:text-3xl">{lang === "es" ? "Elija la fecha de su visita" : "Choose the date of your visit"}</h1>
                <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">{lang === "es" ? "Seleccione una fecha para continuar. La disponibilidad se confirma con el equipo." : "Select a date to continue. Our team will confirm availability."}</p>
              </div>
            )}

            <div
              className={`mx-auto grid items-start gap-3 lg:gap-5 xl:gap-6 ${
                showDetails
                  ? "max-w-6xl"
                  : "max-w-2xl"
              }`}
            >
              {!showDetails && (
                <div className="rounded-2xl border border-stone-200 bg-white p-3 shadow-xl shadow-stone-900/5 dark:border-white/10 dark:bg-stone-900 sm:rounded-[1.75rem] sm:p-5">
                  {selectedDay !== null && availabilityStatus === "ready" && (availability[selectedDay] ?? 0) < 1 && (
                    <p role="status" className="mb-4 rounded-xl bg-amber-50 p-3 text-sm font-semibold text-amber-950 dark:bg-amber-950/40 dark:text-amber-100">
                      {lang === "es" ? "La fecha elegida ya no tiene cupos. Seleccione otra fecha o consulte al equipo." : "The selected date no longer has spots. Choose another date or contact the team."}
                    </p>
                  )}
                  {tour && <UpcomingDepartures tour={tour} preferredPackage={chosenPackage} lang={lang} onChoosePackage={choosePackage} />}
                  <CalendarSection selectedPackage={tour && chosenPackage ? resolveInitialPackage(getTourPackageOptions(tour), chosenPackage) : null} />
                </div>
              )}

              {selectedDay !== null && availabilityStatus !== "ready" && (
                <div className="rounded-2xl border border-stone-200 bg-white p-5 text-sm dark:border-white/10 dark:bg-stone-900" role={availabilityStatus === "error" ? "alert" : "status"}>
                  {availabilityStatus === "error" ? (lang === "es" ? "No pudimos consultar esta fecha. Intente de nuevo o elija otra." : "We could not check this date. Try again or choose another date.") : (lang === "es" ? "Consultando disponibilidad de la fecha elegida…" : "Checking availability for your selected date…")}
                  {availabilityStatus === "error" && <button type="button" onClick={retryAvailability} className="ml-2 font-bold underline">{lang === "es" ? "Reintentar" : "Try again"}</button>}
                </div>
              )}
              {showDetails && (
                <div className="min-w-0">
                  <div className="mb-1 flex justify-end sm:mb-2">
                    <button
                      type="button"
                      onClick={() => {
                        setChosenPackage(new URLSearchParams(window.location.search).get("package") || chosenPackage);
                        selectDay(null);
                      }}
                      className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-stone-300 bg-white px-3 text-xs font-black text-stone-700 transition hover:border-[#00C4B0] hover:text-[#087d72] dark:border-white/15 dark:bg-stone-900 dark:text-stone-200"
                    >
                      <CalendarDays className="h-4 w-4" aria-hidden />
                      {lang === "es" ? "Cambiar fecha" : "Change date"}
                    </button>
                  </div>
                  <div className="rounded-2xl border border-stone-200 bg-white p-2 shadow-xl shadow-stone-900/5 dark:border-white/10 dark:bg-stone-900 sm:rounded-[2rem] sm:p-4">
                    <Suspense fallback={<ReservationFallback />}>
                      <ReservationSection
                        preselectedTourSlug={selectedTourSlug}
                        preselectedPackageId={chosenPackage}
                      />
                    </Suspense>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="mx-auto max-w-2xl rounded-2xl border border-emerald-200 bg-emerald-50 px-6 py-8 text-center dark:border-emerald-800/50 dark:bg-emerald-950/30">
            <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
              {lang === "es"
                ? "No pudimos cargar el tour. Vuelva al inicio e intente nuevamente."
                : "We could not load the tour. Return home and try again."}
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
        <p className="text-sm font-bold text-stone-600 dark:text-stone-300">
          Preparando la reserva...
        </p>
      </div>
    </div>
  );
}
