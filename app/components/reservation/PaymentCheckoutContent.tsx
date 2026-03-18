"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/app/context/LanguageContext";
import { translations } from "@/lib/translations";
import {
  PAYPAL_CURRENCY,
  PAYPAL_SDK_COMMIT,
  PAYPAL_SDK_COMPONENTS,
  PAYPAL_SDK_INTEGRATION_DATE,
  PAYPAL_SDK_INTENT,
} from "@/lib/constants/paypal";
import type { OrderDetails } from "@/lib/types/index";

declare global {
  interface Window {
    paypal?: { Buttons: (config: unknown) => { render: (container: HTMLDivElement) => Promise<void> | void } };
  }
}

type Props = {
  orderDetails: OrderDetails;
  onSuccess: (orderData: unknown) => void;
};

export default function PaymentCheckoutContent({ orderDetails, onSuccess }: Props) {
  const paypalRef = useRef<HTMLDivElement>(null);
  const [paypalError, setPaypalError] = useState<string | null>(null);
  const [debugError, setDebugError] = useState<string | null>(null);
  const router = useRouter();
  const { lang } = useLanguage();
  const tr = translations[lang].payment;

  const { name, email, phone, tickets, total, date, tourTime, tourPackage, tourSlug, tourName, packagePrice } = orderDetails;

  useEffect(() => {
    const paypalContainer = paypalRef.current;
    // Abort flag: prevents async callbacks from acting after the effect has been
    // cleaned up. On mobile Chrome, effects can re-run during soft keyboard show/hide,
    // orientation changes, or viewport resize — without this flag the old async chain
    // races against the new one and can leave PayPal in a broken state.
    let aborted = false;

    const mode = process.env.NEXT_PUBLIC_PAYPAL_MODE?.toLowerCase() || "sandbox";
    const clientId = mode === "live"
      ? process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID
      : process.env.NEXT_PUBLIC_PAYPAL_SANDBOX_CLIENT_ID;

    if (!clientId) {
      console.error("Missing PayPal client ID for the current mode:", mode);
      return;
    }

    const paypalLocale = lang === "es" ? "es_XC" : "en_US";
    const paypalScriptParams = new URLSearchParams({
      "client-id": clientId,
      currency: PAYPAL_CURRENCY,
      intent: PAYPAL_SDK_INTENT,
      commit: PAYPAL_SDK_COMMIT,
      components: PAYPAL_SDK_COMPONENTS,
      "integration-date": PAYPAL_SDK_INTEGRATION_DATE,
      locale: paypalLocale,
    });
    const paypalScriptSrc = `https://www.paypal.com/sdk/js?${paypalScriptParams.toString()}`;

    const removePayPalScript = () => {
      const script = document.querySelector<HTMLScriptElement>("#paypal-sdk");
      script?.remove();
      delete window.paypal;
    };

    const initializeButtons = async () => {
      if (aborted || !window.paypal || !paypalContainer) return;

      paypalContainer.innerHTML = "";
      setPaypalError(null);

      try {
        await window.paypal
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
                  date,
                  total,
                  tourTime,
                  tourPackage,
                  packagePrice,
                  tourSlug,
                  tourName,
                  language: lang,
                }),
              });

              const data = await res.json();

              if (!res.ok || !data?.orderID) {
                console.error("PAYPAL CREATE ORDER FAILED:", data);
                throw new Error(data?.message || "Failed to create PayPal order");
              }

              return data.orderID;
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
                alert(tr.error);
                return;
              }

              sessionStorage.removeItem("reservationOrderDetails");
              onSuccess(output);
              router.push(`/success?orderId=${output.id}`);
            },
            onCancel: () => {
              setPaypalError(null);
            },
            onError: (err: unknown) => {
              const msg = err instanceof Error ? err.message : JSON.stringify(err);
              console.error("PAYPAL ERROR:", err);
              setDebugError(`onError: ${msg}`);
              setPaypalError(tr.error);
            },
          })
          .render(paypalContainer);
      } catch (error) {
        if (!aborted) {
          const msg = error instanceof Error ? error.message : JSON.stringify(error);
          console.error("Failed to render PayPal buttons:", error);
          setDebugError(`render catch: ${msg}`);
          setPaypalError(tr.error);
        }
      }
    };

    const loadPayPalScript = async () => {
      const existingScript = document.querySelector<HTMLScriptElement>("#paypal-sdk");

      if (existingScript && existingScript.src !== paypalScriptSrc) {
        removePayPalScript();
      }

      const currentScript = document.querySelector<HTMLScriptElement>("#paypal-sdk");

      if (window.paypal) {
        await initializeButtons();
        return;
      }

      if (currentScript?.dataset.loaded === "true" && !window.paypal) {
        removePayPalScript();
      }

      const nextScript = document.querySelector<HTMLScriptElement>("#paypal-sdk") ?? document.createElement("script");

      if (!nextScript.isConnected) {
        nextScript.id = "paypal-sdk";
        nextScript.src = paypalScriptSrc;
        nextScript.async = true;
        nextScript.dataset.pageType = "checkout";
        // NOTE: Do NOT set crossOrigin="anonymous" on the PayPal SDK script.
        // Safari/WebKit on iOS enforces CORS strictly and will block the script
        // if the CDN response doesn't match the expected CORS headers exactly.
        // PayPal's official SDK does not require nor recommend the crossorigin attribute.
        nextScript.dataset.loaded = "false";
        document.body.appendChild(nextScript);
      }

      await new Promise<void>((resolve, reject) => {
        // Timeout of 15s for mobile networks (iOS Safari on slow connections)
        const timeout = setTimeout(() => {
          reject(new Error("PayPal SDK load timed out"));
        }, 15000);

        const handleLoad = () => {
          clearTimeout(timeout);
          nextScript.dataset.loaded = "true";
          resolve();
        };

        const handleError = () => {
          clearTimeout(timeout);
          nextScript.dataset.loaded = "false";
          reject(new Error("Failed to load PayPal SDK"));
        };

        if (window.paypal) {
          clearTimeout(timeout);
          nextScript.dataset.loaded = "true";
          resolve();
          return;
        }

        nextScript.addEventListener("load", handleLoad, { once: true });
        nextScript.addEventListener("error", handleError, { once: true });
      });

      if (!aborted) {
        await initializeButtons();
      }
    };

    void loadPayPalScript().catch((error) => {
      if (!aborted) {
        const msg = error instanceof Error ? error.message : JSON.stringify(error);
        console.error("Failed to initialize PayPal:", error);
        setDebugError(`script load catch: ${msg}`);
        setPaypalError(tr.error);
      }
    });

    return () => {
      aborted = true;
      if (paypalContainer) {
        paypalContainer.innerHTML = "";
      }
    };
  }, [date, email, lang, name, onSuccess, packagePrice, phone, router, tickets, total, tourName, tourPackage, tourSlug, tourTime, tr.error]);

  const packageName = tr.packages[tourPackage] ?? tourPackage;

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

      <div ref={paypalRef} className="min-h-[140px] w-full" />
      {paypalError ? (
        <p className="mt-3 text-sm text-red-600 dark:text-red-400">{paypalError}</p>
      ) : null}
      {debugError ? (
        <p className="mt-1 text-xs text-yellow-400 break-all">[debug] {debugError}</p>
      ) : null}
    </>
  );
}
