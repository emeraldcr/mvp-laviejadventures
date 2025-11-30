"use client";

import React, { useMemo } from "react";
import CalendarDay from "./CalendarDay";
import { AvailabilityMap } from "@/lib/types";
import { useCalendarContext } from "@/app/context/CalendarContext";

type Props = {
  selectedDate: number | null;
  onSelect: (d: number) => void;
  month: string;
  year: number;
  currentMonth: number;
  currentYear: number;
  availability: AvailabilityMap;
};

function CalendarBase({
  selectedDate,
  onSelect,
  month,
  year,
  currentMonth,
  currentYear,
  availability,
}: Props) {
  const { nextMonth, prevMonth } = useCalendarContext();

  const dayLabels = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  const { calendarDays } = useMemo(() => {
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();

    const days: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(d);

    return { calendarDays: days };
  }, [currentMonth, currentYear]);

  return (
    <section className="mt-4 px-2 sm:px-4" id="calendar">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
        <div className="flex items-center justify-between gap-2 w-full">
          <button
            onClick={prevMonth}
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 transition"
            aria-label="Mes anterior"
          >
            <span aria-hidden>‹</span>
          </button>

          <h2 className="flex-1 text-center text-lg sm:text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            {month} {year}
          </h2>

          <button
            onClick={nextMonth}
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 transition"
            aria-label="Mes siguiente"
          >
            <span aria-hidden>›</span>
          </button>
        </div>
      </div>

      {/* Weekday labels + grid */}
      <div className="grid grid-cols-7 gap-y-1 gap-x-1 sm:gap-2 md:gap-3">
        {dayLabels.map((lbl) => (
          <div
            key={lbl}
            className="text-center text-[11px] sm:text-xs font-medium uppercase tracking-wide text-zinc-500"
          >
            {lbl}
          </div>
        ))}

        {calendarDays.map((day, i) => (
          <CalendarDay
            key={`${year}-${currentMonth}-${day ?? "empty"}-${i}`}
            day={day}
            selectedDate={selectedDate}
            onSelect={onSelect}
            currentMonth={currentMonth}
            currentYear={currentYear}
            availability={availability}
          />
        ))}
      </div>
    </section>
  );
}

const Calendar = React.memo(CalendarBase);
export default Calendar;
