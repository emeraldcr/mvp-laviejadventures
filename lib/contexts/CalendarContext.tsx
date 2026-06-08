"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { AvailabilityMap } from "@/lib/types/index";
import { generateAvailability } from "@/lib/helpers/availability";
import { useLanguage } from "@/lib/LanguageContext";
import { getCostaRicaDateParts, getMinBookableDateInCostaRica, toDateKey } from "@/lib/helpers/costa-rica-time";

type CalendarContextValue = {
  currentYear: number;
  currentMonth: number;
  monthLabel: string;
  availability: AvailabilityMap;
  selectedDay: number | null;
  selectedDate: Date | null;
  setSelectedDate: (date: Date | null) => void;
  tickets: number;
  setTickets: (count: number) => void;
  maxSlots: number;
  isPastDay: (day: number) => boolean;
  isToday: (day: number) => boolean;
  getSlotsForDay: (day: number) => number;
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
  selectedTourSlug?: string | null;
};

export function CalendarProvider({ children, selectedTourSlug }: Props) {
  const { lang } = useLanguage();

  const [currentMonth, setCurrentMonth] = useState(() => {
    const minBookable = getMinBookableDateInCostaRica();
    return minBookable.month - 1;
  });
  const [currentYear, setCurrentYear] = useState(() => {
    const minBookable = getMinBookableDateInCostaRica();
    return minBookable.year;
  });
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [tickets, setTicketsState] = useState<number>(1);
  const [availabilityOverrides, setAvailabilityOverrides] = useState<Partial<AvailabilityMap>>({});

  useEffect(() => {
    let cancelled = false;

    const loadAvailability = async () => {
      try {
        const params = new URLSearchParams({
          year: String(currentYear),
          month: String(currentMonth),
        });

        if (selectedTourSlug) {
          params.set("tourSlug", selectedTourSlug);
        }

        const res = await fetch(`/api/calendar/availability?${params.toString()}`);
        if (!res.ok) return;

        const data = (await res.json()) as { availability?: AvailabilityMap };
        if (!cancelled) {
          setAvailabilityOverrides(data.availability ?? {});
        }
      } catch (error) {
        console.error("Failed to load calendar availability:", error);
      }
    };

    loadAvailability();

    return () => {
      cancelled = true;
    };
  }, [currentMonth, currentYear, selectedTourSlug]);

  const availability: AvailabilityMap = useMemo(
    () => generateAvailability(currentYear, currentMonth, availabilityOverrides),
    [currentYear, currentMonth, availabilityOverrides]
  );

  const monthLabel = useMemo(
    () =>
      new Intl.DateTimeFormat(lang === "es" ? "es-ES" : "en-US", {
        month: "long",
      }).format(
        new Date(currentYear, currentMonth, 1)
      ),
    [currentYear, currentMonth, lang]
  );

  const maxSlots = useMemo(() => Math.max(0, ...Object.values(availability)), [availability]);

  const costaRicaToday = useMemo(() => getCostaRicaDateParts(), []);
  const minBookableDate = useMemo(() => getMinBookableDateInCostaRica(), []);
  const costaRicaTodayKey = useMemo(
    () => toDateKey(costaRicaToday.year, costaRicaToday.month, costaRicaToday.day),
    [costaRicaToday.day, costaRicaToday.month, costaRicaToday.year]
  );
  const minBookableDateKey = useMemo(
    () => toDateKey(minBookableDate.year, minBookableDate.month, minBookableDate.day),
    [minBookableDate.day, minBookableDate.month, minBookableDate.year]
  );

  const isPastDay = useCallback(
    (day: number) => {
      const dateKey = toDateKey(currentYear, currentMonth + 1, day);
      return dateKey < minBookableDateKey;
    },
    [currentMonth, currentYear, minBookableDateKey]
  );

  const isToday = useCallback(
    (day: number) => {
      const dateKey = toDateKey(currentYear, currentMonth + 1, day);
      return dateKey === costaRicaTodayKey;
    },
    [currentMonth, currentYear, costaRicaTodayKey]
  );

  const getSlotsForDay = useCallback((day: number) => availability[day] ?? 0, [availability]);

  const selectedDate = useMemo(
    () =>
      selectedDay != null
        ? new Date(currentYear, currentMonth, selectedDay)
        : null,
    [selectedDay, currentMonth, currentYear]
  );

  const selectDay = useCallback((day: number | null) => {
    setSelectedDay(day);
    setTicketsState(1);
  }, []);

  const setSelectedDate = useCallback((date: Date | null) => {
    if (!date) {
      selectDay(null);
      return;
    }

    const normalizedDate = new Date(date);
    normalizedDate.setHours(0, 0, 0, 0);

    const selectedDateKey = toDateKey(
      normalizedDate.getFullYear(),
      normalizedDate.getMonth() + 1,
      normalizedDate.getDate()
    );
    if (selectedDateKey < minBookableDateKey) {
      selectDay(null);
      return;
    }

    if (normalizedDate.getFullYear() !== currentYear || normalizedDate.getMonth() !== currentMonth) {
      setCurrentYear(normalizedDate.getFullYear());
      setCurrentMonth(normalizedDate.getMonth());
    }

    selectDay(normalizedDate.getDate());
  }, [currentYear, currentMonth, minBookableDateKey, selectDay]);

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
    setCurrentMonth(minBookableDate.month - 1);
    setCurrentYear(minBookableDate.year);
    const day = minBookableDate.day;
    const slots = availability[day] ?? 0;
    setSelectedDay(slots > 0 ? day : null);
    setTicketsState(1);
  }, [availability, minBookableDate.day, minBookableDate.month, minBookableDate.year]);

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
