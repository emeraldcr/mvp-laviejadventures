"use client";

import { useCalendarContext } from "@/app/context/CalendarContext";
import ReservationDetails from "@/app/components/reservation/ReservationDetails";
import { useLanguage } from "@/app/context/LanguageContext";
import { translations } from "@/lib/translations";
import { useRouter, useSearchParams } from "next/navigation";
import { useReservationData, DEFAULT_BOOKABLE_TOUR } from "@/app/hooks/useReservationData";

type OrderPayload = {
  name: string;
  email: string;
  phone: string;
  tickets: number;
  total: number;
  date: string;
  tourTime: string;
  tourPackage: string;
  tourSlug: string;
  tourName: string;
  packagePrice: number;
};

type Props = {
  className?: string;
};

const RESERVATION_RETURN_KEY = "reservationReturnPath";

export default function ReservationSection({ className }: Props) {
  const {
    selectedDay,
    currentMonth,
    currentYear,
    tickets,
    setTickets,
    availability,
  } = useCalendarContext();

  const { lang } = useLanguage();
  const tr = translations[lang];
  const { tourInfo, tours, ivaRatePercent } = useReservationData();
  const router = useRouter();
  const searchParams = useSearchParams();

  const requestedTourSlug = (searchParams.get("tour") ?? "").trim();
  const initialSelectedTourSlug = requestedTourSlug || DEFAULT_BOOKABLE_TOUR.slug;
  const hasPreselectedTour = requestedTourSlug.length > 0;

  const handleReserve = (data: OrderPayload) => {
    sessionStorage.setItem("reservationOrderDetails", JSON.stringify(data));
    sessionStorage.setItem(RESERVATION_RETURN_KEY, "/#booking");
    router.push("/reservation");
  };

  const monthName = new Intl.DateTimeFormat(lang === "es" ? "es-ES" : "en-US", {
    month: "long",
  }).format(new Date(currentYear, currentMonth, 1));

  if (!selectedDay) {
    return (
      <div className={className}>
        <div className="p-8 md:p-10 flex flex-col items-center justify-center text-center gap-5 min-h-[280px]">
          {/* Animated calendar icon */}
          <div className="relative flex items-center justify-center w-16 h-16">
            <div className="absolute inset-0 rounded-2xl bg-teal-500/15 animate-ping opacity-60" style={{ animationDuration: "2.5s" }} />
            <div className="relative w-16 h-16 rounded-2xl bg-teal-500/12 border border-teal-500/25 flex items-center justify-center">
              <svg className="w-7 h-7 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
            </div>
          </div>

          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 mb-2">
              {tr.reservation.step}
            </p>
            <p className="text-base font-semibold text-zinc-200 mb-1">
              {tr.reservation.selectDateFirst}
            </p>
            <p className="text-sm text-zinc-500 max-w-[220px] leading-relaxed">
              {tr.calendar.noDate}
            </p>
          </div>

          {/* Arrow pointing left to calendar */}
          <div className="hidden lg:flex items-center gap-2 text-zinc-600 text-xs">
            <svg className="w-4 h-4 animate-bounce-x" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            <span>{tr.reservation.selectFromCalendar}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="reservation-details-card" className={className}>
      <ReservationDetails
        key={`reservation-${initialSelectedTourSlug}-${currentYear}-${currentMonth}-${selectedDay}`}
        selectedDate={selectedDay}
        currentMonth={currentMonth}
        monthName={monthName}
        tickets={tickets}
        setTickets={setTickets}
        onReserve={handleReserve}
        availability={availability}
        currentYear={currentYear}
        tourInfo={tourInfo}
        tours={tours}
        initialSelectedTourSlug={initialSelectedTourSlug}
        hasPreselectedTour={hasPreselectedTour}
        ivaRatePercent={ivaRatePercent}
      />
    </div>
  );
}
