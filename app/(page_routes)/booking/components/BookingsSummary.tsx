"use client";

import { useBookingContext } from "../context/BookingContext";
import { BookingListSection } from "./BookingListSection";
import { EmptyBookings } from "./EmptyBookings";

export function BookingsSummary() {
  const { hasBookings } = useBookingContext();

  if (!hasBookings) {
    return <EmptyBookings />;
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <BookingListSection variant="upcoming" />
      <BookingListSection variant="past" />
    </div>
  );
}

