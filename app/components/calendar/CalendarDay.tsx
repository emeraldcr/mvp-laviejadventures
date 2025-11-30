"use client";

import React from "react";
import { AvailabilityMap } from "@/lib/types";

type Props = {
  day: number | null;
  selectedDate: number | null;
  onSelect: (day: number) => void;
  currentMonth: number;
  currentYear: number;
  availability: AvailabilityMap;
};

function CalendarDayBase({
  day,
  selectedDate,
  onSelect,
  currentMonth,
  currentYear,
  availability,
}: Props) {
  if (!day) {
    return <div className="h-20 sm:h-24 lg:h-28 rounded-xl" aria-hidden="true" />;
  }

  const cellDate = new Date(currentYear, currentMonth, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isPast = cellDate < today;
  const isToday = cellDate.getTime() === today.getTime();

  const slots = availability[day] ?? 0;
  const available = slots > 0 && !isPast;
  const selected = selectedDate === day;

  const base =
    "flex flex-col p-2 sm:p-3 h-20 sm:h-24 lg:h-28 rounded-xl border shadow-sm transition duration-200 ease-in-out select-none";

  const interactive = available
    ? "cursor-pointer active:scale-95 active:opacity-90 hover:scale-105 hover:shadow-md"
    : isPast
    ? "cursor-not-allowed opacity-50"
    : "cursor-not-allowed";

  const bg = isPast
    ? "bg-zinc-200 dark:bg-zinc-700 border-zinc-300 dark:border-zinc-600"
    : !available
    ? "bg-red-100 dark:bg-red-900/40 border-red-300 dark:border-red-800"
    : selected
    ? "bg-teal-600 dark:bg-teal-500 text-white border-teal-700"
    : "bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700";

  const textColor = isPast
    ? "text-zinc-500 dark:text-zinc-400"
    : !available
    ? "text-red-600 dark:text-red-300"
    : slots < 10
    ? "text-orange-500 dark:text-orange-300"
    : selected
    ? "text-white"
    : "text-teal-700 dark:text-teal-300";

  const todayStyle = isToday ? "border-2 border-teal-500" : "";

  const labelText = isPast
    ? "Pasado"
    : available
    ? `${slots}`
    : "Agotado";

  return (
    <div
      role="button"
      tabIndex={available ? 0 : -1}
      className={`${base} ${bg} ${todayStyle} ${interactive}`}
      onClick={() => available && onSelect(day)}
      onKeyDown={(e) => available && e.key === "Enter" && onSelect(day)}
      aria-label={
        isPast
          ? `Día ${day}, pasado`
          : available
          ? `Día ${day}, ${slots} lugares disponibles`
          : `Día ${day}, agotado`
      }
    >
      <span className="text-lg sm:text-xl font-bold">{day}</span>

      <div className="flex-grow flex items-end justify-center">
        <span className={`text-[11px] sm:text-xs font-semibold ${textColor}`}>
          {labelText}
        </span>
      </div>
    </div>
  );
}

const CalendarDay = React.memo(CalendarDayBase);
export default CalendarDay;