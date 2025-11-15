// components/CalendarDay.tsx

"use client";

import { AvailabilityMap } from "@/lib/types"; // Assuming types are in lib/types.ts

type Props = {
  day: number | null;
  selectedDate: number | null;
  onSelect: (day: number) => void;
  currentMonth: number;
  currentYear: number;
  availability: AvailabilityMap; // NEW: Receive dynamic availability
};

export default function CalendarDay({
  day,
  selectedDate,
  onSelect,
  currentMonth,
  currentYear,
  availability,
}: Props) {
  if (!day) return <div className="h-28 rounded-xl"></div>; // Standardized height to match day cells

  // Fecha completa del día actual
  const cellDate = new Date(currentYear, currentMonth, day);

  // Fecha actual (sin horas)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isPast = cellDate < today;
  const isToday = cellDate.getTime() === today.getTime(); // NEW: Check for today to add highlight

  const slots = availability[day] ?? 0;
  const available = slots > 0 && !isPast;
  const selected = selectedDate === day;

  const base =
    "flex flex-col p-3 h-28 rounded-xl border shadow-sm transition-all select-none";

  const bg = isPast
    ? "bg-zinc-200 dark:bg-zinc-700 border-zinc-300 dark:border-zinc-600 cursor-not-allowed opacity-50"
    : !available
    ? "bg-red-100 dark:bg-red-900/40 border-red-300 dark:border-red-800 cursor-not-allowed"
    : selected
    ? "bg-teal-600 dark:bg-teal-500 text-white border-teal-700 cursor-pointer hover:bg-teal-700 dark:hover:bg-teal-600"
    : "bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-700";

  const textColor = isPast
    ? "text-zinc-500 dark:text-zinc-400"
    : !available
    ? "text-red-600 dark:text-red-300"
    : slots < 10
    ? "text-orange-500 dark:text-orange-300"
    : selected
    ? "text-white"
    : "text-teal-700 dark:text-teal-300";

  // NEW: Add today highlight (e.g., thicker border)
  const todayStyle = isToday ? "border-2 border-teal-500" : "";

  return (
    <div
      role="button"
      tabIndex={available ? 0 : -1}
      className={`${base} ${bg} ${todayStyle}`}
      onClick={() => available && onSelect(day)}
      onKeyDown={(e) => available && e.key === "Enter" && onSelect(day)} // NEW: Keyboard accessibility
    >
      <span className="text-xl font-bold">{day}</span>

      <div className="flex-grow flex items-end justify-center">
        <span className={`text-sm font-semibold ${textColor}`}>
          {isPast
            ? "Pasado"
            : available
            ? `${slots} ${slots === 1 ? "cupo" : "cupos"}` // NEW: Singular/plural handling
            : "Agotado"}
        </span>
      </div>
    </div>
  );
}