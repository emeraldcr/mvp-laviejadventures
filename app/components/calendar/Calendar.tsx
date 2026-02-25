"use client";

import React, { useMemo } from "react";
import { useCalendarContext } from "@/app/context/CalendarContext";
import { useLanguage } from "@/app/context/LanguageContext";
import { translations } from "@/lib/translations";
import CalendarDay from "./CalendarDay";
import { cn } from "@/lib/utils";
import { getDaysInMonth, startOfMonth, getDay } from "date-fns";

function CalendarBase() {
  const {
    currentMonth,
    currentYear,
    monthLabel,
    nextMonth,
    prevMonth,
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

    // Rellenar hasta 6 semanas (6 * 7 = 42 celdas)
    while (days.length < 42) {
      days.push(null);
    }

    return days;
  }, [currentMonth, currentYear]);

  return (
    <section className="mt-4 px-4 sm:px-6 lg:px-8 w-full" id="calendar">
      {/* Header: month + nav */}
      <div className="mb-4 sm:mb-5 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={prevMonth}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 transition"
            aria-label={tr.prevMonthAria}
          >
            <span aria-hidden>‹</span>
          </button>

          <h2 className="flex-1 text-center text-lg sm:text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            {monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)}{" "}
            {currentYear}
          </h2>

          <button
            type="button"
            onClick={nextMonth}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 transition"
            aria-label={tr.nextMonthAria}
          >
            <span aria-hidden>›</span>
          </button>
        </div>

        <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400">
          {selectedDay
            ? tr.selectedDateHint
            : tr.idleHint}
        </p>
      </div>

      {/* Weekday labels + grid */}
      <div className="grid grid-cols-7 gap-y-1 gap-x-1 sm:gap-2 md:gap-3">
        {tr.weekdays.map((lbl) => (
          <div
            key={lbl}
            className="text-center text-[11px] sm:text-xs font-medium uppercase tracking-wide text-zinc-500"
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
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-[10px] sm:text-[11px] text-zinc-500 dark:text-zinc-400">
        <div className="flex flex-wrap items-center gap-3">
          <LegendDot className="bg-emerald-500" label={tr.legendAvailable} />
          <LegendDot className="bg-amber-400" label={tr.legendFew} />
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
