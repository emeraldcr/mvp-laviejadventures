// page/sections/ReservationSection.tsx (assuming based on import paths)

"use client";

import ReservationDetails from "@/app/components/reservation/ReservationDetails";
import { AvailabilityMap } from "@/lib/types"; // Assuming types are in lib/types.ts

type Props = {
  selectedDate: number | null;
  currentMonth: number;
  monthName: string;
  tickets: number;
  setTickets: (n: number) => void;
  onReserve: () => void;
  availability: AvailabilityMap; // NEW: Receive dynamic availability
  currentYear: number; // NEW: Receive for full date if needed
};

export default function ReservationSection({
  selectedDate,
  currentMonth,
  monthName,
  tickets,
  setTickets,
  onReserve,
  availability,
  currentYear,
}: Props) {
  return selectedDate ? (
    <ReservationDetails
      selectedDate={selectedDate}
      currentMonth={currentMonth}
      monthName={monthName}
      tickets={tickets}
      setTickets={setTickets}
      onReserve={onReserve}
      availability={availability} // NEW: Pass down
      currentYear={currentYear} // NEW: Pass down
    />
  ) : (
    <div className="rounded-xl bg-blue-50 dark:bg-zinc-900 p-8 text-center">
      <p className="text-lg text-blue-800 dark:text-blue-300">
        Selecciona una fecha disponible en el calendario.
      </p>
    </div>
  );
}