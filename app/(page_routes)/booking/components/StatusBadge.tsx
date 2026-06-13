"use client";

import { CheckCircle, Clock, XCircle } from "lucide-react";

import { useBookingContext } from "../context/BookingContext";
import { bookingStatusLabel, bookingStatusTone } from "../lib/booking-status";

const STATUS_STYLES = {
  confirmed:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
} as const;

const STATUS_ICONS = {
  confirmed: CheckCircle,
  cancelled: XCircle,
  pending: Clock,
} as const;

export function StatusBadge({ status }: { status: string | null }) {
  const { lang } = useBookingContext();
  const tone = bookingStatusTone(status);
  const Icon = STATUS_ICONS[tone];

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_STYLES[tone]}`}>
      <Icon size={12} />
      {bookingStatusLabel(status, lang)}
    </span>
  );
}

