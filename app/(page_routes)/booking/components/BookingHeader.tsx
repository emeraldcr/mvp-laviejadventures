"use client";

import { ArrowRight, LogOut, Mail, Sparkles, User } from "lucide-react";
import Link from "next/link";
import { signOut } from "next-auth/react";

import { useBookingContext } from "../context/BookingContext";
import { bookingCopy } from "../lib/booking-copy";

export function BookingHeader() {
  const { lang, userEmail, userName } = useBookingContext();

  return (
    <section className="rounded-3xl border border-emerald-100 bg-white/90 p-8 shadow-xl backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/90 md:p-10">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-3">
          <p className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1 text-sm font-semibold text-emerald-700 dark:border-emerald-800/70 dark:bg-emerald-900/20 dark:text-emerald-300">
            <Sparkles size={16} />
            {bookingCopy("welcome", lang)}
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white md:text-4xl">
            {bookingCopy("title", lang)}
          </h1>
          <div className="flex flex-col gap-1 text-sm text-zinc-500 dark:text-zinc-400">
            {userName && (
              <span className="flex items-center gap-1">
                <User size={14} /> {userName}
              </span>
            )}
            {userEmail && (
              <span className="flex items-center gap-1">
                <Mail size={14} /> {userEmail}
              </span>
            )}
          </div>
        </div>

        <div className="grid w-full gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900 md:max-w-xs">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-center text-sm font-semibold text-white shadow-lg shadow-emerald-800/20 transition hover:bg-emerald-700"
          >
            {bookingCopy("bookNewTour", lang)}
            <ArrowRight size={16} />
          </Link>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
          >
            <LogOut size={16} />
            {bookingCopy("signOut", lang)}
          </button>
        </div>
      </div>
    </section>
  );
}

