"use client";

import { ArrowRight, CalendarDays } from "lucide-react";
import Link from "next/link";

import { useBookingContext } from "../context/BookingContext";
import { bookingCopy } from "../lib/booking-copy";

export function EmptyBookings() {
  const { lang } = useBookingContext();

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-10 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <CalendarDays size={40} className="mx-auto mb-4 text-zinc-300 dark:text-zinc-600" />
      <p className="text-zinc-600 dark:text-zinc-400">{bookingCopy("noBookings", lang)}</p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
      >
        {bookingCopy("browseTours", lang)}
        <ArrowRight size={16} />
      </Link>
    </section>
  );
}

