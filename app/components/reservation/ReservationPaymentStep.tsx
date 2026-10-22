"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { OrderDetails } from "@/lib/types/index";
import { useLanguage } from "@/lib/LanguageContext";
import { translations } from "@/lib/translations";
import PaymentCheckoutContent from "@/app/components/reservation/PaymentCheckoutContent";

const subscribeToClientSnapshot = () => () => {};
const getClientReadySnapshot = () => true;
const getServerReadySnapshot = () => false;
const getStoredOrderDetailsSnapshot = (): string | null =>
  typeof window === "undefined" ? null : sessionStorage.getItem("reservationOrderDetails");
const getServerOrderDetailsSnapshot = () => null;

function parseStoredOrderDetails(stored: string | null): OrderDetails | null {
  if (!stored) return null;
  try {
    return JSON.parse(stored) as OrderDetails;
  } catch {
    if (typeof window !== "undefined") sessionStorage.removeItem("reservationOrderDetails");
    return null;
  }
}

export default function ReservationPaymentStep() {
  const { lang } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const resumeToken = searchParams.get("resume");
  const paymentTr = translations[lang].payment;
  const [resumeDraft, setResumeDraft] = useState<OrderDetails | null>(null);
  const [isResumeLoading, setIsResumeLoading] = useState(Boolean(resumeToken));
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

  useEffect(() => {
    if (!resumeToken) {
      setResumeDraft(null);
      setIsResumeLoading(false);
      return;
    }

    let mounted = true;
    setIsResumeLoading(true);
    fetch(`/api/reservation/draft?token=${encodeURIComponent(resumeToken)}`, { cache: "no-store" })
      .then((response) => response.json().then((data) => ({ ok: response.ok, data })))
      .then(({ ok, data }) => {
        if (!mounted) return;
        setResumeDraft(ok && data?.success ? parseStoredOrderDetails(JSON.stringify(data.orderDetails)) : null);
        setIsResumeLoading(false);
      })
      .catch(() => {
        if (mounted) {
          setResumeDraft(null);
          setIsResumeLoading(false);
        }
      });

    return () => { mounted = false; };
  }, [resumeToken]);

  const orderDetails = useMemo(
    () => (resumeToken ? resumeDraft : parseStoredOrderDetails(storedOrderDetails)),
    [resumeDraft, resumeToken, storedOrderDetails],
  );

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-10 pt-28 sm:px-6 md:pb-16 md:pt-32 lg:px-8">
      <div className="mb-6">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-300">{paymentTr.stepLabel}</p>
        <h1 className="mt-2 font-display text-3xl font-black tracking-tight text-stone-950 dark:text-stone-50 sm:text-4xl">
          {lang === "es" ? "Pago de su reserva" : "Pay for your booking"}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-stone-600 dark:text-stone-300">
          {lang === "es" ? "Revise sus datos, elija cómo pagar y reciba su voucher." : "Review your details, choose how to pay, and receive your voucher."}
        </p>
      </div>
      <div className="rounded-[1.75rem] border border-stone-200 bg-white/80 p-4 shadow-[0_24px_70px_rgba(30,24,16,0.1)] backdrop-blur-sm dark:border-white/10 dark:bg-stone-950/70 sm:p-6 lg:p-8">
        {!isReservationLoaded || isResumeLoading ? (
          <div className="flex min-h-[180px] items-center justify-center text-sm font-medium text-stone-500 dark:text-stone-300" role="status">{paymentTr.loadingPaymentInfo}</div>
        ) : !orderDetails ? (
          <div className="space-y-4 text-stone-600 dark:text-stone-300">
            <p>{paymentTr.noActiveReservation}</p>
            <button type="button" onClick={() => router.push("/reservar")} className="rounded-full bg-[#00C4B0] px-5 py-2.5 font-black text-[#17211f] transition hover:bg-emerald-300">{paymentTr.goToBooking}</button>
          </div>
        ) : <PaymentCheckoutContent orderDetails={orderDetails} onSuccess={() => undefined} />}
      </div>
    </div>
  );
}
