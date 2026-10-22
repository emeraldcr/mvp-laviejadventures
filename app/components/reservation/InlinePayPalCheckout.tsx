"use client";

import { useCallback, useMemo } from "react";
import type { OrderDetails } from "@/lib/types/index";
import { translations } from "@/lib/translations";
import { useCheckoutQuote } from "./hooks/useCheckoutQuote";
import { usePayPalCheckout } from "./hooks/usePayPalCheckout";

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
  const { paypalRef, paypalLoadError, isPaypalLoading } = usePayPalCheckout({
    enabled: quote.synced && !quote.syncing && !quote.error,
    orderDetails: quotedOrderDetails,
    lang,
    errorMessage: tr.error,
    onSuccess: handleSuccess,
  });

  if (quote.error || paypalLoadError) {
    return (
      <section className="mt-5 rounded-2xl border border-red-300 bg-red-50 p-4 text-sm text-red-900 dark:border-red-800 dark:bg-red-950/50 dark:text-red-100" role="alert">
        <p className="font-semibold">{quote.error ?? tr.error}</p>
        {paypalLoadError && <p className="mt-2 break-words text-xs">{paypalLoadError}</p>}
        {quote.error && (
          <button type="button" onClick={quote.retry} className="mt-3 rounded-lg border border-current px-4 py-2 text-xs font-black">
            {lang === "es" ? "Intentar de nuevo" : "Try again"}
          </button>
        )}
        <button type="button" onClick={onBack} className="ml-2 mt-3 rounded-lg border border-current px-4 py-2 text-xs font-black">
          {lang === "es" ? "Volver a revisar la reserva" : "Return to reservation review"}
        </button>
      </section>
    );
  }

  return (
    <section className="mt-5 rounded-2xl border border-emerald-300/70 bg-emerald-50/70 p-4 shadow-sm dark:border-emerald-700/50 dark:bg-emerald-950/25 sm:p-5" aria-busy={quote.syncing || !quote.synced || isPaypalLoading} aria-live="polite">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-50">
          {lang === "es" ? "Pague su reserva" : "Pay for your booking"}
        </h3>
        <p className="text-xl font-black text-emerald-700 dark:text-emerald-300">${quote.total.toFixed(2)} USD</p>
      </div>
      <div ref={paypalRef} className="min-h-20 w-full rounded-xl bg-white p-2 dark:bg-zinc-950/60">
        {(quote.syncing || !quote.synced || isPaypalLoading) && (
          <p className="flex min-h-16 items-center justify-center text-sm text-zinc-500 dark:text-zinc-400" role="status">
            {tr.loadingPaymentInfo}
          </p>
        )}
      </div>
      <p className="mt-3 text-center text-xs text-zinc-500 dark:text-zinc-400">
        {lang === "es" ? "Pague con PayPal o tarjeta." : "Pay with PayPal or card."}
      </p>
    </section>
  );
}
