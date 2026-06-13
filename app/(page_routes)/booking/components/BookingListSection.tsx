"use client";

import { CalendarClock, CalendarDays } from "lucide-react";

import { useBookingContext } from "../context/BookingContext";
import { bookingCopy } from "../lib/booking-copy";
import type { BookingSectionVariant } from "../types";
import { BookingCard } from "./BookingCard";

const SECTION_CONFIG = {
  upcoming: {
    icon: CalendarDays,
    titleKey: "upcoming",
    emptyKey: "noUpcoming",
    countClass: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  },
  past: {
    icon: CalendarClock,
    titleKey: "past",
    emptyKey: "noPast",
    countClass: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
  },
} as const;

export function BookingListSection({ variant }: { variant: BookingSectionVariant }) {
  const { lang, past, upcoming } = useBookingContext();
  const bookings = variant === "upcoming" ? upcoming : past;
  const config = SECTION_CONFIG[variant];
  const Icon = config.icon;

  return (
    <article className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-zinc-900 dark:text-white">
        <Icon size={20} className="text-emerald-600" />
        {bookingCopy(config.titleKey, lang)}
        <span className={`ml-auto rounded-full px-2.5 py-0.5 text-xs font-bold ${config.countClass}`}>
          {bookings.length}
        </span>
      </h2>
      {bookings.length === 0 ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{bookingCopy(config.emptyKey, lang)}</p>
      ) : (
        <ul className="space-y-3">
          {bookings.map((booking) => (
            <BookingCard key={booking.id} booking={booking} />
          ))}
        </ul>
      )}
    </article>
  );
}

