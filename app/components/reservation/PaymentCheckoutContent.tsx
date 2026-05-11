"use client";

import React, { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/app/context/LanguageContext";
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

  useEffect(() => {
    const existingScript = document.querySelector("#paypal-sdk");
    const paypalContainer = paypalRef.current;

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
              alert(tr.error);
              return;
            }

            sessionStorage.removeItem("reservationOrderDetails");
            onSuccess(output);
            router.push(`/success?orderId=${output.id}`);
          },
          onError: (err: unknown) => {
            alert(tr.error);
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
  }, [date, email, lang, name, onSuccess, packagePrice, phone, router, tickets, total, tourName, tourPackage, tourSlug, tourTime, tr.error]);

  const packageName = tr.packages[tourPackage] ?? tourPackage;

  return (
    <>
      <div className="mb-6 rounded-xl border border-zinc-700/70 bg-zinc-950/50 p-4 text-zinc-100">
        <p className="text-base font-semibold">{tourName}</p>
        <p className="mt-1 text-sm text-zinc-300">
          {tickets} {tickets === 1 ? tr.person : tr.persons} • {date} • {tr.timeLabels[tourTime] ?? tourTime}
        </p>
        <p className="mt-2 text-sm text-zinc-300">
          {name} • {email} • {phone}
        </p>
        <p className="mt-2 text-sm text-zinc-300">
          {packageName} (${packagePrice} USD/{tr.pricePerPersonUnit})
        </p>
        <p className="mt-3 text-xl font-bold">{tr.total}: ${total.toFixed(2)}</p>
      </div>

      <div ref={paypalRef} className="min-h-[140px] w-full" />
    </>
  );
}
