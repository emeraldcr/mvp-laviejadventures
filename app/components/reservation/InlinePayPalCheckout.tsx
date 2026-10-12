"use client";

import { useCallback, useMemo } from "react";
import type { OrderDetails } from "@/lib/types/index";
import { translations } from "@/lib/translations";
import { useCheckoutQuote } from "./hooks/useCheckoutQuote";
import { usePayPalCheckout } from "./hooks/usePayPalCheckout";

export default function InlinePayPalCheckout({
  orderDetails,
  lang,
}: {
  orderDetails: OrderDetails;
  lang: "es" | "en";
}) {
  const tr = translations[lang].payment;
  const quote = useCheckoutQuote(orderDetails, lang);
  const handleSuccess = useCallback(() => {}, []);
  const quotedOrderDetails = useMemo(
    () => ({ ...orderDetails, total: quote.total }),
    [orderDetails, quote.total],
  );
  const { paypalRef, paypalLoadError, isPaypalLoading } = usePayPalCheckout({
    enabled: quote.synced && !quote.syncing && !quote.error,
    orderDetails: quotedOrderDetails,
    lang,
    errorMessage: tr.error,
    onSuccess: handleSuccess,
  });

  return (
    <section className="mt-5 rounded-2xl border border-emerald-300/70 bg-emerald-50/70 p-4 shadow-sm dark:border-emerald-700/50 dark:bg-emerald-950/25 sm:p-5" aria-live="polite">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-50">
          {lang === "es" ? "Pague su reserva" : "Pay for your booking"}
        </h3>
        <p className="text-xl font-black text-emerald-700 dark:text-emerald-300">${quote.total.toFixed(2)} USD</p>
      </div>

      {quote.error ? (
        <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-900 dark:border-red-800 dark:bg-red-950/50 dark:text-red-100" role="alert">
          <p className="font-semibold">{quote.error}</p>
          <button type="button" onClick={quote.retry} className="mt-3 rounded-lg border border-current px-4 py-2 text-xs font-black">
            {lang === "es" ? "Validar de nuevo" : "Validate again"}
          </button>
        </div>
      ) : (
        <div className="relative min-h-24 rounded-xl bg-white p-2 dark:bg-zinc-950/60">
          {(quote.syncing || isPaypalLoading) && (
            <div className="absolute inset-2 z-10 flex items-center justify-center gap-3 rounded-lg bg-white/95 p-4 text-center text-sm font-semibold text-zinc-700 dark:bg-zinc-950/95 dark:text-zinc-200" role="status">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-600" aria-hidden="true" />
              {lang === "es" ? "Preparando el pago seguro…" : "Preparing secure payment…"}
            </div>
          )}
          {paypalLoadError ? (
            <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-900 dark:border-red-800 dark:bg-red-950/50 dark:text-red-100" role="alert">
              <p className="font-semibold">{tr.error}</p>
              <p className="mt-2 break-words text-xs">{paypalLoadError}</p>
            </div>
          ) : (
            <div ref={paypalRef} className="min-h-20 w-full" />
          )}
        </div>
      )}
      <p className="mt-3 text-center text-xs text-zinc-500 dark:text-zinc-400">
        {lang === "es" ? "Puede pagar con PayPal o tarjeta desde el botón seguro." : "Pay securely with PayPal or a card."}
      </p>
    </section>
  );
}
