// app/components/PaymentCheckoutContent.tsx
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
  const { lang } = useLanguage();
  const tr = translations[lang].payment;
  const router = useRouter();

  const paypalRef = useRef<HTMLDivElement>(null);
  const [sdkReady, setSdkReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    name,
    email,
    phone,
    tickets,
    total,
    date,
    tourTime,
    tourPackage,
    tourSlug,
    tourName,
    packagePrice,
  } = orderDetails;

  // Poll until the globally-loaded PayPal SDK is ready
  useEffect(() => {
    if (window.paypal?.Buttons) {
      setSdkReady(true);
      return;
    }
    const interval = setInterval(() => {
      if (window.paypal?.Buttons) {
        setSdkReady(true);
        clearInterval(interval);
      }
    }, 100);
    const timeout = setTimeout(() => {
      clearInterval(interval);
      if (!window.paypal?.Buttons) {
        setError(tr.error || "PayPal no está disponible en este momento");
      }
    }, 10_000);
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [tr.error]);

  useEffect(() => {
    if (!sdkReady) return;
    if (!paypalRef.current) return;

    const container = paypalRef.current;
    let buttons: any = null;

    const cleanup = () => {
      if (buttons) {
        try {
          buttons.close?.();
        } catch {}
      }
      container.innerHTML = "";
    };

    cleanup(); // always clean before new render

    const initPayPal = async () => {
      try {
        buttons = window.paypal.Buttons({
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
              setError(tr.error || "El pago no se completó correctamente");
              console.error("Capture failed:", output);
              return;
            }

            // Success path
            sessionStorage.removeItem("reservationOrderDetails");
            onSuccess(output);
            router.push(`/success?orderId=${output.id || output.captureID}`);
          },

          onCancel: () => {
            setError(null);
          },

          onError: (err: unknown) => {
            console.error("PayPal Buttons error:", err);
            setError(tr.error || "Hubo un error al procesar el pago");
          },
        });

        await buttons.render(container);
      } catch (err) {
        console.error("PayPal render failed:", err);
        setError("No se pudieron mostrar los botones de PayPal");
      }
    };

    void initPayPal();

    return () => {
      cleanup();
    };
  }, [
    sdkReady,
    lang,
    tr.error,
    name,
    email,
    phone,
    tickets,
    total,
    date,
    tourTime,
    tourPackage,
    packagePrice,
    tourSlug,
    tourName,
    onSuccess,
    router,
  ]);

  const packageName = tr.packages?.[tourPackage] ?? tourPackage;

  return (
    <div className="space-y-4">
      <p className="text-lg">
        <strong>{tr.nameLabel}:</strong> {name}
      </p>

      <p className="text-lg">
        <strong>{tr.emailLabel}:</strong> {email}
      </p>

      <p className="text-lg">
        <strong>{tr.phoneLabel}:</strong> {phone}
      </p>

      <p className="text-lg">
        <strong>{tr.package}:</strong> {tourName}
      </p>

      <p className="text-lg">
        {tr.bookingPrefix}{" "}
        <strong>
          {tickets} {tickets === 1 ? tr.person : tr.persons}
        </strong>{" "}
        {tr.bookingForDay} <strong>{date}</strong>
      </p>

      <p className="text-lg">
        <strong>{tr.tourTime}:</strong> {tr.timeLabels?.[tourTime] ?? tourTime}
      </p>

      <p className="text-lg">
        <strong>{tr.package}:</strong> {packageName} (${packagePrice} USD / {tr.pricePerPersonUnit})
      </p>

      <p className="text-xl font-bold">
        {tr.total}: ${total.toFixed(2)}
      </p>

      <div className="min-h-[150px] w-full rounded-lg bg-gray-50 dark:bg-gray-800 p-4">
        {!sdkReady && !error && (
          <div className="flex h-[150px] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-yellow-400" />
          </div>
        )}
        <div ref={paypalRef} />
      </div>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 font-medium">
          {error}
        </p>
      )}
    </div>
  );
}