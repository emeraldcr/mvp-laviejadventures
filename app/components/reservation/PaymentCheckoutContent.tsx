"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/app/context/LanguageContext";
import { translations } from "@/lib/translations";
import type { OrderDetails } from "@/lib/types/index";

type Props = {
  orderDetails: OrderDetails;
  onSuccess: (orderData: unknown) => void;
};

export default function PaymentCheckoutContent({ orderDetails, onSuccess }: Props) {
  const { lang, tr } = useLanguage(); // assuming tr is already translations[lang].payment
  const router = useRouter();
  const paypalContainer = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  const paypalLocale = lang === "es" ? "es_XC" : "en_US";

  useEffect(() => {
    if (!paypalContainer.current) return;
    if (!window.paypal?.Buttons) {
      setError(tr.error || "PayPal no está disponible en este momento");
      return;
    }

    const container = paypalContainer.current;
    container.innerHTML = ""; // clean previous (if re-render happens)

    const buttons = window.paypal.Buttons({
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
            ...orderDetails,
            language: lang,
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.orderID) {
          throw new Error(data.message || "No se pudo crear la orden");
        }
        return data.orderID;
      },

      onApprove: async (data) => {
        const res = await fetch("/api/paypal/capture-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderID: data.orderID }),
        });

        const output = await res.json();

        if (!res.ok || output.status !== "COMPLETED") {
          setError(tr.error || "Pago no completado");
          console.error("Capture failed", output);
          return;
        }

        sessionStorage.removeItem("reservationOrderDetails");
        onSuccess(output);
        router.push(`/success?orderId=${output.id}`);
      },

      onCancel: () => setError(null),
      onError: (err) => {
        console.error("PayPal error", err);
        setError(tr.error || "Error al procesar el pago");
      },
    });

    buttons.render(container).catch((e) => {
      console.error("Render failed", e);
      setError("No se pudieron mostrar los botones de PayPal");
    });

    return () => {
      container.innerHTML = "";
      // buttons.close?.();   ← optional, usually not needed
    };
  }, [orderDetails, lang, onSuccess, router, tr.error]); // add tr.error if it can change

  // ... rest of your UI (name, email, total, etc.)

  return (
    <>
      {/* Your summary paragraphs … */}

      <div ref={paypalContainer} className="min-h-[140px] w-full" />

      {error && (
        <p className="mt-4 text-sm text-red-600">{error}</p>
      )}
    </>
  );
}