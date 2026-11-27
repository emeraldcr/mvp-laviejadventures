"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { OrderDetails } from "@/lib/booking/types";
import { useLanguage } from "@/lib/site/contexts/LanguageContext";
import { translations } from "@/lib/site/translations";
import { localizeHref } from "@/lib/site/i18n";
import PaymentCheckoutContent from "@/app/components/reservation/PaymentCheckoutContent";
import { BUSINESS_WHATSAPP_URL } from "@/lib/site/config";
import Link from "next/link";

const subscribeToClientSnapshot = () => () => {};
const getClientReadySnapshot = () => true;
const getServerReadySnapshot = () => false;
const getStoredOrderDetailsSnapshot = (): string | null => {
  try { return typeof window === "undefined" ? null : sessionStorage.getItem("reservationOrderDetails"); }
  catch { return null; }
};
const getServerOrderDetailsSnapshot = () => null;

function parseStoredOrderDetails(stored: string | null): OrderDetails | null {
  if (!stored) return null;
  try {
    return JSON.parse(stored) as OrderDetails;
  } catch {
    try { if (typeof window !== "undefined") sessionStorage.removeItem("reservationOrderDetails"); } catch { /* Storage is optional. */ }
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
  const [resumeError, setResumeError] = useState<"expired" | "temporary" | "paid" | null>(null);
  const [paidOrder, setPaidOrder] = useState<{ id: string | null; confirmed: boolean } | null>(null);
  const [retryVersion, setRetryVersion] = useState(0);
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
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20_000);
    setIsResumeLoading(true);
    setResumeError(null);
    setPaidOrder(null);
    setResumeDraft(null);
    fetch(`/api/reservation/draft?token=${encodeURIComponent(resumeToken)}`, { cache: "no-store", signal: controller.signal })
      .then((response) => response.json().then((data) => ({ ok: response.ok, status: response.status, data })))
      .then(({ ok, status, data }) => {
        if (!mounted) return;
        if (status === 409 && data?.code === "payment_received") {
          setPaidOrder({ id: typeof data.orderId === "string" && /^[A-Z0-9]{10,32}$/.test(data.orderId) ? data.orderId : null, confirmed: data.confirmed === true });
          setResumeError("paid");
        } else if (!ok || !data?.success || !data.orderDetails) {
          setResumeError(status === 404 ? "expired" : "temporary");
        } else {
          setResumeDraft(parseStoredOrderDetails(JSON.stringify(data.orderDetails)));
        }
        setIsResumeLoading(false);
      })
      .catch(() => {
        if (mounted) {
          setResumeDraft(null);
          setResumeError("temporary");
          setIsResumeLoading(false);
        }
      }).finally(() => clearTimeout(timeout));

    return () => { mounted = false; clearTimeout(timeout); controller.abort(); };
  }, [resumeToken, retryVersion]);

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
            <p role="alert">{resumeError === "paid" ? (lang === "es" ? "Este intento ya registra un pago. No vuelva a pagar; revise su voucher o consulte al equipo." : "This booking attempt already has a payment. Do not pay again; check your voucher or contact the team.") : resumeError === "expired" ? (lang === "es" ? "Este enlace venció o no es válido. Si ya pagó, consulte al equipo antes de intentar otra vez." : "This link has expired or is invalid. If you already paid, contact the team before trying again.") : resumeError === "temporary" ? (lang === "es" ? "No pudimos cargar la reserva. Intente de nuevo; si ya pagó, consulte al equipo antes de repetir el pago." : "We couldn't load the booking. Try again; if you already paid, contact the team before paying again.") : paymentTr.noActiveReservation}</p>
            {paidOrder?.id && <p className="break-all text-sm">{lang === "es" ? "Orden PayPal" : "PayPal order"}: {paidOrder.id}</p>}
            <div className="flex flex-wrap gap-3">
              {resumeError === "temporary" && <button type="button" onClick={() => setRetryVersion((value) => value + 1)} className="rounded-full border px-5 py-2.5 font-bold">{lang === "es" ? "Reintentar" : "Try again"}</button>}
              {paidOrder?.confirmed && paidOrder.id && <Link href={localizeHref(`/reservar/voucher?orderId=${encodeURIComponent(paidOrder.id)}`, lang)} className="rounded-full border px-5 py-2.5 font-bold">{lang === "es" ? "Ver voucher" : "View voucher"}</Link>}
              <a href={`${BUSINESS_WHATSAPP_URL}?text=${encodeURIComponent(lang === "es" ? `Hola, necesito ayuda con mi reserva${paidOrder?.id ? ` y la orden PayPal ${paidOrder.id}` : ""}.` : `Hello, I need help with my booking${paidOrder?.id ? ` and PayPal order ${paidOrder.id}` : ""}.`)}`} target="_blank" rel="noopener noreferrer" className="rounded-full border px-5 py-2.5 font-bold">WhatsApp</a>
              {resumeError !== "paid" && <button type="button" onClick={() => router.push(localizeHref("/reservar", lang))} className="rounded-full bg-[#00C4B0] px-5 py-2.5 font-black text-[#17211f] transition hover:bg-emerald-300">{paymentTr.goToBooking}</button>}
            </div>
          </div>
        ) : <PaymentCheckoutContent orderDetails={orderDetails} onSuccess={() => undefined} />}
      </div>
    </div>
  );
}
