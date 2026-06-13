"use client";

import DynamicHeroHeader from "@/app/components/sections/DynamicHeroHeader";

import { BookingHeader } from "./components/BookingHeader";
import { BookingsSummary } from "./components/BookingsSummary";
import { BookingProvider } from "./context/BookingContext";
import type { BookingClientProps } from "./types";

export function BookingClient(props: BookingClientProps) {
  return (
    <BookingProvider {...props}>
      <main className="min-h-screen bg-gradient-to-b from-emerald-50 via-zinc-50 to-white px-4 py-10 dark:from-black dark:via-zinc-950 dark:to-zinc-900">
        <DynamicHeroHeader />

        <div className="mx-auto w-full max-w-5xl space-y-6">
          <BookingHeader />
          <BookingsSummary />
        </div>
      </main>
    </BookingProvider>
  );
}
