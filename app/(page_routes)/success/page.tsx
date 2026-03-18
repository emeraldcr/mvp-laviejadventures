// app/(page_routes)/success/page.tsx

import { SuccessClient } from "./SuccessClient";
import GoogleAdsScript from "@/app/components/analytics/GoogleAdsScript";
import {
  getPayPalApiBaseUrl,
  getPayPalAccessToken,
} from "@/lib/paypal";

import { Resend } from "resend";
import { getDb } from "@/lib/mongodb";
import { auth } from "@/lib/auth";
import type { BookingRecord, SendEmailParams, SuccessPageProps } from "@/lib/types/index";
export const dynamic = "force-dynamic";

const googleAdsId = process.env.GOOGLE_ADS_ID ?? process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;


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
  language = "es",
  tourName,
  tourPackage,
  tourTime,
}: SendEmailParams) {
  const isEnglish = language === "en";
  const copy = isEnglish
    ? {
        title: "New Booking - La Vieja Adventures",
        heading: "New Booking",
        greeting: "Hello,",
        intro: "A new booking has been created with the following details:",
        fullName: "Full Name",
        email: "Email",
        phone: "Phone",
        date: "Experience Date",
        tickets: "Number of Tickets",
        tour: "Tour",
        package: "Selected Package",
        tourTime: "Tour Time",
        total: "Total Paid",
        orderId: "Order ID (PayPal)",
        paymentId: "Payment / Transaction ID",
        paymentStatus: "Payment Status",
        reservationId: "Reservation ID (MongoDB)",
        assistance: "Contact the reservations manager (Allan) at",
        assistanceSuffix: "for further assistance.",
        regards: "Best regards,",
      }
    : {
        title: "Nueva Reservación - La Vieja Adventures",
        heading: "Nueva Reservación",
        greeting: "Hola,",
        intro: "Una nueva reservación se ha creado con los siguientes detalles:",
        fullName: "Nombre Completo",
        email: "Correo Electrónico",
        phone: "Teléfono",
        date: "Fecha de la experiencia",
        tickets: "Cantidad de tickets",
        tour: "Tour",
        package: "Paquete elegido",
        tourTime: "Hora del tour",
        total: "Total Pagado",
        orderId: "ID de la Orden (PayPal)",
        paymentId: "ID de Pago / Transacción",
        paymentStatus: "Estado del pago",
        reservationId: "ID de Reservación (MongoDB)",
        assistance: "Contacte al manager de reservas (Allan) al",
        assistanceSuffix: "para mayor asistencia.",
        regards: "Saludos,",
      };

  const naLabel = isEnglish ? "N/A" : "N/D";
  const displayName = name ?? (isEnglish ? "Customer" : "Cliente");
  const displayDate = date ?? naLabel;
  const displayTickets = tickets ?? naLabel;
  const displayAmount = amount != null ? `${amount} ${currency || "USD"}` : naLabel;
  const displayOrderId = orderId || naLabel;
  const displayCaptureId = captureId ?? naLabel;
  const displayStatus = status ?? naLabel;
  const displayReservationId = reservationId ?? naLabel;
  const displayPhone = phone ?? naLabel;
  const displayTourName = tourName ?? naLabel;
  const displayTourPackage = tourPackage ?? naLabel;
  const displayTourTime = tourTime ?? naLabel;

  return `<!DOCTYPE html>
<html>
<head>
  <title>${copy.title}</title>
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
  <h1>${copy.heading}</h1>

  <p>${copy.greeting}</p>

  <p>${copy.intro}</p>

  <ul>
    <li><b>${copy.fullName}:</b> ${displayName}</li>
    <li><b>${copy.email}:</b> ${to ?? naLabel}</li>
    <li><b>${copy.phone}:</b> ${displayPhone}</li>
    <li><b>${copy.date}:</b> ${displayDate}</li>
    <li><b>${copy.tickets}:</b> ${displayTickets}</li>
    <li><b>${copy.tour}:</b> ${displayTourName}</li>
    <li><b>${copy.package}:</b> ${displayTourPackage}</li>
    <li><b>${copy.tourTime}:</b> ${displayTourTime}</li>
    <li><b>${copy.total}:</b> ${displayAmount}</li>
    <li><b>${copy.orderId}:</b> ${displayOrderId}</li>
    <li><b>${copy.paymentId}:</b> ${displayCaptureId}</li>
    <li><b>${copy.paymentStatus}:</b> ${displayStatus}</li>
    <li><b>${copy.reservationId}:</b> ${displayReservationId}</li>
  </ul>

  <p class="marked">
    ${copy.assistance}
    <a href="https://wa.me/message/IVJFG5N6K6VVB1" target="_blank">
      +506 6233 2535
    </a>
    ${copy.assistanceSuffix}
  </p>

  <p>${copy.regards}</p>
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
    subject: `${params.language === "en" ? "New booking created" : "Nueva reservación creada"}: ${params.orderId}`,
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
  const resolvedSearchParams = (await searchParams) as { orderId?: string; token?: string };
  const { orderId, token } = resolvedSearchParams;
  const resolvedOrderId = orderId || token;

  if (!resolvedOrderId) {
    return (
    <>
      <GoogleAdsScript googleAdsId={googleAdsId} />
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

    let res = await fetch(
      `${getPayPalApiBaseUrl()}/v2/checkout/orders/${resolvedOrderId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    paypalOrder = await res.json();

    if (res.ok && paypalOrder?.status === "APPROVED") {
      const captureRes = await fetch(
        `${getPayPalApiBaseUrl()}/v2/checkout/orders/${resolvedOrderId}/capture`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
          cache: "no-store",
        }
      );

      const capturedOrder = await captureRes.json();

      if (!captureRes.ok) {
        console.error("PayPal capture on return ERROR:", capturedOrder);
        errorMessage =
          capturedOrder?.message ||
          capturedOrder?.details?.[0]?.description ||
          "Error al capturar el pago de PayPal.";
      } else {
        paypalOrder = capturedOrder;
        res = captureRes;
      }
    }

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
    <>
      <GoogleAdsScript googleAdsId={googleAdsId} />
      <SuccessClient
        error={errorMessage}
        name=""
        email=""
        date=""
        tickets=""
      />
    );
  }

  if (!paypalOrder) {
    return (
    <>
      <GoogleAdsScript googleAdsId={googleAdsId} />
      <SuccessClient
        error="No se pudieron obtener los detalles del pago de PayPal."
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

  let persistedContext: Record<string, unknown> | null = null;
  try {
    const db = await getDb();
    persistedContext = (await db.collection("paypal_order_contexts").findOne({ orderId: resolvedOrderId })) as Record<string, unknown> | null;
  } catch (contextErr) {
    console.warn("Failed to read persisted PayPal context:", contextErr);
  }

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
  const persistedCustomer = (persistedContext?.customer as Record<string, unknown> | undefined) ?? null;
  const persistedBooking = (persistedContext?.booking as Record<string, unknown> | undefined) ?? null;

  const description = purchaseUnit.description || "";
  const ticketsMatch = description.match(/(\d+)\s*tickets?/i);
  const dateMatch =
    description.match(/\(([^)]+)\)/) || description.match(/para\s+(.*)/i);

  const name =
    (metaCustomer?.name as string | undefined) ||
    (persistedCustomer?.name as string | undefined) ||
    payerName ||
    "Cliente";
  const email =
    (metaCustomer?.email as string | undefined) ||
    (persistedCustomer?.email as string | undefined) ||
    payerEmail ||
    "";
  const phone =
    (metaCustomer?.phone as string | undefined) ||
    (persistedCustomer?.phone as string | undefined) ||
    "";

  const ticketsStr =
    String(meta?.tickets ?? "") ||
    String(metaBooking?.tickets ?? "") ||
    String(metaCustomer?.tickets ?? "") ||
    String(persistedBooking?.tickets ?? "") ||
    (ticketsMatch ? ticketsMatch[1] : "");

  const date =
    (meta?.date as string | undefined) ||
    (metaBooking?.date as string | undefined) ||
    (metaCustomer?.date as string | undefined) ||
    (persistedBooking?.date as string | undefined) ||
    (dateMatch ? dateMatch[1] : "");

  const tourTime: string | null =
    (typeof meta?.time === "string" ? meta.time : null) ||
    (typeof persistedBooking?.tourTime === "string" ? persistedBooking.tourTime : null);
  const tourPackage: string | null =
    (typeof meta?.pkg === "string" ? meta.pkg : null) ||
    (typeof persistedBooking?.tourPackage === "string" ? persistedBooking.tourPackage : null);
  const packagePrice: number | null =
    meta?.ppUSD != null
      ? Number(meta.ppUSD)
      : persistedBooking?.packagePrice != null
      ? Number(persistedBooking.packagePrice)
      : null;
  const tourSlug: string | null =
    (typeof meta?.tourSlug === "string" ? meta.tourSlug : null) ||
    (typeof persistedBooking?.tourSlug === "string" ? persistedBooking.tourSlug : null);
  const tourName: string | null =
    (typeof meta?.tourName === "string" ? meta.tourName : null) ||
    (typeof persistedBooking?.tourName === "string" ? persistedBooking.tourName : null);
  const language: "es" | "en" =
    (meta?.lang === "en" || meta?.lang === "es"
      ? (meta.lang as "es" | "en")
      : persistedBooking?.language === "en" || persistedBooking?.language === "es"
      ? (persistedBooking.language as "es" | "en")
      : "es");

  const amountStr =
    capture?.amount?.value ||
    purchaseUnit.amount?.value ||
    (meta?.total != null ? String(meta.total) : "");
  const currency =
    capture?.amount?.currency_code ||
    purchaseUnit.amount?.currency_code ||
    "USD";
  const status = capture?.status || paypalOrder.status || "";
  const captureId = capture?.id || "";

  if (status !== "COMPLETED" || !captureId) {
    return (
    <>
      <GoogleAdsScript googleAdsId={googleAdsId} />
      <SuccessClient
        error="El pago de PayPal no está completado. No se creó la reservación."
        name={name}
        email={email}
        phone={phone}
        date={date}
        tickets={ticketsStr}
      />
    );
  }

  // Convert to numbers for DB
  const ticketsNumber =
    typeof ticketsStr === "string" ? parseInt(ticketsStr, 10) || null : null;
  const amountNumber =
    typeof amountStr === "string" ? parseFloat(amountStr) || null : null;

  // 3) DB INSERT + EMAIL
  const booking: BookingRecord = {
    orderId: resolvedOrderId,
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
          orderId: resolvedOrderId,
          captureId,
          status,
          reservationId,
          language,
          tourName,
          tourPackage,
          tourTime,
        })
      : Promise.resolve(),
  ]);

  // 4) RENDER SUCCESS PAGE
  return (
    <>
      <GoogleAdsScript googleAdsId={googleAdsId} />
      <SuccessClient
        error={null}
        name={name}
        email={email}
        phone={phone}
        date={date}
        tickets={ticketsStr}
        amount={amountStr}
        currency={currency}
        orderId={resolvedOrderId}
        captureId={captureId}
        status={status}
      />
    </>
  );
}
