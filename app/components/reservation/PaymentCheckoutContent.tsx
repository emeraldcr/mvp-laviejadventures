// app/components/reservation/PaymentCheckoutContent.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/app/context/LanguageContext";
import { translations } from "@/lib/translations";
import type { OrderDetails } from "@/lib/types/index";
import { getPayPalClientId, getPayPalMode, getPayPalSdkUrl } from "@/lib/paypal-client";

declare global {
  interface Window {
    paypal?: {
      Buttons: (options: Record<string, unknown>) => {
        render: (container: HTMLElement) => Promise<void>;
      };
    };
  }
}

type Props = {
  orderDetails: OrderDetails;
  onSuccess: (orderData: unknown) => void;
};

export default function PaymentCheckoutContent({ orderDetails, onSuccess }: Props) {
  const { lang } = useLanguage();
  const tr = translations[lang].payment;
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [sdkReady, setSdkReady] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const rendered = useRef(false);

  const {
    name,
    email,
    phone,
    tickets,
    total,
    date,
    isoDate,
    tourTime,
    tourPackage,
    tourName,
    packagePrice,
    tourSlug,
  } = orderDetails;

  const payload = useMemo(() => ({
    name: name?.trim() ?? "",
    email: email?.trim() ?? "",
    phone: phone?.trim() ?? "",
    tickets: Number(tickets),
    date: isoDate?.trim() ?? "",
    total: Number(total),
    tourTime: tourTime ?? "",
    tourPackage: tourPackage?.trim() ?? "",
    packagePrice: Number(packagePrice),
    tourSlug: tourSlug?.trim() ?? "",
    tourName: tourName?.trim() ?? "",
    language: lang,
  }), [email, isoDate, lang, name, packagePrice, phone, tickets, total, tourName, tourPackage, tourSlug, tourTime]);

  const missingFields: string[] = [];
  if (!payload.name) missingFields.push("name");
  if (!payload.email) missingFields.push("email");
  if (!payload.phone) missingFields.push("phone");
  if (payload.tickets < 1) missingFields.push("tickets");
  if (!payload.date) missingFields.push("date");
  if (payload.total <= 0) missingFields.push("total");
  if (!payload.tourPackage) missingFields.push("tourPackage");

  const isPayloadValid = missingFields.length === 0;
  const clientId = getPayPalClientId();
  const paypalMode = getPayPalMode();
  const sdkUrl = getPayPalSdkUrl({ components: ["buttons"] });

  useEffect(() => {
    rendered.current = false;
  }, [payload]);

  useEffect(() => {
    if (!isPayloadValid) return;

    if (!clientId || !sdkUrl) {
      setError(`PayPal is not configured for ${paypalMode} mode.`);
      return;
    }

    const existingScript = document.getElementById("paypal-sdk") as HTMLScriptElement | null;

    if (window.paypal) {
      setSdkReady(true);
      return;
    }

    const handleLoad = () => setSdkReady(true);
    const handleError = () => setError("Failed to load PayPal SDK");

    if (existingScript) {
      existingScript.addEventListener("load", handleLoad);
      existingScript.addEventListener("error", handleError);

      return () => {
        existingScript.removeEventListener("load", handleLoad);
        existingScript.removeEventListener("error", handleError);
      };
    }

    const script = document.createElement("script");
    script.id = "paypal-sdk";
    script.src = sdkUrl;
    script.async = true;
    script.setAttribute("data-sdk-integration-source", "button-factory");
    script.addEventListener("load", handleLoad);
    script.addEventListener("error", handleError);
    document.body.appendChild(script);

    return () => {
      script.removeEventListener("load", handleLoad);
      script.removeEventListener("error", handleError);
    };
  }, [clientId, isPayloadValid, paypalMode, sdkUrl]);

  useEffect(() => {
    if (!sdkReady || !window.paypal || rendered.current || !containerRef.current) return;

    rendered.current = true;
    setError(null);
    containerRef.current.innerHTML = "";

    window.paypal
      .Buttons({
        style: { layout: "vertical", color: "gold", shape: "pill", label: "paypal", borderRadius: 10 },
        createOrder: async () => {
          try {
            const res = await fetch("/api/paypal/create-order", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (!data.id) {
              const detail = data?.details?.[0];
              throw new Error(
                detail
                  ? `${detail.issue} ${detail.description}`
                  : data?.message ?? "Unexpected error creating order"
              );
            }
            return data.id as string;
          } catch (err) {
            console.error("createOrder error:", err);
            setError(tr.error ?? "There was an error creating the order");
            throw err;
          }
        },
        onApprove: async (data: { orderID: string }) => {
          const res = await fetch("/api/paypal/capture-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderID: data.orderID }),
          });
          const output = await res.json();

          if (!res.ok || output.status !== "COMPLETED") {
            setError(tr.error ?? "Payment not completed correctly");
            console.error("Capture failed:", output);
            rendered.current = false;
            return;
          }

          sessionStorage.removeItem("reservationOrderDetails");
          onSuccess(output);
          router.push(`/success?orderId=${output.id ?? output.captureID}`);
        },
        onCancel: () => setError(null),
        onError: (err: unknown) => {
          console.error("PayPal error:", err);
          setError(tr.error ?? "There was an error processing the payment");
          rendered.current = false;
        },
      })
      .render(containerRef.current)
      .catch((renderError: unknown) => {
        console.error("PayPal render error:", renderError);
        setError(tr.error ?? "There was an error processing the payment");
        rendered.current = false;
      });
  }, [onSuccess, payload, router, sdkReady, tr.error]);

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

      <div className="w-full rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
        {!isPayloadValid ? (
          <p className="text-sm font-medium text-red-600 dark:text-red-400">
            Reservation data is incomplete: {missingFields.join(", ")}. Please go back and try again.
          </p>
        ) : !clientId ? (
          <p className="text-sm font-medium text-red-600 dark:text-red-400">
            PayPal is not configured for {paypalMode} mode.
          </p>
        ) : (
          <div ref={containerRef} />
        )}
      </div>

      {error && (
        <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
