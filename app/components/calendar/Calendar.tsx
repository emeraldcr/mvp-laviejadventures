// components/Calendar.tsx (or wherever it's located)

import CalendarDay from "./CalendarDay";
import { AvailabilityMap } from "@/lib/types"; // Assuming types are in lib/types.ts

type Props = {
  calendarDays: (number | null)[];
  dayLabels: string[];
  selectedDate: number | null;
  onSelect: (d: number) => void;
  month: string;
  year: number;
  onPrev: () => void;
  onNext: () => void;
  currentMonth: number;
  currentYear: number;
  availability: AvailabilityMap; // NEW: Pass dynamic availability for the displayed month
};

export default function Calendar({
  calendarDays,
  dayLabels,
  selectedDate,
  onSelect,
  month,
  year,
  currentMonth,
  currentYear,
  availability,
  onPrev,
  onNext,
}: Props) {
  return (
    <section className="p-4">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={onPrev}
          className="px-4 py-2 rounded-full bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700"
          aria-label="Mes Anterior"
        >
          ← Mes Anterior
        </button>
        <h2 className="text-3xl font-semibold">{month} {year}</h2>
        <button
          onClick={onNext}
          className="px-4 py-2 rounded-full bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700"
          aria-label="Mes Siguiente"
        >
          Mes Siguiente →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-4">
        {dayLabels.map((lbl) => (
          <div key={lbl} className="text-center font-bold text-lg text-zinc-500">
            {lbl}
          </div>
        ))}

        {calendarDays.map((day, i) => (
          <CalendarDay
            key={`${year}-${currentMonth}-${day ?? 'empty'}-${i}`} // Improved key for better React reconciliation
            day={day}
            selectedDate={selectedDate}
            onSelect={onSelect}
            currentMonth={currentMonth}
            currentYear={currentYear}
            availability={availability} // NEW: Pass to each day
          />
        ))}
      </div>
    </section>
  );
}