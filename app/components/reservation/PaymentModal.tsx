"use client";

import React, { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/app/context/LanguageContext";
import { translations } from "@/lib/translations";

declare global {
  interface Window {
    paypal?: any;
  }
}

export type OrderDetails = {
  name: string;
  email: string;
  phone: string;
  tickets: number;
  total: number;
  date: string;
  tourTime: string;
  tourPackage: string;
  packagePrice: number;
};

type PaymentModalProps = {
  orderDetails: OrderDetails;
  onClose: () => void;
  onSuccess: (orderData: any) => void;
};

export default function PaymentModal({
  orderDetails,
  onClose,
  onSuccess,
}: PaymentModalProps) {
  const paypalRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { lang } = useLanguage();
  const tr = translations[lang].payment;

  const { name, email, phone, tickets, total, date, tourTime, tourPackage, packagePrice } = orderDetails;

  // 🔒 Lock body scroll while modal is open
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    const existingScript = document.querySelector("#paypal-sdk");

    const initializeButtons = () => {
      if (!window.paypal || !paypalRef.current) return;

      // Clear previous buttons to avoid duplicates
      paypalRef.current.innerHTML = "";

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
                date,
                total,
                tourTime,
                tourPackage,
                packagePrice,
              }),
            });

            const data = await res.json();
            return data.orderID;
          },

          onApprove: async (data: any) => {
            const res = await fetch("/api/paypal/capture-order", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderID: data.orderID,
              }),
            });

            const output = await res.json();

            // Notify parent
            onSuccess(output);

            // Redirect
            router.push(`/success?orderId=${output.id}`);

            // Close modal with small delay so PayPal cleans up properly
            setTimeout(() => {
              onClose();
            }, 500);
          },

          onError: (err: any) => {
            alert(tr.error);
            console.error("PAYPAL ERROR:", err);
          },
        })
        .render(paypalRef.current);
    };

    const mode = process.env.NEXT_PUBLIC_PAYPAL_MODE?.toLowerCase() || 'dev';
    const clientId = mode === 'live'
      ? process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID
      : process.env.NEXT_PUBLIC_PAYPAL_SANDBOX_CLIENT_ID;

    if (!clientId) {
      console.error('Missing PayPal client ID for the current mode:', mode);
      return;
    }

    if (!existingScript) {
      const script = document.createElement("script");
      script.id = "paypal-sdk";
      script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD`;
      script.async = true;
      script.onload = initializeButtons;
      document.body.appendChild(script);
    } else {
      initializeButtons();
    }

    return () => {
      if (paypalRef.current) {
        paypalRef.current.innerHTML = "";
      }
    };
  }, [name, email, phone, tickets, total, date, tourTime, tourPackage, packagePrice, tr.error]);

  const packageName = tr.packages[tourPackage] ?? tourPackage;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 sm:p-6 md:p-8 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl rounded-2xl bg-white p-6 sm:p-8 shadow-2xl dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-2xl text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-100"
          aria-label={tr.closeLabel}
        >
          &times;
        </button>

        <div className="mb-6 pr-8">
          <h2 className="text-2xl sm:text-3xl font-bold">
            {tr.title}
          </h2>
        </div>

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
          {tr.bookingPrefix}{" "}
          <strong>{tickets} {tickets === 1 ? tr.person : tr.persons}</strong>{" "}
          {tr.bookingForDay}{" "}
          <strong>{date}</strong>.
        </p>

        <p className="mb-2 text-lg">
          <strong>{tr.tourTime}:</strong>{" "}
          {tourTime === "08:00" ? "8:00 AM" : tourTime === "09:00" ? "9:00 AM" : "10:00 AM"}
        </p>

        <p className="mb-4 text-lg">
          <strong>{tr.package}:</strong>{" "}
          {packageName} (${packagePrice} USD/{lang === "es" ? "persona" : "person"})
        </p>

        <p className="text-xl font-bold mb-6">{tr.total}: ${total.toFixed(2)}</p>

        {/* PayPal Buttons / Card Form */}
        <div ref={paypalRef} className="min-h-[140px] w-full" />
      </div>
    </div>
  );
}
