"use client";

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

  return (
    <section className={cn("flex items-start mt-6 px-2", className)}>
      <div className="w-full">
        <header className="flex flex-col gap-1">
          <p className="text-[11px] uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            {tr.step}
          </p>
          <h1 className="text-xl sm:text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            {tr.title}
          </h1>
        </header>

        <div className="space-y-4">
          <div className="w-full">
            <Calendar />
          </div>

          <div className="rounded-2xl border bg-zinc-50 dark:bg-zinc-900/40 px-3 py-3 sm:px-4 sm:py-3 shadow-sm flex items-start justify-between gap-3">
            <div className="space-y-1">
              <p className="text-[11px] sm:text-xs font-medium text-zinc-700 dark:text-zinc-200">
                {tr.selectionLabel}
              </p>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300">
                {summaryText}
              </p>
            </div>

            <button
              type="button"
              onClick={goToNextAvailableDay}
              className="whitespace-nowrap rounded-full border border-zinc-300 dark:border-zinc-600 px-3 py-1.5 text-[11px] sm:text-xs font-medium text-zinc-800 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
            >
              {tr.nextAvailable}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
