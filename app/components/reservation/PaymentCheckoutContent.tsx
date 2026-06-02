"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, Clock3, CreditCard, Mail, Phone, ShieldCheck, Ticket, UserRound } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import { trackAnalyticsEvent } from "@/lib/analytics/client";
import { translations } from "@/lib/translations";
import type { OrderDetails } from "@/lib/types/index";

declare global {
  interface Window {
    paypal?: { Buttons: (config: unknown) => { render: (container: HTMLDivElement) => Promise<void> | void } };
  }
}

const isLivePayPalMode = (mode: string | undefined) => {
  const normalizedMode = mode?.trim().toLowerCase();
  return normalizedMode === "live" || normalizedMode === "production" || normalizedMode === "prod";
};

const isConfiguredPayPalClientId = (clientId: string | undefined): clientId is string => {
  if (!clientId) return false;

  const normalizedClientId = clientId.trim().toLowerCase();
  return Boolean(normalizedClientId) && !normalizedClientId.startsWith("your-");
};

const DEFAULT_BUYER_COUNTRY = "CR";

const COUNTRY_BY_PHONE_PREFIX: Record<string, string> = {
  "506": "CR",
  "1": "US",
  "52": "MX",
  "57": "CO",
  "34": "ES",
};

const getBuyerCountryFromPhone = (phone: string) => {
  const normalizedPhone = phone.trim().replace(/[^\d+]/g, "");
  const match = normalizedPhone.match(/^\+(\d{1,3})/);
  if (!match) return DEFAULT_BUYER_COUNTRY;

  return COUNTRY_BY_PHONE_PREFIX[match[1]] ?? DEFAULT_BUYER_COUNTRY;
};

const SummaryRow = ({
  icon,
  label,
  value,
  prominent = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  prominent?: boolean;
}) => (
  <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-3">
    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-400/10 text-teal-300">
      {icon}
    </span>
    <div className="min-w-0">
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-zinc-500">{label}</p>
      <p className={`mt-0.5 break-words leading-snug text-zinc-100 ${prominent ? "text-lg font-black" : "text-sm font-semibold"}`}>
        {value}
      </p>
    </div>
  </div>
);

type Props = {
  orderDetails: OrderDetails;
  onSuccess: (orderData: unknown) => void;
};

export default function PaymentCheckoutContent({ orderDetails, onSuccess }: Props) {
  const paypalRef = useRef<HTMLDivElement>(null);
  const [loadedPaypalKey, setLoadedPaypalKey] = useState<string | null>(null);
  const [paypalLoadFailure, setPaypalLoadFailure] = useState<{ checkoutKey: string; message: string } | null>(null);
  const router = useRouter();
  const { lang } = useLanguage();
  const tr = translations[lang].payment;

  const { name, email, phone, tickets, total, date, dateIso, tourTime, packageId, tourPackage, tourSlug, tourName, packagePrice } = orderDetails;

  const checkoutKey = useMemo(
    () => [
      name,
      email,
      phone,
      tickets,
      total,
      dateIso ?? date,
      tourTime,
      packageId,
      tourPackage,
      tourSlug,
      tourName,
      packagePrice,
      lang,
    ].join("|"),
    [date, dateIso, email, lang, name, packageId, packagePrice, phone, tickets, total, tourName, tourPackage, tourSlug, tourTime],
  );

  const bookingAnalyticsMetadata = useMemo(
    () => ({
      tickets,
      date: dateIso ?? date,
      tourTime,
      packageId,
      tourPackage,
      tourSlug,
      tourName,
      packagePrice,
      amount: total,
      currency: "USD",
      language: lang,
    }),
    [date, dateIso, lang, packageId, packagePrice, tickets, total, tourName, tourPackage, tourSlug, tourTime],
  );

  const paypalLoadError = paypalLoadFailure?.checkoutKey === checkoutKey ? paypalLoadFailure.message : null;
  const isPaypalLoading = !paypalLoadError && loadedPaypalKey !== checkoutKey;
  const packageName = (tr.packages as Record<string, string>)[tourPackage] ?? tourPackage;
  const formattedTime = tr.timeLabels[tourTime] ?? tourTime;
  const buyerCountryCode = getBuyerCountryFromPhone(phone);
  const paymentCopy = {
    contactTitle: lang === "es" ? "Datos del viajero" : "Traveler details",
    bookingTitle: lang === "es" ? "Resumen de reserva" : "Booking summary",
    paymentTitle: lang === "es" ? "Pago seguro" : "Secure payment",
    paymentSubtitle: lang === "es"
      ? "PayPal puede pedir dirección de facturación para validar la tarjeta. Ya enviamos tu nombre, email y teléfono a la orden."
      : "PayPal may request billing address to validate the card. Your name, email, and phone are already attached to the order.",
    checkoutHint: lang === "es"
      ? "Elige PayPal o tarjeta. La confirmación se genera apenas el pago quede aprobado."
      : "Choose PayPal or card. Your confirmation is created as soon as payment is approved.",
    dateLabel: lang === "es" ? "Fecha" : "Date",
    guestsLabel: lang === "es" ? "Personas" : "Guests",
    tourLabel: lang === "es" ? "Experiencia" : "Experience",
    packagePriceLabel: lang === "es" ? "Tarifa" : "Rate",
  };

  useEffect(() => {
    const paypalContainer = paypalRef.current;
    let isMounted = true;
    let scriptForCleanup: HTMLScriptElement | null = null;

    trackAnalyticsEvent("booking_checkout_started", {
      metadata: bookingAnalyticsMetadata,
    });

    const finishLoading = () => {
      if (isMounted) setLoadedPaypalKey(checkoutKey);
    };

    const failPayPalLoad = (stage: string, reason: string, error?: unknown) => {
      if (isMounted) {
        setPaypalLoadFailure({ checkoutKey, message: reason });
        setLoadedPaypalKey(checkoutKey);
      }

      trackAnalyticsEvent("payment_error", {
        metadata: {
          ...bookingAnalyticsMetadata,
          stage,
          reason,
        },
      });

      const sdkError = error instanceof Error ? error : new Error(reason);
      console.error(`PAYPAL SDK ERROR (${stage}):`, sdkError);
    };

    const initializeButtons = () => {
      if (!paypalContainer) {
        failPayPalLoad("paypal_container", "PayPal button container was not found.");
        return;
      }

      if (!window.paypal) {
        failPayPalLoad("paypal_sdk_load", "PayPal SDK loaded, but window.paypal is unavailable.");
        return;
      }

      paypalContainer.innerHTML = "";

      const buttons = window.paypal
        .Buttons({
          style: {
            layout: "vertical",
            color: "gold",
            shape: "pill",
            label: "paypal",
          },
          createOrder: async () => {
            const res = await fetch("/api/paypal/create-order", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                name,
                email,
                phone,
                tickets,
                date: dateIso ?? date,
                total,
                tourTime,
                packageId,
                tourPackage,
                packagePrice,
                tourSlug,
                tourName,
                language: lang,
                countryCode: buyerCountryCode,
              }),
            });

            const data = await res.json();

            if (!res.ok || !data?.orderID) {
              const reason = data?.message || "PayPal create order response did not include orderID.";
              const minDate = typeof data?.minBookableDate === "string" ? data.minBookableDate : null;

              if (minDate) {
                alert(`${reason} Earliest available date: ${minDate}.`);
              } else {
                alert(reason);
              }

              throw new Error(reason);
            }

            trackAnalyticsEvent("payment_order_created", {
              metadata: {
                ...bookingAnalyticsMetadata,
                orderId: data.orderID,
              },
            });

            return data.orderID as string;
          },
          onApprove: async (data: { orderID: string }) => {
            const res = await fetch("/api/paypal/capture-order", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ orderID: data.orderID }),
            });

            const output = await res.json();

            if (!res.ok || !output?.captureID || output?.status !== "COMPLETED") {
              console.error("PAYPAL CAPTURE FAILED:", output);
              trackAnalyticsEvent("payment_error", {
                metadata: {
                  ...bookingAnalyticsMetadata,
                  orderId: data.orderID,
                  stage: "capture",
                  status: output?.status ?? null,
                  reason: output?.message ?? "capture_failed",
                },
              });
              alert(tr.error);
              return;
            }

            trackAnalyticsEvent("payment_approved", {
              metadata: {
                ...bookingAnalyticsMetadata,
                orderId: data.orderID,
                captureId: output.captureID,
                status: output.status,
              },
            });

            sessionStorage.removeItem("reservationOrderDetails");
            onSuccess(output);
            router.push(`/success?orderId=${output.id}`);
          },
          onError: (err: unknown) => {
            alert(tr.error);
            trackAnalyticsEvent("payment_error", {
              metadata: {
                ...bookingAnalyticsMetadata,
                stage: "paypal_buttons",
                reason: err instanceof Error ? err.message : "paypal_error",
              },
            });
            console.error("PAYPAL ERROR:", err);
          },
        });

      Promise.resolve(buttons.render(paypalContainer))
        .then(finishLoading)
        .catch((err: unknown) => {
          failPayPalLoad("paypal_render", err instanceof Error ? err.message : "paypal_render_error", err);
          //alert(tr.error);
        });
    };

    const mode = process.env.NEXT_PUBLIC_PAYPAL_MODE;
    const isLiveMode = isLivePayPalMode(mode);
    const clientId = (isLiveMode
      ? process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID
      : process.env.NEXT_PUBLIC_PAYPAL_SANDBOX_CLIENT_ID)?.trim();

    if (!isConfiguredPayPalClientId(clientId)) {
      failPayPalLoad(
        "paypal_config",
        `Missing or placeholder PayPal ${isLiveMode ? "live" : "sandbox"} client ID for mode "${mode || "sandbox"}".`,
      );
      return;
    }

    // Keep the SDK URL minimal; PayPal rejects some locale/country combinations at script-load time.
    const sdkParams = new URLSearchParams({
      "client-id": clientId,
      components: "buttons",
      currency: "USD",
      intent: "capture",
    });

    const sdkSrc = `https://www.paypal.com/sdk/js?${sdkParams.toString()}`;

    const handleScriptError = () => {
      document.querySelector<HTMLScriptElement>("#paypal-sdk")?.remove();
      failPayPalLoad("paypal_sdk_load", "paypal_sdk_load_error");
      alert(tr.error);
    };

    // Clean up any previous script that had a different src (rare now that we use a stable simple URL)
    const existing = document.querySelector<HTMLScriptElement>("#paypal-sdk");
    if (existing && existing.src !== sdkSrc) {
      existing.remove();
    }

    const activeScript = document.querySelector<HTMLScriptElement>("#paypal-sdk");

    if (!activeScript) {
      // Load the SDK script once - simple and reliable
      const script = document.createElement("script");
      script.id = "paypal-sdk";
      script.src = sdkSrc;
      script.async = true;
      scriptForCleanup = script;

      script.onload = () => {
        if (isMounted) initializeButtons();
      };
      script.onerror = handleScriptError;

      document.body.appendChild(script);
    } else if (window.paypal) {
      // Already loaded and ready
      initializeButtons();
    } else {
      // Script tag exists but not yet executed — wait for it
      activeScript.addEventListener("load", initializeButtons, { once: true });
      activeScript.addEventListener("error", handleScriptError, { once: true });
    }

    return () => {
      isMounted = false;
      // Best-effort cleanup of listeners (the {once:true} helps)
      activeScript?.removeEventListener("load", initializeButtons);
      activeScript?.removeEventListener("error", handleScriptError);
      if (scriptForCleanup) {
        scriptForCleanup.onload = null;
        scriptForCleanup.onerror = null;
      }
      if (paypalContainer) {
        paypalContainer.innerHTML = "";
      }
    };
  }, [checkoutKey]); // Only re-evaluate when the logical checkout session changes

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,0.92fr)_minmax(360px,1.08fr)]">
      <aside className="space-y-4">
        <section className="rounded-2xl border border-white/10 bg-zinc-950/45 p-4 shadow-inner shadow-black/20">
          <div className="mb-3 flex items-center gap-2">
            <UserRound className="h-4 w-4 text-teal-300" aria-hidden />
            <h2 className="text-sm font-black uppercase tracking-[0.16em] text-zinc-300">{paymentCopy.contactTitle}</h2>
          </div>
          <div className="space-y-3">
            <SummaryRow icon={<UserRound className="h-4 w-4" aria-hidden />} label={tr.nameLabel} value={name} />
            <SummaryRow icon={<Mail className="h-4 w-4" aria-hidden />} label={tr.emailLabel} value={email} />
            <SummaryRow icon={<Phone className="h-4 w-4" aria-hidden />} label={tr.phoneLabel} value={phone} />
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-zinc-950/45 p-4 shadow-inner shadow-black/20">
          <div className="mb-3 flex items-center gap-2">
            <Ticket className="h-4 w-4 text-teal-300" aria-hidden />
            <h2 className="text-sm font-black uppercase tracking-[0.16em] text-zinc-300">{paymentCopy.bookingTitle}</h2>
          </div>
          <div className="space-y-3">
            <SummaryRow icon={<Ticket className="h-4 w-4" aria-hidden />} label={paymentCopy.tourLabel} value={tourName} />
            <SummaryRow icon={<CalendarDays className="h-4 w-4" aria-hidden />} label={paymentCopy.dateLabel} value={date} />
            <SummaryRow icon={<Clock3 className="h-4 w-4" aria-hidden />} label={tr.tourTime} value={formattedTime} />
            <SummaryRow
              icon={<UserRound className="h-4 w-4" aria-hidden />}
              label={paymentCopy.guestsLabel}
              value={`${tickets} ${tickets === 1 ? tr.person : tr.persons}`}
            />
            <SummaryRow
              icon={<CreditCard className="h-4 w-4" aria-hidden />}
              label={paymentCopy.packagePriceLabel}
              value={`${packageName} ($${packagePrice} USD/${tr.pricePerPersonUnit})`}
            />
          </div>
        </section>
      </aside>

      <section className="rounded-2xl border border-teal-300/20 bg-[radial-gradient(circle_at_top_right,rgba(20,184,166,0.18),transparent_34%),rgba(10,10,12,0.72)] p-4 shadow-2xl shadow-black/30 sm:p-5">
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-teal-300/25 bg-teal-400/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-teal-200">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
              {paymentCopy.paymentTitle}
            </div>
            <p className="max-w-xl text-sm leading-relaxed text-zinc-400">{paymentCopy.paymentSubtitle}</p>
          </div>
          <div className="rounded-2xl border border-teal-300/20 bg-teal-400/10 px-4 py-3 text-right">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-teal-200">{tr.total}</p>
            <p className="text-3xl font-black leading-none text-white">${total.toFixed(2)}</p>
          </div>
        </div>

        <div className="mb-4 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-medium text-zinc-300">
          {paymentCopy.checkoutHint}
        </div>

        <div className="relative min-h-[160px] w-full overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-3">
          {isPaypalLoading && (
            <div
              className="absolute inset-3 z-10 flex min-h-[140px] items-center justify-center rounded-xl border border-emerald-100/20 bg-zinc-950/90 px-4 text-center text-sm font-medium text-emerald-100 shadow-sm"
              role="status"
              aria-live="polite"
            >
              <span className="mr-3 h-5 w-5 animate-spin rounded-full border-2 border-emerald-200/30 border-t-emerald-300" aria-hidden="true" />
              {tr.loadingPaymentInfo}
            </div>
          )}
          {paypalLoadError && (
            <div
              className="min-h-[140px] rounded-xl border border-red-400/30 bg-red-950/40 px-4 py-5 text-sm text-red-100 shadow-sm"
              role="alert"
            >
              <p className="font-semibold">{tr.error}</p>
              <p className="mt-2 break-words text-xs opacity-90">{paypalLoadError}</p>
            </div>
          )}
          <div ref={paypalRef} className="min-h-[140px] w-full" />
        </div>
      </section>
    </div>
  );
}
