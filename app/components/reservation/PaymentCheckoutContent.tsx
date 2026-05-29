"use client";

import React, { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/app/context/LanguageContext";
import { trackAnalyticsEvent } from "@/lib/analytics/client";
import { translations } from "@/lib/translations";
import type { OrderDetails } from "@/lib/types/index";

declare global {
  interface Window {
    paypal?: { Buttons: (config: unknown) => { render: (container: HTMLDivElement) => void } };
  }
}

type Props = {
  orderDetails: OrderDetails;
  onSuccess: (orderData: unknown) => void;
};

export default function PaymentCheckoutContent({ orderDetails, onSuccess }: Props) {
  const paypalRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { lang } = useLanguage();
  const tr = translations[lang].payment;

  const { name, email, phone, tickets, total, date, dateIso, tourTime, tourPackage, tourSlug, tourName, packagePrice } = orderDetails;

  const bookingAnalyticsMetadata = {
    tickets,
    date: dateIso ?? date,
    tourTime,
    tourPackage,
    tourSlug,
    tourName,
    packagePrice,
    amount: total,
    currency: "USD",
    language: lang,
  };

  useEffect(() => {
    const existingScript = document.querySelector("#paypal-sdk");
    const paypalContainer = paypalRef.current;

    trackAnalyticsEvent("booking_checkout_started", {
      metadata: bookingAnalyticsMetadata,
    });

    const initializeButtons = () => {
      if (!window.paypal || !paypalContainer) return;

      paypalContainer.innerHTML = "";

      window.paypal
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
        })
        .render(paypalContainer);
    };

    const mode = process.env.NEXT_PUBLIC_PAYPAL_MODE?.toLowerCase() || "dev";
    const clientId = mode === "live"
      ? process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID
      : process.env.NEXT_PUBLIC_PAYPAL_SANDBOX_CLIENT_ID;

    if (!clientId) {
      console.error("Missing PayPal client ID for the current mode:", mode);
      return;
    }

    const paypalLocale = lang === "es" ? "es_XC" : "en_US";

    if (!existingScript) {
      const script = document.createElement("script");
      script.id = "paypal-sdk";
      script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}`;
      script.async = true;
      script.onload = initializeButtons;
      document.body.appendChild(script);
    } else {
      initializeButtons();
    }

    return () => {
      if (paypalContainer) {
        paypalContainer.innerHTML = "";
      }
    };
  }, [date, dateIso, email, lang, name, onSuccess, packagePrice, phone, router, tickets, total, tourName, tourPackage, tourSlug, tourTime, tr.error]);

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
    </>
  );
}
