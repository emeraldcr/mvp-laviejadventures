"use client";

import { useMemo } from "react";

import { isUpcoming } from "@/lib/helpers/utils";

import type { Booking } from "../types";

export function useBookingGroups(bookings: Booking[]) {
  return useMemo(() => {
    const upcoming: Booking[] = [];
    const past: Booking[] = [];

    for (const booking of bookings) {
      if (isUpcoming(booking.date)) {
        upcoming.push(booking);
      } else {
        past.push(booking);
      }
    }

    return { upcoming, past };
  }, [bookings]);
}

