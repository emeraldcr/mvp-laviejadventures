"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  ReactNode,
} from "react";
import { AvailabilityMap } from "@/lib/types";
import { generateAvailability } from "@/lib/availability";

type CalendarContextValue = {
  // calendar state
  currentYear: number;
  currentMonth: number;
  monthLabel: string;
  availability: AvailabilityMap;

  // selection
  selectedDay: number | null;
  selectedDate: Date | null;
  setSelectedDate: (date: Date | null) => void;

  // tickets for reservation
  tickets: number;
  setTickets: (count: number) => void;

  // helpers
  maxSlots: number;
  isPastDay: (day: number) => boolean;
  isToday: (day: number) => boolean;
  getSlotsForDay: (day: number) => number;

  // actions
  selectDay: (day: number | null) => void;
  nextMonth: () => void;
  prevMonth: () => void;
  goToToday: () => void;
  goToNextAvailableDay: () => void;
};

const CalendarContext = createContext<CalendarContextValue | null>(null);

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
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [tickets, setTicketsState] = useState<number>(1);

  const availability: AvailabilityMap = useMemo(
    () => generateAvailability(currentYear, currentMonth),
    [currentYear, currentMonth]
  );

  const monthLabel = useMemo(
    () =>
      new Intl.DateTimeFormat("es-ES", { month: "long" }).format(
        new Date(currentYear, currentMonth, 1)
      ),
    [currentYear, currentMonth]
  );

  const maxSlots = useMemo(
    () => Math.max(0, ...Object.values(availability)),
    [availability]
  );

  const isPastDay = useCallback(
    (day: number) => {
      const d = new Date(currentYear, currentMonth, day);
      d.setHours(0, 0, 0, 0);
      return d < today;
    },
    [currentMonth, currentYear, today]
  );

  const isToday = useCallback(
    (day: number) => {
      const d = new Date(currentYear, currentMonth, day);
      d.setHours(0, 0, 0, 0);
      return d.getTime() === today.getTime();
    },
    [currentMonth, currentYear, today]
  );

  const getSlotsForDay = useCallback(
    (day: number) => availability[day] ?? 0,
    [availability]
  );

  const selectedDate = useMemo(
    () =>
      selectedDay != null
        ? new Date(currentYear, currentMonth, selectedDay)
        : null,
    [selectedDay, currentMonth, currentYear]
  );

  const selectDay = useCallback((day: number | null) => {
    setSelectedDay(day);
    // reset tickets when changing date
    setTicketsState(1);
  }, []);

  const setSelectedDate = useCallback((date: Date | null) => {
    if (!date) {
      selectDay(null);
      return;
    }

    // Normalize the date to start of day
    const normalizedDate = new Date(date);
    normalizedDate.setHours(0, 0, 0, 0);

    // Check if it's in the current month/year; if not, navigate to that month/year first
    if (
      normalizedDate.getFullYear() !== currentYear ||
      normalizedDate.getMonth() !== currentMonth
    ) {
      setCurrentYear(normalizedDate.getFullYear());
      setCurrentMonth(normalizedDate.getMonth());
    }

    // Now select the day in the (possibly updated) current month
    selectDay(normalizedDate.getDate());
  }, [currentYear, currentMonth, selectDay]);

  const setTickets = useCallback((count: number) => {
    setTicketsState(Math.max(1, count));
  }, []);

  const changeMonth = useCallback(
    (delta: number) => {
      const d = new Date(currentYear, currentMonth + delta, 1);
      d.setHours(0, 0, 0, 0);
      setCurrentMonth(d.getMonth());
      setCurrentYear(d.getFullYear());
      setSelectedDay(null);
      setTicketsState(1);
    },
    [currentMonth, currentYear]
  );

  const nextMonth = useCallback(() => changeMonth(1), [changeMonth]);
  const prevMonth = useCallback(() => changeMonth(-1), [changeMonth]);

  const goToToday = useCallback(() => {
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
    const day = today.getDate();
    const slots = availability[day] ?? 0;
    setSelectedDay(slots > 0 ? day : null);
    setTicketsState(1);
  }, [availability, today]);

  const goToNextAvailableDay = useCallback(() => {
    const candidates = Object.keys(availability)
      .map(Number)
      .filter((d) => availability[d] > 0 && !isPastDay(d))
      .sort((a, b) => a - b);

    if (!candidates.length) return;
    setSelectedDay(candidates[0]);
    setTicketsState(1);
  }, [availability, isPastDay]);

  const value: CalendarContextValue = {
    currentYear,
    currentMonth,
    monthLabel,
    availability,
    selectedDay,
    selectedDate,
    setSelectedDate,
    tickets,
    setTickets,
    maxSlots,
    isPastDay,
    isToday,
    getSlotsForDay,
    selectDay,
    nextMonth,
    prevMonth,
    goToToday,
    goToNextAvailableDay,
  };

  return (
    <CalendarContext.Provider value={value}>
      {children}
    </CalendarContext.Provider>
  );
}