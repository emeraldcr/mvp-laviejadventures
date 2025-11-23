"use client";

import React, { useState } from "react";

import CalendarSection from "@/app/components/sections/CalendarSection";
import ReservationSection from "@/app/components/sections/ReservationSection";
import PaymentModal from "@/app/components/reservation/PaymentModal";
import useCalendar from "@/app/hooks/useCalendar";
import { generateAvailability } from "@/lib/availability"; 
import DynamicHeroHeader from "@/app/components/sections/DynamicHeroHeader";

export default function Home() {
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
  const [showModal, setShowModal] = useState(false);

  const availability = generateAvailability(currentYear, currentMonth); // NEW: Compute dynamically based on displayed month/year

  const handleDaySelect = (day: number) => {
    if (availability[day] > 0) { // CHANGED: Use dynamic availability
      setSelectedDate(day);
      setTickets(1);
    }
  };

  const handleReserve = () => {
    if (selectedDate) setShowModal(true);
  };

  const handleConfirmPayment = (data: { name: string; email: string }) => {
    alert(
      `Reserva procesada:\n\n${data.name}\n${data.email}\nTickets: ${tickets}`
    );
    setShowModal(false);
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
          currentMonth={currentMonth} // NEW: Pass for date calculations in CalendarDay
          currentYear={currentYear} // NEW: Pass for date calculations in CalendarDay
          availability={availability} // NEW: Pass dynamic availability to Calendar (for CalendarDay slots)
        />

        <ReservationSection
          selectedDate={selectedDate}
          currentMonth={currentMonth}
          monthName={monthNames[currentMonth]}
          tickets={tickets}
          setTickets={setTickets}
          onReserve={handleReserve}
          availability={availability} // NEW: Pass dynamic availability for max tickets, etc.
          currentYear={currentYear} // NEW: Pass for full date if needed
        />
      </div>

      {showModal && (
        <PaymentModal
          tickets={tickets}
          date={`${selectedDate} de ${monthNames[currentMonth]} ${currentYear}`} // NEW: Optionally add year for clarity
          onClose={() => setShowModal(false)}
          onConfirm={handleConfirmPayment}
        />
      )}
    </main>
  );
}