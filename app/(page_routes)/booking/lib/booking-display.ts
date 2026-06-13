import type { Booking } from "../types";
import { defaultTourPackage } from "./booking-copy";

export function bookingTourPackage(booking: Booking, lang: string) {
  return booking.tourPackage ?? defaultTourPackage(lang);
}

export function bookingDateTime(booking: Booking) {
  if (!booking.date) return null;
  return booking.tourTime ? `${booking.date} - ${booking.tourTime}` : booking.date;
}

export function bookingAmount(booking: Booking) {
  if (booking.amount == null) return null;
  return `${booking.amount} ${booking.currency ?? "USD"}`;
}

