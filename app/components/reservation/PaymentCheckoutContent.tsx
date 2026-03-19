// app/components/reservation/PaymentCheckoutContent.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useLanguage } from "@/app/context/LanguageContext";
import { translations } from "@/lib/translations";
import type { OrderDetails } from "@/lib/types/index";

type Props = {
  orderDetails: OrderDetails;
  onSuccess: (orderData: unknown) => void;
};

const mode = process.env.NEXT_PUBLIC_PAYPAL_MODE?.toLowerCase() || "sandbox";
const clientId =
  mode === "live"
    ? process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!
    : process.env.NEXT_PUBLIC_PAYPAL_SANDBOX_CLIENT_ID!;

const paypalScriptOptions = {
  clientId,
  currency: "USD",
  intent: "capture",
  components: "buttons,funding-eligibility",
  "enable-funding": "card",
};

export default function PaymentCheckoutContent({ orderDetails, onSuccess }: Props) {
  const { lang } = useLanguage();
  const tr = translations[lang].payment;
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

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

  // Build an explicit, normalized payload — never spread raw state into the request
  const payload = {
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
  };

  // Gate: only render PayPal buttons when all required fields are present and valid
  const missingFields: string[] = [];
  if (!payload.name) missingFields.push("name");
  if (!payload.email) missingFields.push("email");
  if (!payload.phone) missingFields.push("phone");
  if (payload.tickets < 1) missingFields.push("tickets");
  if (!payload.date) missingFields.push("date");
  if (payload.total <= 0) missingFields.push("total");
  if (!payload.tourPackage) missingFields.push("tourPackage");

  const isPayloadValid = missingFields.length === 0;

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
        ) : (
          <PayPalScriptProvider options={paypalScriptOptions}>
            <PayPalButtons
              style={{ layout: "vertical", color: "gold", shape: "pill", label: "paypal", borderRadius: 10 }}
              createOrder={async () => {
                console.log("createOrder payload", payload);
                try {
                  const res = await fetch("/api/paypal/create-order", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                  });

                  const orderData = await res.json();

                  if (!orderData.id) {
                    const errorDetail = orderData?.details?.[0];
                    const errorMessage = errorDetail
                      ? `${errorDetail.issue} ${errorDetail.description} (${orderData.debug_id})`
                      : orderData?.message || "Unexpected error occurred, please try again.";
                    throw new Error(errorMessage);
                  }

                  return orderData.id;
                } catch (err) {
                  console.error("createOrder error:", err);
                  throw err;
                }
              }}
              onApprove={async (data) => {
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

                sessionStorage.removeItem("reservationOrderDetails");
                onSuccess(output);
                router.push(`/success?orderId=${output.id || output.captureID}`);
              }}
              onCancel={() => setError(null)}
              onError={(err) => {
                console.error("PayPal Buttons error:", err);
                setError(tr.error || "Hubo un error al procesar el pago");
              }}
            />
          </PayPalScriptProvider>
        )}
      </div>

      {error && (
        <p className="text-sm font-medium text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
