"use client";

import { useCallback, useEffect, useRef } from "react";
import { useCalendarContext } from "@/lib/CalendarContext";
import Calendar from "@/app/components/calendar/Calendar";
import { format } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { cn } from "@/lib/helpers/utils";
import { useLanguage } from "@/lib/LanguageContext";
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
  const previousSelectedDay = useRef(selectedDay);

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

  useEffect(() => {
    const dateChanged = selectedDay !== null && selectedDay !== previousSelectedDay.current;
    previousSelectedDay.current = selectedDay;
    if (!dateChanged || !window.matchMedia("(max-width: 1023px)").matches) return;

    const timer = window.setTimeout(scrollToDetails, 120);
    return () => window.clearTimeout(timer);
  }, [selectedDay, scrollToDetails]);

  return (
    <section className={cn("flex items-start px-1 sm:px-2", className)}>
      <div className="w-full">
        <div className="space-y-4">
          <div className="w-full">
            <Calendar />
          </div>

          <div className="mx-2 flex flex-col items-start justify-between gap-2 rounded-xl border bg-zinc-50 px-3 py-2.5 shadow-sm dark:bg-zinc-900/40 sm:mx-4 sm:flex-row sm:items-center">
            <p className="text-xs text-zinc-600 dark:text-zinc-300">
              {summaryText}
            </p>

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
                className="flex-1 rounded-lg border border-teal-500/50 px-3 py-2 text-[11px] font-bold text-teal-700 transition enabled:hover:bg-teal-500/10 disabled:cursor-not-allowed disabled:opacity-40 dark:text-teal-300 lg:hidden"
              >
                {tr.continueToDetails}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
