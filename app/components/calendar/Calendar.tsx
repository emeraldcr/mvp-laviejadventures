"use client";

import React, { useMemo } from "react";
import { useCalendarContext } from "@/lib/CalendarContext";
import { useLanguage } from "@/lib/LanguageContext";
import { translations } from "@/lib/translations";
import CalendarDay from "./CalendarDay";
import { cn } from "@/lib/helpers/utils";
import { getDaysInMonth, startOfMonth, getDay } from "date-fns";

function CalendarBase() {
  const {
    currentMonth,
    currentYear,
    monthLabel,
    nextMonth,
    prevMonth,
    goToYear,
    goToToday,
    selectedDay,
  } = useCalendarContext();
  const { lang } = useLanguage();
  const tr = translations[lang].calendar;

  const calendarDays = useMemo(() => {
    const firstOfMonth = new Date(currentYear, currentMonth, 1);
    const daysInMonth = getDaysInMonth(firstOfMonth);

    // 0 = domingo ... 6 = sábado
    const jsWeekday = getDay(startOfMonth(firstOfMonth));

    // Re-mapeamos para que 0 = lunes ... 6 = domingo
    const offset = (jsWeekday + 6) % 7;

    const days: (number | null)[] = [];

    // Huecos antes del día 1
    for (let i = 0; i < offset; i++) {
      days.push(null);
    }

    // Días del mes
    for (let d = 1; d <= daysInMonth; d++) {
      days.push(d);
    }

    // Render only complete weeks needed for this month (at most six).
    while (days.length % 7 !== 0) {
      days.push(null);
    }

    return days;
  }, [currentMonth, currentYear]);

  return (
    <section className="mt-1 min-w-0 w-full overflow-hidden px-1 sm:mt-2 sm:px-3 lg:px-4 xl:px-5" id="calendar">
      {/* Header: month + nav */}
      <div className="mb-2 space-y-1 sm:mb-3 sm:space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={prevMonth}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-zinc-200 transition hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700"
            aria-label={tr.prevMonthAria}
          >
            <span aria-hidden>‹</span>
          </button>

          <h2 className="flex-1 text-center text-base font-bold text-zinc-900 dark:text-zinc-50 sm:text-2xl sm:font-semibold">
            {monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)}{" "}
            {currentYear}
          </h2>

          <button
            type="button"
            onClick={nextMonth}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-zinc-200 transition hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700"
            aria-label={tr.nextMonthAria}
          >
            <span aria-hidden>›</span>
          </button>
        </div>
        <div className="flex flex-wrap justify-center gap-2 sm:justify-end">
          {currentYear !== new Date().getFullYear() && (
            <button
              type="button"
              onClick={goToToday}
              className="inline-flex min-h-8 items-center justify-center rounded-full border border-sky-500/40 bg-sky-500/10 px-3 py-1 text-[10px] font-bold tracking-wide text-sky-800 transition hover:-translate-y-0.5 hover:border-sky-500 hover:bg-sky-500/20 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 dark:text-sky-200 sm:text-xs"
            >
              {lang === "es" ? "Volver a hoy" : "Back to today"}
            </button>
          )}
          {currentYear !== 2027 && (
            <button
              type="button"
              onClick={() => goToYear(2027)}
              className="inline-flex min-h-8 items-center justify-center rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-[10px] font-extrabold tracking-wide text-emerald-800 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-500 hover:bg-emerald-500/20 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:text-emerald-200 sm:text-xs"
            >
              {lang === "es" ? "Ver fechas 2027" : "See 2027 dates"}
            </button>
          )}
        </div>
      </div>

      {/* Weekday labels + grid */}
      <div className="grid min-w-0 grid-cols-7 gap-x-1 gap-y-1 sm:gap-x-1.5 sm:gap-y-1.5 lg:gap-2 [&>*]:min-w-0">
        {tr.weekdays.map((lbl) => (
          <div
            key={lbl}
            className="text-center text-[9px] font-medium uppercase tracking-wide text-zinc-500 sm:text-[10px]"
          >
            {lbl}
          </div>
        ))}

        {calendarDays.map((day, i) => (
          <CalendarDay
            key={`${currentYear}-${currentMonth}-${day ?? "empty"}-${i}`}
            day={day}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[9px] text-zinc-500 dark:text-zinc-400 sm:mt-2 sm:text-[10px]">
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 sm:gap-3">
          <LegendDot className="bg-emerald-500" label={tr.legendAvailable} />
          <LegendDot className="bg-red-500" label={tr.legendSoldOut} />
          <LegendDot className="bg-zinc-400" label={tr.legendPast} />
          <LegendDot className="bg-blue-500" label={tr.legendToday} />
        </div>
      </div>
    </section>
  );
}

type LegendDotProps = {
  className?: string;
  label: string;
};

function LegendDot({ className, label }: LegendDotProps) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className={cn(
          "h-2 w-2 rounded-full border border-zinc-300 dark:border-zinc-600",
          className
        )}
      />
      <span>{label}</span>
    </span>
  );
}

const Calendar = React.memo(CalendarBase);
export default Calendar;
