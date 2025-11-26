"use client";

import React, { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

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

  const { name, email, phone, tickets, total, date } = orderDetails;

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

            // Notificar al padre
            onSuccess(output);

            // Redirigir
            router.push(`/success?orderId=${output.id}`);

            // Cerrar modal con pequeño delay para que PayPal limpie bien
            setTimeout(() => {
              onClose();
            }, 500);
          },

          onError: (err: any) => {
            alert("Hubo un error con PayPal. Intenta nuevamente.");
            console.error("PAYPAL ERROR:", err);
          },
        })
        .render(paypalRef.current);
    };

    const mode = process.env.NEXT_PUBLIC_PAYPAL_MODE?.toLowerCase() || 'dev'; // Assume 'dev' as fallback; ensure NEXT_PUBLIC_PAYPAL_MODE is set in .env

    const clientId = mode === 'live'
      ? process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID
      : process.env.NEXT_PUBLIC_PAYPAL_SANDBOX_CLIENT_ID;

    if (!clientId) {
      console.error('Missing PayPal client ID for the current mode:', mode);
      return; // Or handle error appropriately
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
  }, [name, email, phone, tickets, total, date]);

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
          aria-label="Cerrar"
        >
          &times;
        </button>

        <div className="mb-6 pr-8">
          <h2 className="text-2xl sm:text-3xl font-bold">
            Finalizar Pago con PayPal
          </h2>
        </div>

        <p className="mb-3 text-lg">
          <strong>Nombre:</strong> {name}
        </p>
        <p className="mb-3 text-lg">
          <strong>Email:</strong> {email}
        </p>
        <p className="mb-4 text-lg">
          <strong>Teléfono:</strong> {phone}
        </p>

        <p className="mb-4 text-lg">
          Estás pagando <strong>{tickets} tickets</strong> para el día{" "}
          <strong>{date}</strong>.
        </p>

        <p className="text-xl font-bold mb-6">Total: ${total.toFixed(2)}</p>

        {/* PayPal Buttons / Card Form */}
        <div ref={paypalRef} className="min-h-[140px] w-full" />
      </div>
    </div>
  );
}
