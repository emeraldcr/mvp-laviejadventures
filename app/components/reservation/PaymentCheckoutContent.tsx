"use client";

import React, { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/app/context/LanguageContext";
import { translations } from "@/lib/translations";
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
  const router = useRouter();
  const { lang } = useLanguage();
  const tr = translations[lang].payment;

  const { name, email, phone, tickets, total, date, tourTime, tourPackage, tourSlug, tourName, packagePrice } = orderDetails;

  useEffect(() => {
    const paypalContainer = paypalRef.current;
    const mode = process.env.NEXT_PUBLIC_PAYPAL_MODE?.toLowerCase() || "sandbox";
    const clientId = mode === "live"
      ? process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID
      : process.env.NEXT_PUBLIC_PAYPAL_SANDBOX_CLIENT_ID;

    if (!clientId) {
      console.error("Missing PayPal client ID for the current mode:", mode);
      return;
    }

    const paypalLocale = lang === "es" ? "es_XC" : "en_US";
    const paypalScriptSrc = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD&locale=${paypalLocale}`;

    const initializeButtons = async () => {
      if (!window.paypal || !paypalContainer) return;

      paypalContainer.innerHTML = "";

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
            onError: (err: unknown) => {
              alert(tr.error);
              console.error("PAYPAL ERROR:", err);
            },
          })
          .render(paypalContainer);
      } catch (error) {
        console.error("Failed to render PayPal buttons:", error);
      }
    };

    const loadPayPalScript = async () => {
      const existingScript = document.querySelector<HTMLScriptElement>("#paypal-sdk");

      if (existingScript && existingScript.src !== paypalScriptSrc) {
        existingScript.remove();
        delete window.paypal;
      }

      const currentScript = document.querySelector<HTMLScriptElement>("#paypal-sdk");

      if (!currentScript) {
        const script = document.createElement("script");
        script.id = "paypal-sdk";
        script.src = paypalScriptSrc;
        script.async = true;

        await new Promise<void>((resolve, reject) => {
          script.onload = () => resolve();
          script.onerror = () => reject(new Error("Failed to load PayPal SDK"));
          document.body.appendChild(script);
        });

        await initializeButtons();
        return;
      }

      if (window.paypal) {
        await initializeButtons();
        return;
      }

      await new Promise<void>((resolve, reject) => {
        currentScript.addEventListener("load", () => resolve(), { once: true });
        currentScript.addEventListener("error", () => reject(new Error("Failed to load PayPal SDK")), { once: true });
      });

      await initializeButtons();
    };

    void loadPayPalScript();

    return () => {
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
    </>
  );
}
