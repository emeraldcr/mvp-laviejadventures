"use client";

import { useMemo, useState } from "react";

const MONTH_NAMES = [
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

const DAY_LABELS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

export default function useCalendar() {
  const today = new Date();

  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const daysInMonth = useMemo(
    () => new Date(currentYear, currentMonth + 1, 0).getDate(),
    [currentMonth, currentYear]
  );

  const firstDayOfMonth = useMemo(
    () => new Date(currentYear, currentMonth, 1).getDay(),
    [currentMonth, currentYear]
  );

  const calendarDays = useMemo(() => {
    const days: (number | null)[] = [];
    for (let i = 0; i < firstDayOfMonth; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(d);
    return days;
  }, [daysInMonth, firstDayOfMonth]);

  const changeMonth = (delta: number) => {
    const newDate = new Date(currentYear, currentMonth + delta, 1);
    setCurrentMonth(newDate.getMonth());
    setCurrentYear(newDate.getFullYear());
    setSelectedDate(null);
  };

  return {
    selectedDate,
    setSelectedDate,
    monthNames: MONTH_NAMES,
    dayLabels: DAY_LABELS,
    currentMonth,
    currentYear,
    calendarDays,
    changeMonth,
  };
}
