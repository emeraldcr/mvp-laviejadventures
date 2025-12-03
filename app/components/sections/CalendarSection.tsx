"use client";

import { useCalendarContext } from "@/app/context/CalendarContext";
import Calendar from "@/app/components/calendar/Calendar";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

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

  const summaryText = selectedDate
    ? `Has elegido el ${format(selectedDate, "EEEE d 'de' MMMM", {
        locale: es,
      })}. ${
        getSlotsForDay(selectedDay!) > 1
          ? "Aún quedan plazas, continúa con tu reserva."
          : "Queda muy poco espacio, confirma tu horario cuanto antes."
      }`
    : "Elige una fecha disponible para ver horarios y avanzar con tu reserva.";

  return (
    <section className={cn("ml-6 mt-6 space-y-4", className)}>
      {/* Step label + title */}
      <header className="flex flex-col gap-1">
        <p className="text-[11px] uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Paso 1 · Fecha
        </p>
        <h1 className="text-xl sm:text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Elige el día de tu reserva
        </h1>
      </header>

      <div className="grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)]">
        {/* Calendar + UX copy */}
        <div className="space-y-4">
          <Calendar />

          <div className="rounded-2xl border bg-zinc-50 dark:bg-zinc-900/40 px-3 py-3 sm:px-4 sm:py-3 shadow-sm flex items-start justify-between gap-3">
            <div className="space-y-1">
              <p className="text-[11px] sm:text-xs font-medium text-zinc-700 dark:text-zinc-200">
                Tu selección
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
              Siguiente día disponible
            </button>
          </div>
        </div>

        {/* Right side reserved for step 2 (ReservationSection) */}
        <div className="hidden md:block" />
      </div>
    </section>
  );
}