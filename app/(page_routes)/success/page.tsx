// app/(page_routes)/success/page.tsx

import { SuccessClient } from "./SuccessClient";
import {
  getPayPalApiBaseUrl,
  getPayPalAccessToken,
} from "@/lib/paypal";

import { Resend } from "resend";
import { getDb } from "@/lib/mongodb";
import { auth } from "@/auth";
import type { BookingRecord, SendEmailParams, SuccessPageProps } from "@/types";
export const dynamic = "force-dynamic";


type PayPalOrderResponse = {
  status?: string;
  message?: string;
  details?: Array<{ description?: string }>;
  payer?: {
    name?: { given_name?: string; surname?: string };
    email_address?: string;
  };
  purchase_units?: Array<{
    amount?: { value?: string; currency_code?: string };
    description?: string;
    custom_id?: string;
    payments?: { captures?: Array<{ id?: string; status?: string; amount?: { value?: string; currency_code?: string } }> };
  }>;
};


async function saveBookingToDb(record: BookingRecord): Promise<string | null> {
  try {
    const db = await getDb();
    const col = db.collection("Reservations");

    // Idempotency: return existing reservation if orderId already saved
    const existing = await col.findOne({ orderId: record.orderId });
    if (existing) {
      return existing._id.toString();
    }

    const result = await col.insertOne({
      ...record,
      createdAt: new Date(),
    });
    return result.insertedId.toString();
  } catch (err) {
    console.error("Mongo insert error:", err);
    return null;
  }
}

// ---------- EMAIL HELPERS (inline) ----------


function createMailBody({
  to,
  name,
  phone,
  date,
  tickets,
  amount,
  currency,
  orderId,
  captureId,
  status,
  reservationId,
}: SendEmailParams) {
  const displayName = name ?? "Cliente";
  const displayDate = date ?? "N/A";
  const displayTickets = tickets ?? "N/A";
  const displayAmount =
    amount != null ? `${amount} ${currency || "USD"}` : "N/A";
  const displayOrderId = orderId || "N/A";
  const displayCaptureId = captureId ?? "N/A";
  const displayStatus = status ?? "N/A";
  const displayReservationId = reservationId ?? "N/A";
  const displayPhone = phone ?? "N/A";

  return `<!DOCTYPE html>
<html>
<head>
  <title>Nueva Reservación - La Vieja Adventures</title>
  <style>
    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    h1 {
      font-size: 24px;
      font-weight: bold;
    }
    .marked {
      background-color: yellow;
      padding: 4px;
    }
    ul {
      line-height: 1.5;
    }
  </style>
</head>
<body>
  <h1>Nueva Reservación</h1>

  <p>Hola,</p>

  <p>Una nueva reservación se ha creado con los siguientes detalles:</p>

  <ul>
    <li><b>Nombre Completo:</b> ${displayName}</li>
    <li><b>Correo Electrónico:</b> ${to ?? "N/A"}</li>
    <li><b>Teléfono:</b> ${displayPhone}</li>
    <li><b>Fecha de la experiencia:</b> ${displayDate}</li>
    <li><b>Cantidad de tickets:</b> ${displayTickets}</li>
    <li><b>Total Pagado:</b> ${displayAmount}</li>
    <li><b>ID de la Orden (PayPal):</b> ${displayOrderId}</li>
    <li><b>ID de Pago / Transacción:</b> ${displayCaptureId}</li>
    <li><b>Estado del pago:</b> ${displayStatus}</li>
    <li><b>ID de Reservación (MongoDB):</b> ${displayReservationId}</li>
  </ul>

  <p class="marked">
    Contacte al manager de reservas (Allan) al
    <a href="https://wa.me/message/IVJFG5N6K6VVB1" target="_blank">
      +506 6233 2535
    </a>
    para mayor asistencia.
  </p>

  <p>Saludos,</p>
  <p>La Vieja Adventures</p>
  <p>Ciudad Esmeralda Tour</p>
</body>
</html>`;
}

async function sendConfirmationEmail(params: SendEmailParams) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("RESEND_API_KEY not set, skipping email sending");
    return;
  }

  const resend = new Resend(apiKey);
  const adminEmail = process.env.RESERVATION_CC || "ciudadesmeraldacr@gmail.com";
  const toEmail = params.to || adminEmail;
  const from =
    process.env.SMTP_FROM ||
    `"La Vieja Adventures" <noreply@laviejaadventures.com>`;

  const html = createMailBody(params);

  const { error } = await resend.emails.send({
    from,
    to: toEmail,
    cc: adminEmail,
    subject: `Nueva reservación creada: ${params.orderId}`,
    html,
  });

  if (error) {
    console.error("Resend error:", error);
    return;
  }

  console.log("Confirmation email sent via Resend");
}

// ---------- MAIN PAGE (PayPal + DB + email + UI) ----------

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  // 🔑 unwrap the Promise from Next
  const { orderId } = await searchParams;

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

  // 0) GET LOGGED-IN USER SESSION
  const session = await auth();
  const userId = (session?.user as { id?: string })?.id ?? null;
  const userEmail = session?.user?.email ?? null;

  // 1) GET PAYPAL ORDER DETAILS
  let paypalOrder: PayPalOrderResponse | null = null;
  let errorMessage: string | null = null;

  try {
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
  } catch (err: unknown) {
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

  // 2) PARSE ORDER DETAILS
  const payer = paypalOrder.payer || {};
  const purchaseUnit = paypalOrder.purchase_units?.[0] ?? {};
  const payments = purchaseUnit.payments ?? {};
  const capture = payments.captures?.[0] ?? null;

  const payerName = `${payer.name?.given_name || ""} ${
    payer.name?.surname || ""
  }`.trim();
  const payerEmail = payer.email_address || "";

  let meta: Record<string, unknown> | null = null;
  if (purchaseUnit.custom_id) {
    try {
      meta = JSON.parse(purchaseUnit.custom_id);
    } catch (e) {
      console.warn("Failed to parse custom_id JSON:", e);
    }
  }

  const metaCustomer = (meta?.customer as Record<string, unknown> | undefined) ?? meta;
  const metaBooking = (meta?.booking as Record<string, unknown> | undefined) ?? meta;

  const description = purchaseUnit.description || "";
  const ticketsMatch = description.match(/(\d+)\s*tickets?/i);
  const dateMatch =
    description.match(/\(([^)]+)\)/) || description.match(/para\s+(.*)/i);

  const name = (metaCustomer?.name as string | undefined) || payerName || "Cliente";
  const email = (metaCustomer?.email as string | undefined) || payerEmail || "";
  const phone = (metaCustomer?.phone as string | undefined) || "";

  const ticketsStr =
    String(meta?.tickets ?? "") ||
    String(metaBooking?.tickets ?? "") ||
    String(metaCustomer?.tickets ?? "") ||
    (ticketsMatch ? ticketsMatch[1] : "");

  const date =
    (meta?.date as string | undefined) ||
    (metaBooking?.date as string | undefined) ||
    (metaCustomer?.date as string | undefined) ||
    (dateMatch ? dateMatch[1] : "");

  const tourTime: string | null = typeof meta?.time === "string" ? meta.time : null;
  const tourPackage: string | null = typeof meta?.pkg === "string" ? meta.pkg : null;
  const packagePrice: number | null =
    meta?.ppUSD != null ? Number(meta.ppUSD) : null;
  const tourSlug: string | null = typeof meta?.tourSlug === "string" ? meta.tourSlug : null;
  const tourName: string | null = typeof meta?.tourName === "string" ? meta.tourName : null;

  const amountStr =
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

  // Convert to numbers for DB
  const ticketsNumber =
    typeof ticketsStr === "string" ? parseInt(ticketsStr, 10) || null : null;
  const amountNumber =
    typeof amountStr === "string" ? parseFloat(amountStr) || null : null;

  // 3) DB INSERT + EMAIL
  const booking: BookingRecord = {
    orderId,
    captureId: captureId || null,
    status: status || null,
    name: name || null,
    email: email || null,
    phone: phone || null,
    date: date || null,
    tickets: ticketsNumber,
    amount: amountNumber,
    currency: currency || null,
    tourTime,
    tourPackage,
    tourSlug,
    tourName,
    packagePrice,
    // Link reservation to the logged-in user
    userId: userId,
    userEmail: userEmail,
    paypalRaw: paypalOrder,
  };

  const reservationId = await saveBookingToDb(booking);

  await Promise.allSettled([
    email
      ? sendConfirmationEmail({
          to: email,
          name,
          phone,
          date,
          tickets: ticketsStr,
          amount: amountStr,
          currency,
          orderId,
          captureId,
          status,
          reservationId,
        })
      : Promise.resolve(),
  ]);

  // 4) RENDER SUCCESS PAGE
  return (
    <SuccessClient
      error={null}
      name={name}
      email={email}
      phone={phone}
      date={date}
      tickets={ticketsStr}
      amount={amountStr}
      currency={currency}
      orderId={orderId}
      captureId={captureId}
      status={status}
    />
  );
}
