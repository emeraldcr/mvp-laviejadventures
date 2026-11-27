"use client";

import { useCallback, useMemo, useState } from "react";
import type { OrderDetails } from "@/lib/booking/types";
import { translations } from "@/lib/site/translations";
import { useCheckoutQuote } from "./hooks/useCheckoutQuote";
import { usePayPalCheckout } from "./hooks/usePayPalCheckout";
import { BUSINESS_WHATSAPP_URL } from "@/lib/site/config";
import { trackAnalyticsEvent } from "@/lib/analytics/client";

export default function InlinePayPalCheckout({
  orderDetails,
  lang,
  onBack,
}: {
  orderDetails: OrderDetails;
  lang: "es" | "en";
  onBack: () => void;
}) {
  const tr = translations[lang].payment;
  const quote = useCheckoutQuote(orderDetails, lang);
  const [acceptedTotal, setAcceptedTotal] = useState<number | null>(null);
  const totalChanged = quote.synced && Math.round(quote.total * 100) !== Math.round(orderDetails.total * 100);
  const needsTotalAcceptance = totalChanged && acceptedTotal !== quote.total;
  const handleSuccess = useCallback(() => {}, []);
  const quotedOrderDetails = useMemo(
    () => ({
      ...orderDetails,
      total: quote.total,
      addonsPrice: quote.addonsPrice,
      addonsPricePerPerson: quote.addonsPricePerPerson,
      addonsBreakdown: quote.addonsBreakdown,
      transportQuote: quote.transportQuote,
    }),
    [
      orderDetails,
      quote.addonsBreakdown,
      quote.addonsPrice,
      quote.addonsPricePerPerson,
      quote.total,
      quote.transportQuote,
    ],
  );
  const { paypalRef, paypalLoadError, isPaypalLoading, retryPayPal, paymentError, isCapturing, pendingOrderId, retryCapture } = usePayPalCheckout({
    enabled: quote.synced && !quote.syncing && !quote.error && !needsTotalAcceptance,
    orderDetails: quotedOrderDetails,
    lang,
    errorMessage: tr.error,
    onSuccess: handleSuccess,
  });
  const supportMessage = pendingOrderId
    ? (lang === "es" ? `Hola, necesito ayuda para verificar mi pago. Orden PayPal: ${pendingOrderId}.` : `Hello, I need help checking my payment. PayPal order: ${pendingOrderId}.`)
    : (lang === "es" ? `Hola, quiero consultar disponibilidad y formas de pago para ${orderDetails.tourName}, fecha ${orderDetails.dateIso ?? orderDetails.date}, para ${orderDetails.tickets} personas.` : `Hello, I would like to ask about availability and payment options for ${orderDetails.tourName}, ${orderDetails.dateIso ?? orderDetails.date}, for ${orderDetails.tickets} guests.`);
  const supportHref = `${BUSINESS_WHATSAPP_URL}?text=${encodeURIComponent(supportMessage)}`;
  const trackSupport = () => { void trackAnalyticsEvent("whatsapp_checkout_click", { metadata: { surface: "inline_checkout_help", hasPendingPayment: Boolean(pendingOrderId) } }).catch(() => {}); };

  if (quote.error || paypalLoadError) {
    return (
      <section className="mt-5 rounded-2xl border border-red-300 bg-red-50 p-4 text-sm text-red-900 dark:border-red-800 dark:bg-red-950/50 dark:text-red-100" role="alert">
        <p className="font-semibold">{quote.error ?? tr.error}</p>
        {paypalLoadError && <p className="mt-2 break-words text-xs">{paypalLoadError}</p>}
        {(quote.error || paypalLoadError) && (
          <button type="button" onClick={quote.error ? quote.retry : retryPayPal} className="mt-3 rounded-lg border border-current px-4 py-2 text-xs font-black">
            {lang === "es" ? "Intentar de nuevo" : "Try again"}
          </button>
        )}
        <button type="button" onClick={onBack} className="ml-2 mt-3 rounded-lg border border-current px-4 py-2 text-xs font-black">
          {lang === "es" ? "Volver a revisar la reserva" : "Return to reservation review"}
        </button>
        <p className="mt-3"><a className="font-bold underline" href={supportHref} target="_blank" rel="noopener noreferrer" onClick={trackSupport}>{lang === "es" ? "Pedir ayuda por WhatsApp" : "Get help on WhatsApp"}</a></p>
      </section>
    );
  }

  return (
    <section className="mt-5 rounded-2xl border border-emerald-300/70 bg-emerald-50/70 p-4 shadow-sm dark:border-emerald-700/50 dark:bg-emerald-950/25 sm:p-5" aria-busy={quote.syncing || !quote.synced || isPaypalLoading} aria-live="polite">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-50">
          {lang === "es" ? "A pagar hoy (total completo)" : "Due today (full total)"}
        </h3>
        <p className="text-xl font-black text-emerald-700 dark:text-emerald-300">${quote.total.toFixed(2)} USD</p>
      </div>
      {quote.synced && quote.subtotal !== null && <div className="mb-3 space-y-1 text-sm"><p>{lang === "es" ? "Paquete por persona, antes de IVA" : "Package per person, before tax"}: ${quote.packagePrice.toFixed(2)}</p><p>Subtotal: ${quote.subtotal.toFixed(2)} · {lang === "es" ? "IVA" : "Tax"} ({quote.ivaRatePercent}%): ${(quote.total - quote.subtotal).toFixed(2)}</p><p>{lang === "es" ? "Total del grupo" : "Group total"}: ${quote.total.toFixed(2)}</p></div>}
      {totalChanged && <div className="mb-3 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-100" role="status">
        <p className="font-bold">{lang === "es" ? "El total cambió al validar su reserva." : "The total changed when we checked your booking."}</p>
        <p className="mt-1">{lang === "es" ? "Total anterior" : "Previous total"}: ${orderDetails.total.toFixed(2)} USD · {lang === "es" ? "Nuevo total" : "New total"}: ${quote.total.toFixed(2)} USD</p>
        <label className="mt-3 flex cursor-pointer items-start gap-2 font-semibold"><input type="checkbox" checked={!needsTotalAcceptance} onChange={(event) => setAcceptedTotal(event.target.checked ? quote.total : null)} className="mt-0.5 h-5 w-5 shrink-0" />{lang === "es" ? "Acepto el nuevo total para continuar al pago." : "I accept the new total to continue to payment."}</label>
      </div>}
      <p className="mb-3 text-xs">{lang === "es" ? "El pago no confirma la disponibilidad. El equipo confirmará su reserva después de validar la operación." : "Payment does not confirm availability. The team will confirm your booking after checking operations."}</p>
      <div className="min-h-20 w-full rounded-xl bg-white p-2 dark:bg-zinc-950/60">
        {(quote.syncing || !quote.synced || isPaypalLoading) && (
          <p className="flex min-h-16 items-center justify-center text-sm text-zinc-500 dark:text-zinc-400" role="status">
            {tr.loadingPaymentInfo}
          </p>
        )}
        {needsTotalAcceptance && <p className="flex min-h-16 items-center justify-center text-center text-sm text-zinc-600 dark:text-zinc-300">{lang === "es" ? "Confirme el nuevo total para mostrar las opciones de pago." : "Confirm the new total to show payment options."}</p>}
        <div ref={paypalRef} hidden={Boolean(pendingOrderId)} />
      </div>
      {(paymentError || isCapturing) && <div role={paymentError ? "alert" : "status"} className="mt-3 text-sm">
        <p>{isCapturing ? (lang === "es" ? "Verificando el pago…" : "Checking payment…") : paymentError}</p>
        {pendingOrderId && !isCapturing && <p className="mt-2 break-all text-xs">{lang === "es" ? "Orden PayPal" : "PayPal order"}: {pendingOrderId}</p>}
        {pendingOrderId && !isCapturing && <button type="button" onClick={retryCapture} className="mt-2 rounded-lg border px-4 py-2 font-bold">{lang === "es" ? "Verificar este pago" : "Check this payment"}</button>}
      </div>}
      <p className="mt-3 text-center text-xs text-zinc-500 dark:text-zinc-400">
        {lang === "es" ? "Pague con PayPal o tarjeta." : "Pay with PayPal or card."}
      </p>
      {!isCapturing && <div className="mt-4 border-t border-emerald-200 pt-4 text-center text-sm dark:border-emerald-800">
        <a className="font-bold text-emerald-800 underline dark:text-emerald-200" href={supportHref} target="_blank" rel="noopener noreferrer" onClick={trackSupport}>{pendingOrderId ? (lang === "es" ? "Consultar este pago por WhatsApp" : "Ask about this payment on WhatsApp") : (lang === "es" ? "Consultar disponibilidad y pago por WhatsApp" : "Ask about availability and payment on WhatsApp")}</a>
        {!pendingOrderId && <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-300">{lang === "es" ? "El equipo revisará su consulta; este enlace no guarda ni confirma la reserva." : "The team will review your inquiry; this link does not save or confirm a booking."}</p>}
      </div>}
    </section>
  );
}
