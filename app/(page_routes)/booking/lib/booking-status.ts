import { CANCELLED_BOOKING_STATUSES, CONFIRMED_BOOKING_STATUSES } from "../constants";
import { bookingCopy } from "./booking-copy";

export type BookingStatusTone = "confirmed" | "cancelled" | "pending";

export function normalizeBookingStatus(status: string | null) {
  return (status ?? "").toUpperCase();
}

export function bookingStatusTone(status: string | null): BookingStatusTone {
  const normalizedStatus = normalizeBookingStatus(status);

  if (CONFIRMED_BOOKING_STATUSES.has(normalizedStatus)) return "confirmed";
  if (CANCELLED_BOOKING_STATUSES.has(normalizedStatus)) return "cancelled";
  return "pending";
}

export function bookingStatusLabel(status: string | null, lang: string) {
  const tone = bookingStatusTone(status);

  if (tone === "confirmed") return bookingCopy("confirmed", lang);
  if (tone === "cancelled") return bookingCopy("cancelled", lang);
  return status ?? bookingCopy("pending", lang);
}

