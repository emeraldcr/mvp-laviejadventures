"use client";

import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { AvailabilityMap } from "@/lib/types";
import { generateAvailability } from "@/lib/availability";

type CalendarContextValue = {
  currentYear: number;
  currentMonth: number;
  selectedDate: number | null;
  availability: AvailabilityMap;
  setSelectedDate: (day: number | null) => void;
  nextMonth: () => void;
  prevMonth: () => void;
};

const CalendarContext = createContext<CalendarContextValue | undefined>(
  undefined
);

export function useCalendarContext() {
  const ctx = useContext(CalendarContext);
  if (!ctx) {
    throw new Error("useCalendarContext must be used within CalendarProvider");
  }
  return ctx;
}

type Props = {
  children: ReactNode;
};

export function CalendarProvider({ children }: Props) {
  const today = useMemo(() => new Date(), []);
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDateState] = useState<number | null>(null);

  const availability = useMemo(
    () => generateAvailability(currentYear, currentMonth),
    [currentYear, currentMonth]
  );

  const setSelectedDate = useCallback((day: number | null) => {
    setSelectedDateState(day);
  }, []);

  const changeMonth = useCallback(
    (delta: number) => {
      const newDate = new Date(currentYear, currentMonth + delta, 1);
      setCurrentMonth(newDate.getMonth());
      setCurrentYear(newDate.getFullYear());
      setSelectedDateState(null);
    },
    [currentMonth, currentYear]
  );

  const nextMonth = useCallback(() => changeMonth(1), [changeMonth]);
  const prevMonth = useCallback(() => changeMonth(-1), [changeMonth]);

  const value = useMemo(
    () => ({
      currentYear,
      currentMonth,
      selectedDate,
      availability,
      setSelectedDate,
      nextMonth,
      prevMonth,
    }),
    [currentYear, currentMonth, selectedDate, availability, setSelectedDate, nextMonth, prevMonth]
  );

  return (
    <CalendarContext.Provider value={value}>
      {children}
    </CalendarContext.Provider>
  );
}
