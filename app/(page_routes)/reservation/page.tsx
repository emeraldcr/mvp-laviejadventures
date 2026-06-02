"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useSyncExternalStore } from "react";
import { useLanguage } from "@/lib/LanguageContext";
import PaymentCheckoutContent from "@/app/components/reservation/PaymentCheckoutContent";
import type { OrderDetails } from "@/lib/types/index";
import { translations } from "@/lib/translations";

const RESERVATION_RETURN_KEY = "reservationReturnPath";

const subscribeToClientSnapshot = () => () => {};

const getClientReadySnapshot = () => true;

const getServerReadySnapshot = () => false;

const getStoredOrderDetailsSnapshot = (): string | null => {
  if (typeof window === "undefined") {
    return null;
  }

  return sessionStorage.getItem("reservationOrderDetails");
};

const getServerOrderDetailsSnapshot = () => null;

const parseStoredOrderDetails = (stored: string | null): OrderDetails | null => {
  if (!stored) return null;

  try {
    return JSON.parse(stored) as OrderDetails;
  } catch {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("reservationOrderDetails");
    }
    return null;
  }
};


const getReservationReturnPathSnapshot = (): string => {
  if (typeof window === "undefined") {
    return "/#booking";
  }

  const returnPath = sessionStorage.getItem(RESERVATION_RETURN_KEY);
  if (!returnPath || !returnPath.startsWith("/")) {
    return "/#booking";
  }

  return returnPath;
};

const getServerReservationReturnPathSnapshot = () => "/#booking";


const getReturnHref = (returnPath: string): string => {
  if (returnPath === "/ai") {
    return "/ai?from=reservation";
  }

  return returnPath;
};

export default function ReservationPage() {
  const { lang, toggle } = useLanguage();
  const tr = translations[lang];
  const navTr = tr.nav;
  const paymentTr = tr.payment;
  const router = useRouter();
  const isReservationLoaded = useSyncExternalStore(
    subscribeToClientSnapshot,
    getClientReadySnapshot,
    getServerReadySnapshot,
  );
  const storedOrderDetails = useSyncExternalStore(
    subscribeToClientSnapshot,
    getStoredOrderDetailsSnapshot,
    getServerOrderDetailsSnapshot,
  );
  const returnPath = useSyncExternalStore(
    subscribeToClientSnapshot,
    getReservationReturnPathSnapshot,
    getServerReservationReturnPathSnapshot,
  );
  const orderDetails = useMemo(() => parseStoredOrderDetails(storedOrderDetails), [storedOrderDetails]);
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
            <Link href="/tours" className="transition-colors hover:text-white">{navTr.tours}</Link>
            <Link href="/galeria" className="transition-colors hover:text-white">{navTr.gallery}</Link>
            <Link href="/ai" className="transition-colors hover:text-white">AI</Link>
            <Link
              href="/#booking"
              className="rounded-full border border-teal-300/40 bg-teal-400/10 px-3 py-1 text-teal-200 transition hover:bg-teal-400/20"
            >
              {navTr.reserve}
            </Link>
            <button
              type="button"
              onClick={toggle}
              aria-label={lang === "es" ? "Switch to English" : "Cambiar a Espanol"}
              className="min-w-10 rounded-full border border-zinc-500/80 bg-white/10 px-3 py-1 text-center font-bold text-white transition hover:border-teal-200 hover:bg-teal-400/20"
            >
              {lang === "es" ? "EN" : "ES"}
            </button>
          </nav>
        </div>
      </header>

      <div className="mx-auto mt-8 w-full max-w-6xl px-4">
      <div className="rounded-2xl border border-zinc-700 bg-zinc-900/80 p-5 shadow-2xl sm:p-7 lg:p-8">
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

        {!isReservationLoaded ? (
          <div className="flex min-h-[180px] items-center justify-center text-sm font-medium text-zinc-300" role="status">
            {paymentTr.loadingPaymentInfo}
          </div>
        ) : !orderDetails ? (
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
