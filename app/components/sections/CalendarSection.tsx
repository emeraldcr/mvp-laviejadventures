"use client";

import Calendar from "@/app/components/calendar/Calendar";
import { AvailabilityMap } from "@/lib/types";

type Props = {
  selectedDate: number | null;
  onSelect: (day: number) => void;
  monthName: string;
  currentMonth: number;
  currentYear: number;
  availability: AvailabilityMap;
};

export default function CalendarSection({
  selectedDate,
  onSelect,
  monthName,
  currentMonth,
  currentYear,
  availability,
}: Props) {
  return (
    <section className="mt-6">
      <Calendar
        selectedDate={selectedDate}
        onSelect={onSelect}
        month={monthName}
        year={currentYear}
        currentMonth={currentMonth}
        currentYear={currentYear}
        availability={availability}
      />
    </section>
  );
}
