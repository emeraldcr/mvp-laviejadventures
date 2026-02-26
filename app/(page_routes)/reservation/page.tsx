"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { useLanguage } from "@/app/context/LanguageContext";
import PaymentCheckoutContent from "@/app/components/reservation/PaymentCheckoutContent";
import type { OrderDetails } from "@/types";
import { translations } from "@/lib/translations";

const RESERVATION_RETURN_KEY = "reservationReturnPath";

const getStoredOrderDetails = (): OrderDetails | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const stored = sessionStorage.getItem("reservationOrderDetails");
  if (!stored) {
    return null;
  }

  try {
    return JSON.parse(stored) as OrderDetails;
  } catch {
    sessionStorage.removeItem("reservationOrderDetails");
    return null;
  }
};


const getReservationReturnPath = (): string => {
  if (typeof window === "undefined") {
    return "/#booking";
  }

  const returnPath = sessionStorage.getItem(RESERVATION_RETURN_KEY);
  if (!returnPath || !returnPath.startsWith("/")) {
    return "/#booking";
  }

  return returnPath;
};

export default function ReservationPage() {
  const { lang } = useLanguage();
  const tr = translations[lang];
  const paymentTr = tr.payment;
  const router = useRouter();
  const orderDetails = getStoredOrderDetails();
  const returnPath = useMemo(() => getReservationReturnPath(), []);

  return (
    <main className="min-h-screen bg-zinc-950 py-16 px-4">
      <div className="mx-auto w-full max-w-3xl rounded-2xl border border-zinc-700 bg-zinc-900/80 p-6 sm:p-8 shadow-2xl">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              {paymentTr.stepLabel}
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">{paymentTr.title}</h1>
          </div>
          <Link
            href={returnPath}
            className="rounded-lg border border-zinc-600 px-3 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-800"
          >
            {paymentTr.backBtn}
          </Link>
        </div>

        {!orderDetails ? (
          <div className="space-y-4 text-zinc-300">
            <p>{paymentTr.noActiveReservation}</p>
            <button
              onClick={() => router.push(returnPath)}
              className="rounded-lg bg-teal-600 px-4 py-2 font-semibold text-white hover:bg-teal-500"
            >
              {paymentTr.goToBooking}
            </button>
          </div>
        ) : (
          <PaymentCheckoutContent
            orderDetails={orderDetails}
            onSuccess={(order) => {
              console.log("PAYPAL SUCCESS:", order);
            }}
          />
        )}
      </div>
    </main>
  );
}
