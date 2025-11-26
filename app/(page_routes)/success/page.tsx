// app/payment/success/page.tsx

import { SuccessClient } from "./SuccessClient";
import {
  getPayPalApiBaseUrl,
  getPayPalAccessToken,
} from "@/lib/paypal";

type SuccessPageProps = {
  searchParams: { orderId?: string };
};

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const { orderId } = searchParams;

  if (!orderId) {
    return (
      <SuccessClient
        error="No se encontró el ID de la orden."
        name=""
        email=""
        date=""
        tickets=""
      />
    );
  }

  // -------------------------------
  // GET PAYPAL ORDER DETAILS
  // -------------------------------
  let paypalOrder: any = null;
  let errorMessage: string | null = null;

  try {
    // Use OAuth token (Bearer), not Basic
    const accessToken = await getPayPalAccessToken();

    const res = await fetch(
      `${getPayPalApiBaseUrl()}/v2/checkout/orders/${orderId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    paypalOrder = await res.json();

    if (!res.ok) {
      console.error("PayPal ERROR:", paypalOrder);
      errorMessage =
        paypalOrder?.message ||
        paypalOrder?.details?.[0]?.description ||
        "Error al obtener detalles de PayPal.";
    }
  } catch (err: any) {
    console.error("PayPal fetch error:", err);
    errorMessage = "No se pudo conectar con PayPal.";
  }

  if (errorMessage) {
    return (
      <SuccessClient
        error={errorMessage}
        name=""
        email=""
        date=""
        tickets=""
      />
    );
  }

  // -------------------------------
  // PARSE ORDER DETAILS
  // -------------------------------

  const payer = paypalOrder.payer || {};
  const purchaseUnit = paypalOrder.purchase_units?.[0] ?? {};
  const payments = purchaseUnit.payments ?? {};
  const capture = payments.captures?.[0] ?? null;

  // Full payer name + email from PayPal
  const payerName = `${payer.name?.given_name || ""} ${
    payer.name?.surname || ""
  }`.trim();
  const payerEmail = payer.email_address || "";

  // Try to read your custom metadata from custom_id
  // Supports both:
  // - JSON string: { customer: { name, email, phone }, booking: { tickets, date }, total }
  // - or any other flat JSON shape
  let meta: any = null;
  if (purchaseUnit.custom_id) {
    try {
      meta = JSON.parse(purchaseUnit.custom_id);
    } catch (e) {
      console.warn("Failed to parse custom_id JSON:", e);
      // If you changed custom_id to a short string like "tickets-2-2025-01-01",
      // parsing will fail here — that’s fine, we fall back to description.
    }
  }

  const metaCustomer = meta?.customer ?? meta;
  const metaBooking = meta?.booking ?? meta;

  // Also fallback to description parsing if needed
  const description = purchaseUnit.description || "";
  // From: "Reserva de X tickets (YYYY-MM-DD)" etc.
  const ticketsMatch = description.match(/(\d+)\s*tickets?/i);
  // Grab text inside parentheses (...) as date
  const dateMatch =
    description.match(/\(([^)]+)\)/) || description.match(/para\s+(.*)/i);

  // Prefer metadata, fallback to PayPal data / description
  const name = metaCustomer?.name || payerName || "Cliente";
  const email = metaCustomer?.email || payerEmail || "";
  const phone = metaCustomer?.phone || "";

  const tickets =
    metaBooking?.tickets?.toString() ||
    metaCustomer?.tickets?.toString() ||
    (ticketsMatch ? ticketsMatch[1] : "");

  const date =
    metaBooking?.date ||
    metaCustomer?.date ||
    (dateMatch ? dateMatch[1] : "");

  const amount =
    capture?.amount?.value ||
    purchaseUnit.amount?.value ||
    meta?.total ||
    "";
  const currency =
    capture?.amount?.currency_code ||
    purchaseUnit.amount?.currency_code ||
    "USD";
  const status = capture?.status || paypalOrder.status || "";
  const captureId = capture?.id || "";

  return (
    <SuccessClient
      error={null}
      name={name}
      email={email}
      phone={phone}
      date={date}
      tickets={tickets}
      amount={amount}
      currency={currency}
      orderId={orderId}
      captureId={captureId}
      status={status}
    />
  );
}
