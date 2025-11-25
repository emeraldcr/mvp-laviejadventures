"use client";

import React, { useState, useMemo, JSX } from "react";

import CalendarSection from "@/app/components/sections/CalendarSection";
import ReservationSection from "@/app/components/sections/ReservationSection";
import useCalendar from "@/app/hooks/useCalendar";
import { generateAvailability } from "@/lib/availability";
import DynamicHeroHeader from "@/app/components/sections/DynamicHeroHeader";

export default function Home(): JSX.Element {
  const {
    calendarDays,
    dayLabels,
    monthNames,
    currentMonth,
    currentYear,
    selectedDate,
    setSelectedDate,
    changeMonth,
  } = useCalendar();

  const [tickets, setTickets] = useState(1);

  const availability = useMemo(
    () => generateAvailability(currentYear, currentMonth),
    [currentYear, currentMonth]
  );

  const handleDaySelect = (day: number) => {
    if (day > 0 && availability?.[day] > 0) {
      setSelectedDate(day);
      setTickets(1);
    }
  };

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-black flex justify-center py-10 px-4">
      <div className="w-full max-w-5xl bg-white dark:bg-zinc-950 rounded-2xl shadow-2xl p-10 border border-zinc-200 dark:border-zinc-800">

        <DynamicHeroHeader />

        <CalendarSection
          calendarDays={calendarDays}
          dayLabels={dayLabels}
          month={monthNames[currentMonth]}
          year={currentYear}
          selectedDate={selectedDate}
          onSelect={handleDaySelect}
          onPrev={() => changeMonth(-1)}
          onNext={() => changeMonth(1)}
          currentMonth={currentMonth}
          currentYear={currentYear}
          availability={availability}
        />

        <ReservationSection
          selectedDate={selectedDate}
          currentMonth={currentMonth}
          monthName={monthNames[currentMonth]}
          tickets={tickets}
          setTickets={setTickets}
          availability={availability}
          currentYear={currentYear}
        />
      </div>
    </main>
  );
}
