"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";

import { useLanguage } from "@/lib/LanguageContext";

import { useBookingGroups } from "../hooks/useBookingGroups";
import type { Booking, BookingClientProps } from "../types";

type BookingContextValue = {
  bookings: Booking[];
  upcoming: Booking[];
  past: Booking[];
  hasBookings: boolean;
  lang: string;
  userName: string | null;
  userEmail: string | null;
};

const BookingContext = createContext<BookingContextValue | null>(null);

type BookingProviderProps = BookingClientProps & {
  children: ReactNode;
};

export function BookingProvider({ bookings, userName, userEmail, children }: BookingProviderProps) {
  const { lang } = useLanguage();
  const { upcoming, past } = useBookingGroups(bookings);
  const value = useMemo(
    () => ({
      bookings,
      upcoming,
      past,
      hasBookings: bookings.length > 0,
      lang,
      userName,
      userEmail,
    }),
    [bookings, lang, past, upcoming, userEmail, userName]
  );

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}

export function useBookingContext() {
  const context = useContext(BookingContext);

  if (!context) {
    throw new Error("useBookingContext must be used inside BookingProvider.");
  }

  return context;
}

