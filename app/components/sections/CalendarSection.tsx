"use client";

import { useCallback } from "react";
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
    <section className={cn("flex items-start px-2", className)}>
      <div className="w-full">
        <div className="space-y-3">
          <div className="w-full">
            <Calendar />
          </div>

          <div className="mx-4 rounded-2xl border bg-zinc-50 dark:bg-zinc-900/40 px-3 py-2.5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
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
                className="flex-1 lg:hidden rounded-full border border-teal-500/50 px-3 py-1.5 text-[11px] font-semibold text-teal-300 enabled:hover:bg-teal-500/10 disabled:opacity-40 disabled:cursor-not-allowed transition"
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
