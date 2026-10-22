"use client";

import { useCallback, useEffect, useRef } from "react";
import { useCalendarContext } from "@/lib/CalendarContext";
import Calendar from "@/app/components/calendar/Calendar";
import { cn } from "@/lib/helpers/utils";
import { useLanguage } from "@/lib/LanguageContext";
import SafetyBookingNotice from "@/app/components/reservation/SafetyBookingNotice";

type Props = {
  className?: string;
};

export default function CalendarSection({ className }: Props) {
  const { selectedDay } = useCalendarContext();
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
          <SafetyBookingNotice lang={lang} className="mb-4" />
          <div className="w-full">
            <Calendar />
          </div>
        </div>
      </div>
    </section>
  );
}
