"use client";

import { useCallback, useEffect, useRef } from "react";
import { useCalendarContext } from "@/lib/CalendarContext";
import Calendar from "@/app/components/calendar/Calendar";
import { cn } from "@/lib/helpers/utils";
import { useLanguage } from "@/lib/LanguageContext";

type Props = {
  className?: string;
};

export default function CalendarSection({ className }: Props) {
  const {
    selectedDay,
    availabilityError,
    refreshAvailability,
  } = useCalendarContext();

  const { lang } = useLanguage();
  const previousSelectedDay = useRef(selectedDay);

  const scrollToDetails = useCallback(() => {
    const details = document.getElementById("reservation-details-card");
    if (!details) return;
    details.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  useEffect(() => {
    const dateChanged = selectedDay !== null && selectedDay !== previousSelectedDay.current;
    previousSelectedDay.current = selectedDay;
    if (!dateChanged || !window.matchMedia("(max-width: 1023px)").matches) return;

    const timer = window.setTimeout(scrollToDetails, 120);
    return () => window.clearTimeout(timer);
  }, [selectedDay, scrollToDetails]);

  return (
    <section className={cn("flex min-w-0 items-start overflow-hidden px-1 sm:px-2", className)}>
      <div className="min-w-0 w-full">
        <div>
          {availabilityError && (
            <div
              className="mx-2 mt-3 flex items-center justify-between gap-3 rounded-xl border border-amber-300 bg-amber-50 px-3 py-3 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950/30 dark:text-amber-200 sm:mx-4"
              role="alert"
            >
              <span className="font-semibold">{availabilityError}</span>
              <button
                type="button"
                onClick={refreshAvailability}
                className="shrink-0 rounded-lg border border-current px-3 py-2 text-xs font-black"
              >
                {lang === "es" ? "Reintentar" : "Retry"}
              </button>
            </div>
          )}
          <div className="w-full">
            <Calendar />
          </div>
        </div>
      </div>
    </section>
  );
}
