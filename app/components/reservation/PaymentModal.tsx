"use client";

import React, { useEffect, useRef } from "react";

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

  const { name, email, phone, tickets, total, date } = orderDetails;

  useEffect(() => {
    const existingScript = document.querySelector("#paypal-sdk");

    const initializeButtons = () => {
      if (!window.paypal || !paypalRef.current) return;
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
            onSuccess(output);
            onClose();
          },

          onError: (err: any) => {
            alert("Hubo un error con PayPal. Intenta nuevamente.");
            console.error("PAYPAL ERROR:", err);
          },
        })
        .render(paypalRef.current);
    };

    if (!existingScript) {
      const script = document.createElement("script");
      script.id = "paypal-sdk";
      script.src =
        "https://www.paypal.com/sdk/js?client-id=AY_TdfjxpDefXQr5p7YVKLignlaJFLFx22-w7nl-vfaiKSz9GPt8dSEvA8cur9vXeL4MfX_zPqD2AWuG&currency=USD";
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
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-2xl dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-6">
          <h2 className="text-3xl font-bold">Finalizar Pago con PayPal</h2>
          <button
            onClick={onClose}
            className="text-3xl text-zinc-500 hover:text-zinc-800"
          >
            &times;
          </button>
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

        <p className="text-xl font-bold mb-4">Total: ${total.toFixed(2)}</p>

        <div ref={paypalRef} className="min-h-[120px] w-full" />
      </div>
    </div>
  );
}
