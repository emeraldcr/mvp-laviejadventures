// page/sections/CalendarSection.tsx (assuming based on import paths)

"use client";

import React from "react";
import Calendar from "@/app/components/calendar/Calendar";
import { AvailabilityMap } from "@/lib/types"; // Assuming types are in lib/types.ts

type Props = {
  calendarDays: (number | null)[];
  dayLabels: string[];
  selectedDate: number | null;
  month: string;
  year: number;
  onSelect: (day: number) => void;
  onPrev: () => void;
  onNext: () => void;
  currentMonth: number; // NEW: For date calculations in CalendarDay
  currentYear: number; // NEW: For date calculations in CalendarDay
  availability: AvailabilityMap; // NEW: Dynamic availability for the displayed month
};

export default function CalendarSection({
  calendarDays,
  dayLabels,
  selectedDate,
  month,
  year,
  onSelect,
  onPrev,
  onNext,
  currentMonth,
  currentYear,
  availability,
}: Props) {
  return (
    <Calendar
      calendarDays={calendarDays}
      dayLabels={dayLabels}
      selectedDate={selectedDate}
      onSelect={onSelect}
      month={month}
      year={year}
      onPrev={onPrev}
      onNext={onNext}
      currentMonth={currentMonth} // NEW: Pass down
      currentYear={currentYear} // NEW: Pass down
      availability={availability} // NEW: Pass down
    />
  );
}