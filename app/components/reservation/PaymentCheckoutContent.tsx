"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
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
          alert(tr.error);
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

    // Simple SDK URL (https://developer.paypal.com/sdk/js/reference/)
    // No locale — PayPal auto-detects language from browser (recommended best practice)
    const sdkSrc = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(clientId)}&components=buttons&currency=USD&intent=capture`;

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

  const packageName = (tr.packages as Record<string, string>)[tourPackage] ?? tourPackage;

  return (
    <>
      <p className="mb-3 text-lg">
        <strong>{tr.nameLabel}:</strong> {name}
      </p>
      <p className="mb-3 text-lg">
        <strong>{tr.emailLabel}:</strong> {email}
      </p>
      <p className="mb-4 text-lg">
        <strong>{tr.phoneLabel}:</strong> {phone}
      </p>

      <p className="mb-2 text-lg">
        <strong>{tr.package}:</strong> {tourName}
      </p>

      <p className="mb-2 text-lg">
        {tr.bookingPrefix}{" "}
        <strong>{tickets} {tickets === 1 ? tr.person : tr.persons}</strong>{" "}
        {tr.bookingForDay}{" "}
        <strong>{date}</strong>.
      </p>

      <p className="mb-2 text-lg">
        <strong>{tr.tourTime}:</strong>{" "}
        {tr.timeLabels[tourTime] ?? tourTime}
      </p>

      <p className="mb-4 text-lg">
        <strong>{tr.package}:</strong>{" "}
        {packageName} (${packagePrice} USD/{tr.pricePerPersonUnit})
      </p>

      <p className="text-xl font-bold mb-6">{tr.total}: ${total.toFixed(2)}</p>

      <div className="relative min-h-[140px] w-full">
        {isPaypalLoading && (
          <div
            className="absolute inset-0 flex min-h-[140px] items-center justify-center rounded-lg border border-emerald-100 bg-white/85 px-4 text-center text-sm font-medium text-emerald-900 shadow-sm"
            role="status"
            aria-live="polite"
          >
            <span className="mr-3 h-5 w-5 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-700" aria-hidden="true" />
            {tr.loadingPaymentInfo}
          </div>
        )}
        {paypalLoadError && (
          <div
            className="min-h-[140px] rounded-lg border border-red-200 bg-red-50 px-4 py-5 text-sm text-red-800 shadow-sm dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200"
            role="alert"
          >
            <p className="font-semibold">{tr.error}</p>
            <p className="mt-2 break-words text-xs opacity-90">{paypalLoadError}</p>
          </div>
        )}
        <div ref={paypalRef} className="min-h-[140px] w-full" />
      </div>
    </>
  );
}
