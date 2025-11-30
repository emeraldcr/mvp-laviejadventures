"use client";

import React, { useState, JSX } from "react";

import CalendarSection from "@/app/components/sections/CalendarSection";
import ReservationSection from "@/app/components/sections/ReservationSection";
import DynamicHeroHeader from "@/app/components/sections/DynamicHeroHeader";
import { CalendarProvider, useCalendarContext } from "@/app/context/CalendarContext";

function HomeContent(): JSX.Element {
  const {
    currentMonth,
    currentYear,
    selectedDate,
    availability,
    setSelectedDate,
  } = useCalendarContext();

  const [tickets, setTickets] = useState(1);

  const handleDaySelect = (day: number) => {
    if (day > 0 && availability?.[day] > 0) {
      setSelectedDate(day);
      setTickets(1);
    }
  };

  const monthNames = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-black flex justify-center py-6 px-3 sm:py-10 sm:px-4">
      <div className="w-full max-w-5xl bg-white dark:bg-zinc-950 rounded-2xl shadow-2xl p-5 sm:p-8 lg:p-10 border border-zinc-200 dark:border-zinc-800">
        <DynamicHeroHeader />

        <CalendarSection
          selectedDate={selectedDate}
          onSelect={handleDaySelect}
          monthName={monthNames[currentMonth]}
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

export default function Home(): JSX.Element {
  return (
    <CalendarProvider>
      <HomeContent />
    </CalendarProvider>
  );
}
