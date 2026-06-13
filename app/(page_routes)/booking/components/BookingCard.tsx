"use client";

import { CreditCard, Hash, Phone, Ticket } from "lucide-react";

import { useBookingContext } from "../context/BookingContext";
import { bookingCopy } from "../lib/booking-copy";
import { bookingAmount, bookingDateTime, bookingTourPackage } from "../lib/booking-display";
import type { Booking } from "../types";
import { StatusBadge } from "./StatusBadge";

export function BookingCard({ booking }: { booking: Booking }) {
  const { lang } = useBookingContext();
  const dateTime = bookingDateTime(booking);
  const amount = bookingAmount(booking);

  return (
    <li className="space-y-3 rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-zinc-900 dark:text-white">{bookingTourPackage(booking, lang)}</p>
          {dateTime && <p className="text-sm text-zinc-500 dark:text-zinc-400">{dateTime}</p>}
        </div>
        <StatusBadge status={booking.status} />
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs text-zinc-600 dark:text-zinc-400">
        {booking.tickets != null && (
          <span className="flex items-center gap-1">
            <Ticket size={12} className="text-emerald-600" />
            {booking.tickets} {bookingCopy("ticketLabel", lang)}
          </span>
        )}
        {amount && (
          <span className="flex items-center gap-1">
            <CreditCard size={12} className="text-emerald-600" />
            {amount}
          </span>
        )}
        {booking.phone && (
          <span className="flex items-center gap-1">
            <Phone size={12} className="text-emerald-600" />
            {booking.phone}
          </span>
        )}
        {booking.orderId && (
          <span className="col-span-2 flex items-center gap-1 truncate">
            <Hash size={12} className="shrink-0 text-emerald-600" />
            <span className="truncate">{booking.orderId}</span>
          </span>
        )}
      </div>
    </li>
  );
}

