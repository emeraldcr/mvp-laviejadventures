"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/app/context/LanguageContext";
import PaymentCheckoutContent from "@/app/components/reservation/PaymentCheckoutContent";
import type { OrderDetails } from "@/lib/types";
import { translations } from "@/lib/translations";

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

export default function ReservationPage() {
  const { lang } = useLanguage();
  const tr = translations[lang];
  const paymentTr = tr.payment;
  const router = useRouter();
  const orderDetails = getStoredOrderDetails();

  return (
    <main className="min-h-screen bg-zinc-950 py-16 px-4">
      <div className="mx-auto w-full max-w-3xl rounded-2xl border border-zinc-700 bg-zinc-900/80 p-6 sm:p-8 shadow-2xl">
        <div className="mb-6 flex items-center justify-between gap-3">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">{paymentTr.title}</h1>
          <Link
            href="/#booking"
            className="rounded-lg border border-zinc-600 px-3 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-800"
          >
            {lang === "es" ? "Volver" : "Back"}
          </Link>
        </div>

        {!orderDetails ? (
          <div className="space-y-4 text-zinc-300">
            <p>{lang === "es" ? "No hay una reserva activa para pagar." : "There is no active reservation to pay for."}</p>
            <button
              onClick={() => router.push("/#booking")}
              className="rounded-lg bg-teal-600 px-4 py-2 font-semibold text-white hover:bg-teal-500"
            >
              {lang === "es" ? "Ir a reservar" : "Go to booking"}
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
