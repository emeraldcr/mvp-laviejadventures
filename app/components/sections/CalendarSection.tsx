"use client";

import { useCallback } from "react";
import { useCalendarContext } from "@/app/context/CalendarContext";
import Calendar from "@/app/components/calendar/Calendar";
import { format } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/app/context/LanguageContext";
import { translations } from "@/lib/translations";

type Props = {
  className?: string;
};

export default function CalendarSection({ className }: Props) {
  const {
    selectedDate,
    selectedDay,
    getSlotsForDay,
    goToNextAvailableDay,
  } = useCalendarContext();

  const { lang } = useLanguage();
  const tr = translations[lang].calendar;
  const dateLocale = lang === "es" ? es : enUS;

  const summaryText = selectedDate
    ? `${tr.chosenPrefix} ${format(
        selectedDate,
        lang === "es" ? "EEEE d 'de' MMMM" : "EEEE, MMMM d",
        { locale: dateLocale }
      )}. ${
        getSlotsForDay(selectedDay!) > 1 ? tr.chosenMany : tr.chosenFew
      }`
    : tr.chooseDate;

  const scrollToDetails = useCallback(() => {
    const details = document.getElementById("reservation-details-card");
    if (!details) return;
    details.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return (
    <section className={cn("flex items-start px-2 pt-4 sm:pt-6", className)}>
      <div className="w-full">
        <header className="flex flex-col gap-1">
          <p className="text-[11px] uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            {tr.step}
          </p>
          <h1 className="text-xl font-black text-zinc-900 dark:text-zinc-50 sm:text-2xl">
            {tr.title}
          </h1>
        </header>

        <div className="space-y-4 pb-28 sm:pb-0">
          <div className="w-full">
            <Calendar />
          </div>

          <div className="flex flex-col items-start justify-between gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 px-3 py-3 shadow-sm dark:border-zinc-700 dark:bg-zinc-900/60 sm:flex-row sm:items-center sm:px-4 sm:py-3">
            <div className="space-y-1">
              <p className="text-[11px] sm:text-xs font-medium text-zinc-700 dark:text-zinc-200">
                {tr.selectionLabel}
              </p>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300">
                {summaryText}
              </p>
            </div>

            <div className="flex w-full sm:w-auto gap-2">
              <button
                type="button"
                onClick={goToNextAvailableDay}
                className="flex-1 sm:flex-none whitespace-nowrap rounded-full border border-zinc-300 dark:border-zinc-600 px-3 py-1.5 text-[11px] sm:text-xs font-medium text-zinc-800 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              >
                {tr.nextAvailable}
              </button>
              <button
                type="button"
                onClick={scrollToDetails}
                disabled={!selectedDate}
                className="flex-1 sm:hidden rounded-full border border-teal-500/50 px-3 py-1.5 text-[11px] font-semibold text-teal-300 enabled:hover:bg-teal-500/10 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                {tr.continueToDetails}
              </button>
            </div>
          </div>
        </div>

        <div className="fixed inset-x-3 bottom-3 z-40 rounded-2xl border border-teal-400/40 bg-zinc-950/95 p-3 shadow-2xl shadow-black/50 backdrop-blur sm:hidden" style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}>
          <p className="text-[11px] text-zinc-400 mb-1">{tr.mobileFlowHint}</p>
          <button
            type="button"
            onClick={scrollToDetails}
            disabled={!selectedDate}
            className="min-h-11 w-full rounded-xl bg-teal-400 px-4 py-2 text-sm font-black text-zinc-950 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {selectedDate ? tr.continueToDetails : tr.selectDateFirst}
          </button>
        </div>
      </div>
    </section>
  );
}
