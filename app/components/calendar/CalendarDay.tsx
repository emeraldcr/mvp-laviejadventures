"use client";

import React from "react";
import { useCalendarContext } from "@/lib/CalendarContext";
import { useLanguage } from "@/lib/LanguageContext";
import { translations } from "@/lib/translations";
import { cn } from "@/lib/helpers/utils";

type Props = {
  day: number | null;
};

type Status = "loading" | "past" | "soldout" | "available";

const STATUS_CARD_CLASS: Record<Status, string> = {
  loading: "bg-zinc-50 dark:bg-zinc-900 border-zinc-300 dark:border-zinc-600",
  past: "bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600",
  soldout: "bg-red-50 dark:bg-red-900/20 border-red-400 dark:border-red-600",
  available: "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-400 dark:border-emerald-600",
};

const STATUS_TEXT_CLASS: Record<Status, string> = {
  loading: "text-zinc-400 dark:text-zinc-500",
  past: "text-zinc-500 dark:text-zinc-400",
  soldout: "text-red-600 dark:text-red-300",
  available: "text-emerald-700 dark:text-emerald-200",
};

function CalendarDayBase({ day }: Props) {
  const { lang } = useLanguage();
  const tr = translations[lang].calendar;
  const {
    selectedDay,
    selectDay,
    isPastDay,
    isToday,
    getSlotsForDay,
    availabilityLoading,
  } = useCalendarContext();

  if (day === null) {
    return <div className="h-[clamp(3.5rem,8svh,4.5rem)] rounded-lg sm:h-[clamp(4.25rem,9svh,5rem)] sm:rounded-xl" aria-hidden="true" />;
  }

  const past = isPastDay(day);
  const today = isToday(day);
  const slots = getSlotsForDay(day);

  const hasSlots = slots > 0 && !past && !availabilityLoading;
  const selected = selectedDay === day;

  let status: Status = "soldout";
  if (availabilityLoading) status = "loading";
  else if (past) status = "past";
  else if (slots === 0) status = "soldout";
  else status = "available";

  const labelText =
    status === "loading"
      ? " "
      : status === "past"
      ? tr.statusPast
      : status === "soldout"
        ? tr.statusSoldOut
        : tr.legendAvailable;

  const compactLabel =
    status === "loading"
      ? " "
      : status === "past"
      ? tr.statusPast
      : status === "soldout"
        ? tr.statusSoldOut
        : tr.legendAvailable;

  const handleSelect = () => {
    if (!hasSlots) return;
    selectDay(day);
  };

  const isDisabled = availabilityLoading || !hasSlots;

  return (
    <button
      type="button"
      onClick={handleSelect}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      aria-label={
        past
          ? tr.ariaDayPast.replace("{day}", String(day))
          : hasSlots
            ? tr.ariaDayAvailable.replace("{day}", String(day))
            : tr.ariaDaySoldOut.replace("{day}", String(day))
      }
      aria-pressed={selected}
      className={cn(
        "group relative flex h-[clamp(3.5rem,8svh,4.5rem)] min-w-0 w-full flex-col overflow-hidden rounded-lg border-2 p-1 text-left shadow-sm outline-none transition-[transform,box-shadow,border-color,background-color] duration-200 ease-out select-none motion-reduce:transition-none sm:h-[clamp(4.25rem,9svh,5rem)] sm:rounded-xl sm:p-2 md:p-2.5",
        hasSlots
          ? "cursor-pointer hover:z-10 hover:-translate-y-1 hover:scale-[1.025] hover:border-emerald-400 hover:bg-emerald-100 hover:shadow-[0_12px_28px_-12px_rgba(16,185,129,0.55)] active:translate-y-0 active:scale-[0.99] focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 dark:hover:border-emerald-500 dark:hover:bg-emerald-900/40 dark:hover:shadow-[0_12px_28px_-12px_rgba(16,185,129,0.28)] dark:focus-visible:ring-offset-zinc-950"
          : "cursor-not-allowed opacity-60",
        STATUS_CARD_CLASS[status],
        today && !selected && "border-sky-500 bg-sky-50 shadow-[0_0_0_2px_rgba(56,189,248,0.18),0_8px_22px_-14px_rgba(14,165,233,0.7)] dark:border-sky-400 dark:bg-sky-950/40",
        selected && "z-[1] border-emerald-600 bg-emerald-100 ring-2 ring-emerald-500 shadow-[0_8px_24px_-10px_rgba(16,185,129,0.55)] dark:border-emerald-400 dark:bg-emerald-900/40 dark:shadow-[0_8px_24px_-10px_rgba(16,185,129,0.32)]"
      )}
    >
      <div className="flex items-start justify-between gap-0.5">
        <span
          className={cn(
            "text-sm font-bold sm:text-base sm:font-semibold md:text-lg",
            past
              ? "text-zinc-500 dark:text-zinc-400"
              : selected
                ? "text-emerald-800 dark:text-emerald-100"
                : today
                  ? "text-sky-800 dark:text-sky-100"
                : "text-zinc-900 dark:text-zinc-50"
          )}
        >
          {day}
        </span>

        <div className="flex flex-col items-end gap-0.5">
          {today && (
            <span className="rounded-full bg-sky-500 px-1 py-[1px] text-[7px] font-extrabold text-white shadow-sm sm:px-1.5 sm:py-[2px] sm:text-[9px]">
              {tr.legendToday}
            </span>
          )}
          {selected && (
          <span className="rounded-full bg-emerald-500 px-1 py-[1px] text-[7px] font-black text-white sm:hidden">
              ✓
            </span>
          )}
          {!hasSlots && !past && !availabilityLoading && (
            <span className="rounded-full bg-red-500/10 px-1.5 py-[1px] text-[9px] font-medium text-red-600 dark:text-red-300 sm:px-2 sm:py-[2px] sm:text-[10px]">
              x
            </span>
          )}
        </div>
      </div>

      <div className="hidden flex-1 items-center justify-center sm:flex">
        <span
          className={cn(
            "text-center text-[10px] font-semibold leading-tight transition-colors duration-200 group-hover:text-emerald-800 sm:text-[11px] dark:group-hover:text-emerald-100",
            STATUS_TEXT_CLASS[status]
          )}
        >
          {labelText}
        </span>
      </div>

      <div className="flex flex-1 items-center justify-center sm:hidden">
        <span
          className={cn(
            "line-clamp-2 text-center text-[9px] font-semibold leading-tight transition-colors duration-200 group-hover:text-emerald-800 dark:group-hover:text-emerald-100",
            STATUS_TEXT_CLASS[status]
          )}
        >
          {availabilityLoading ? "" : compactLabel}
        </span>
      </div>

    </button>
  );
}

const CalendarDay = React.memo(CalendarDayBase);
export default CalendarDay;
