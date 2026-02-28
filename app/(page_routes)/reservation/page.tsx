"use client";

import Image from "next/image";
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


const getReturnHref = (returnPath: string): string => {
  if (returnPath === "/ai") {
    return "/ai?from=reservation";
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
  const returnHref = useMemo(() => getReturnHref(returnPath), [returnPath]);

  return (
    <main className="min-h-screen bg-zinc-950 pb-16">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-teal-950/80 backdrop-blur-2xl shadow-[0_10px_40px_rgba(0,0,0,0.6)]">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 md:px-8">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logo2.jpg"
              alt="La Vieja Adventures Logo"
              width={40}
              height={40}
              className="rounded-md object-cover shadow-md shadow-black/30"
              priority
            />
            <span className="hidden text-sm font-black tracking-tight text-white sm:inline md:text-base">
              La Vieja Adventures
            </span>
          </Link>

          <nav className="flex items-center gap-2 text-xs font-semibold text-zinc-200 md:gap-4 md:text-sm">
            <Link href="/tours" className="transition-colors hover:text-white">Tours</Link>
            <Link href="/galeria" className="transition-colors hover:text-white">Galería</Link>
            <Link href="/ai" className="transition-colors hover:text-white">AI</Link>
            <Link
              href="/#booking"
              className="rounded-full border border-teal-300/40 bg-teal-400/10 px-3 py-1 text-teal-200 transition hover:bg-teal-400/20"
            >
              Reservar
            </Link>
          </nav>
        </div>
      </header>

      <div className="mx-auto mt-8 w-full max-w-3xl px-4">
      <div className="rounded-2xl border border-zinc-700 bg-zinc-900/80 p-6 sm:p-8 shadow-2xl">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              {paymentTr.stepLabel}
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">{paymentTr.title}</h1>
          </div>
          <Link
            href={returnHref}
            className="rounded-lg border border-zinc-600 px-3 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-800"
          >
            {paymentTr.backBtn}
          </Link>
        </div>

        {!orderDetails ? (
          <div className="space-y-4 text-zinc-300">
            <p>{paymentTr.noActiveReservation}</p>
            <button
              onClick={() => router.push(returnHref)}
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
      </div>
    </main>
  );
}
