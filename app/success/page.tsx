// app/payment/success/page.tsx

import { SuccessClient } from "./SuccessClient";
import { getPayPalAuthHeader, getPayPalApiBaseUrl } from "@/lib/paypal";

export default async function SuccessPage(props: {
  searchParams: Promise<{ orderId?: string }>;
}) {
  const { orderId } = await props.searchParams;

  // No redirect — return an error state to the client
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
  // GET PAYPAL ORDER DETAILS SAFELY
  // -------------------------------
  let paypalOrder: any = null;
  let errorMessage: string | null = null;

  try {
    const res = await fetch(
      `${getPayPalApiBaseUrl()}/v2/checkout/orders/${orderId}`,
      {
        headers: {
          Authorization: getPayPalAuthHeader(),
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

  // If any error occurred, show error UI instead
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

  const name = `${payer.name?.given_name || ""} ${
    payer.name?.surname || ""
  }`.trim();
  const email = payer.email_address || "";

  const description = paypalOrder.purchase_units?.[0]?.description || "";
  const ticketsMatch = description.match(/(\d+)\s*tickets?/i);
  const dateMatch = description.match(/para\s+(.*)/i);

  const tickets = ticketsMatch ? ticketsMatch[1] : "";
  const date = dateMatch ? dateMatch[1] : "";

  return (
    <SuccessClient
      email={email}
      name={name}
      date={date}
      tickets={tickets}
    />
  );
}
