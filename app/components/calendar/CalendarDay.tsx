"use client";

import React from "react";
import { useCalendarContext } from "@/app/context/CalendarContext";
import { cn } from "@/lib/utils";

type Props = {
  day: number | null;
};

type Status = "past" | "soldout" | "last" | "few" | "many";

const STATUS_LABEL: Record<Status, (slots: number) => string> = {
  past: () => "Pasado",
  soldout: () => "Agotado",
  last: () => "Último lugar",
  few: () => "Pocas plazas",
  many: (slots) => `${slots} lugares`,
};

const STATUS_CARD_CLASS: Record<Status, string> = {
  past: "bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700",
  soldout: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700",
  last: "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700",
  few: "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700",
  many: "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-700",
};

const STATUS_TEXT_CLASS: Record<Status, string> = {
  past: "text-zinc-500 dark:text-zinc-400",
  soldout: "text-red-600 dark:text-red-300",
  last: "text-amber-700 dark:text-amber-200",
  few: "text-amber-700 dark:text-amber-200",
  many: "text-emerald-700 dark:text-emerald-200",
};

const STATUS_BAR_CLASS: Record<Status, string> = {
  past: "bg-zinc-400",
  soldout: "bg-red-400",
  last: "bg-amber-500",
  few: "bg-amber-500",
  many: "bg-emerald-500",
};

function CalendarDayBase({ day }: Props) {
  const {
    selectedDay,
    selectDay,
    isPastDay,
    isToday,
    getSlotsForDay,
    maxSlots,
  } = useCalendarContext();

  // Empty cell (padding at start / end of month)
  if (day === null) {
    return (
      <div
        className="h-20 sm:h-24 lg:h-28 rounded-xl"
        aria-hidden="true"
      />
    );
  }

  const past = isPastDay(day);
  const today = isToday(day);
  const slots = getSlotsForDay(day);

  const hasSlots = slots > 0 && !past;
  const selected = selectedDay === day;

  let status: Status = "soldout";
  if (past) status = "past";
  else if (slots === 0) status = "soldout";
  else if (slots === 1) status = "last";
  else if (slots <= 5) status = "few";
  else status = "many";

  const labelText = STATUS_LABEL[status](slots);

  const capacityRatio =
    maxSlots > 0 && slots > 0 ? Math.min(slots / maxSlots, 1) : 0;

  const handleSelect = () => {
    if (!hasSlots) return;
    selectDay(day);
  };

  const isDisabled = !hasSlots;

  return (
    <button
      type="button"
      onClick={handleSelect}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      aria-label={
        past
          ? `Día ${day}, pasado`
          : hasSlots
          ? `Día ${day}, ${slots} lugares disponibles`
          : `Día ${day}, agotado`
      }
      aria-pressed={selected}
      className={cn(
        "flex h-20 sm:h-24 lg:h-28 flex-col rounded-xl border p-2 sm:p-3 text-left shadow-sm outline-none transition duration-150 ease-in-out select-none",
        hasSlots
          ? "cursor-pointer hover:scale-105 hover:shadow-md active:scale-95"
          : "cursor-not-allowed opacity-60",
        STATUS_CARD_CLASS[status],
        selected && "ring-2 ring-teal-500"
      )}
    >
      {/* top: day + badges */}
      <div className="flex items-start justify-between">
        <span
          className={cn(
            "text-lg sm:text-xl font-semibold",
            past
              ? "text-zinc-500 dark:text-zinc-400"
              : selected
              ? "text-teal-800 dark:text-teal-100"
              : "text-zinc-900 dark:text-zinc-50"
          )}
        >
          {day}
        </span>

        <div className="flex flex-col items-end gap-1">
          {today && (
            <span className="rounded-full bg-teal-600/10 px-2 py-[2px] text-[10px] font-medium text-teal-700 dark:text-teal-300">
              Hoy
            </span>
          )}
          {!hasSlots && !past && (
            <span className="rounded-full bg-red-500/10 px-2 py-[2px] text-[10px] font-medium text-red-600 dark:text-red-300">
              x
            </span>
          )}
        </div>
      </div>

      {/* center: status text */}
      <div className="flex flex-1 items-center justify-center">
        <span
          className={cn(
            "text-[11px] sm:text-xs font-semibold text-center",
            STATUS_TEXT_CLASS[status]
          )}
        >
          {labelText}
        </span>
      </div>

      {/* bottom: capacity bar */}
      <div className="mt-1 h-1.5 w-full rounded-full bg-zinc-200/70 dark:bg-zinc-700/70 overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-[width] duration-200",
            STATUS_BAR_CLASS[status]
          )}
          style={{ width: `${capacityRatio * 100}%` }}
        />
      </div>
    </button>
  );
}

const CalendarDay = React.memo(CalendarDayBase);
export default CalendarDay;
