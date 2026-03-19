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

  // Fallback: if isoDate is missing but date is already ISO format (from AI flow), use it
  const resolvedIsoDate = isoDate?.trim() || (date?.match(/^\d{4}-\d{2}-\d{2}$/) ? date.trim() : "");

  const payload = useMemo(() => ({
    name: name?.trim() ?? "",
    email: email?.trim() ?? "",
    phone: phone?.trim() ?? "",
    tickets: Number(tickets),
    date: resolvedIsoDate,
    total: Number(total),
    tourTime: tourTime ?? "",
    tourPackage: tourPackage?.trim() ?? "",
    packagePrice: Number(packagePrice),
    tourSlug: tourSlug?.trim() ?? "",
    tourName: tourName?.trim() ?? "",
    language: lang,
  }), [email, resolvedIsoDate, lang, name, packagePrice, phone, tickets, total, tourName, tourPackage, tourSlug, tourTime]);

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

  // ── DEBUG: log everything on every render ────────────────────────────────────
  console.group("[PayPal Checkout] orderDetails received");
  console.log("raw orderDetails:", JSON.parse(JSON.stringify(orderDetails)));
  console.log("  name       :", name);
  console.log("  email      :", email);
  console.log("  phone      :", phone);
  console.log("  tickets    :", tickets, "→", Number(tickets));
  console.log("  total      :", total, "→", Number(total));
  console.log("  date       :", date, " ← display");
  console.log("  isoDate    :", isoDate, " ← from orderDetails");
  console.log("  resolvedIsoDate:", resolvedIsoDate, " ← used as payload.date");
  console.log("  tourTime   :", tourTime);
  console.log("  tourPackage:", tourPackage);
  console.log("  tourName   :", tourName);
  console.log("  tourSlug   :", tourSlug);
  console.log("  packagePrice:", packagePrice);
  console.groupEnd();

  console.group("[PayPal Checkout] payload built");
  console.log("payload:", payload);
  console.log("missingFields:", missingFields);
  console.log("isPayloadValid:", isPayloadValid);
  console.log("clientId:", clientId ? `${clientId.slice(0, 8)}…` : "MISSING");
  console.log("paypalMode:", paypalMode);
  console.log("sdkUrl:", sdkUrl);
  console.groupEnd();
  // ────────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    rendered.current = false;
  }, [payload]);

  useEffect(() => {
    if (!isPayloadValid) {
      console.warn("[PayPal SDK] skipping SDK load — payload invalid. missingFields:", missingFields);
      return;
    }

    if (!clientId || !sdkUrl) {
      const msg = `PayPal is not configured for ${paypalMode} mode. clientId="${clientId}" sdkUrl="${sdkUrl}"`;
      console.error("[PayPal SDK]", msg);
      setError(`PayPal is not configured for ${paypalMode} mode.`);
      return;
    }

    console.log("[PayPal SDK] attempting to load. sdkUrl:", sdkUrl);

    const existingScript = document.getElementById("paypal-sdk") as HTMLScriptElement | null;

    if (window.paypal) {
      console.log("[PayPal SDK] window.paypal already present — marking ready");
      setSdkReady(true);
      return;
    }

    const handleLoad = () => {
      console.log("[PayPal SDK] script loaded ✓. window.paypal:", !!window.paypal);
      setSdkReady(true);
    };
    const handleError = (e: Event) => {
      console.error("[PayPal SDK] script failed to load:", e, "src:", sdkUrl);
      setError("Failed to load PayPal SDK");
    };

    if (existingScript) {
      console.log("[PayPal SDK] re-using existing <script> tag:", existingScript.src);
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
    console.log("[PayPal SDK] injecting <script> tag:", sdkUrl);
    document.body.appendChild(script);

    return () => {
      script.removeEventListener("load", handleLoad);
      script.removeEventListener("error", handleError);
    };
  }, [clientId, isPayloadValid, paypalMode, sdkUrl]);

  useEffect(() => {
    console.log("[PayPal Buttons] render effect. sdkReady:", sdkReady, "window.paypal:", !!window.paypal, "rendered.current:", rendered.current, "containerRef:", !!containerRef.current);
    if (!sdkReady || !window.paypal || rendered.current || !containerRef.current) return;

    rendered.current = true;
    setError(null);
    containerRef.current.innerHTML = "";

    console.log("[PayPal Buttons] calling window.paypal.Buttons() with payload:", payload);

    window.paypal
      .Buttons({
        style: { layout: "vertical", color: "gold", shape: "pill", label: "paypal", borderRadius: 10 },
        createOrder: async () => {
          console.log("[PayPal createOrder] sending payload to /api/paypal/create-order:", payload);
          try {
            const res = await fetch("/api/paypal/create-order", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });
            const data = await res.json();
            console.log("[PayPal createOrder] API response status:", res.status, "body:", data);
            if (!data.id) {
              const detail = data?.details?.[0];
              const msg = detail
                ? `${detail.issue} ${detail.description}`
                : data?.message ?? "Unexpected error creating order";
              console.error("[PayPal createOrder] no order id in response. msg:", msg, "full response:", data);
              throw new Error(msg);
            }
            console.log("[PayPal createOrder] order created ✓ id:", data.id);
            return data.id as string;
          } catch (err) {
            console.error("[PayPal createOrder] caught error:", err);
            setError(tr.error ?? "There was an error creating the order");
            throw err;
          }
        },
        onApprove: async (data: { orderID: string }) => {
          console.log("[PayPal onApprove] orderID:", data.orderID);
          const res = await fetch("/api/paypal/capture-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderID: data.orderID }),
          });
          const output = await res.json();
          console.log("[PayPal onApprove] capture response status:", res.status, "body:", output);

          if (!res.ok || output.status !== "COMPLETED") {
            console.error("[PayPal onApprove] capture failed:", output);
            setError(tr.error ?? "Payment not completed correctly");
            rendered.current = false;
            return;
          }

          console.log("[PayPal onApprove] capture success ✓ status:", output.status);
          sessionStorage.removeItem("reservationOrderDetails");
          onSuccess(output);
          router.push(`/success?orderId=${output.id ?? output.captureID}`);
        },
        onCancel: () => {
          console.log("[PayPal onCancel] user cancelled");
          setError(null);
        },
        onError: (err: unknown) => {
          console.error("[PayPal onError]", err);
          setError(tr.error ?? "There was an error processing the payment");
          rendered.current = false;
        },
      })
      .render(containerRef.current)
      .then(() => console.log("[PayPal Buttons] render() resolved ✓"))
      .catch((renderError: unknown) => {
        console.error("[PayPal Buttons] render() rejected:", renderError);
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
