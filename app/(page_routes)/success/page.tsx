// app/(page_routes)/success/page.tsx

import { SuccessClient } from "./SuccessClient";
import {
  getPayPalApiBaseUrl,
  getPayPalAccessToken,
} from "@/lib/paypal";

import nodemailer from "nodemailer";
import { MongoClient, Db } from "mongodb";
export const dynamic = "force-dynamic";

type SuccessPageProps = {
  searchParams: Promise<{ orderId?: string }>;
};

// ---------- MONGO HELPERS (inline) ----------

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

async function getDb(): Promise<Db> {
  if (cachedDb) return cachedDb;

  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB || "lva";

  if (!uri) {
    throw new Error("MONGODB_URI is not set in env");
  }

  const client = new MongoClient(uri);
  await client.connect();

  cachedClient = client;
  cachedDb = client.db(dbName);

  return cachedDb;
}

type BookingRecord = {
  orderId: string;
  captureId: string | null;
  status: string | null;
  name: string | null;
  email: string | null;
  phone: string | null;
  date: string | null;
  tickets: number | null;
  amount: number | null;
  currency: string | null;
  tourTime: string | null;
  tourPackage: string | null;
  packagePrice: number | null;
  createdAt?: Date;
  paypalRaw?: unknown;
};

async function saveBookingToDb(record: BookingRecord): Promise<string | null> {
  try {
    const db = await getDb();
    const result = await db.collection("Reservations").insertOne({
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

function createTransporter() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    console.warn("SMTP env vars not fully set, skipping email sending");
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true for 465, false otherwise
    auth: { user, pass },
  });
}

type SendEmailParams = {
  to: string | null;
  name: string | null;
  phone: string | null;
  date: string | null;
  tickets: string | number | null;
  amount: string | number | null;
  currency: string | null;
  orderId: string;
  captureId: string | null;
  status: string | null;
  reservationId: string | null;
};

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
  const transporter = createTransporter();
  if (!transporter) return;

  const adminEmail = process.env.RESERVATION_CC || "ciudadesmeraldacr@gmail.com";
  const toEmail = params.to || adminEmail;

  await transporter.verify();

  const html = createMailBody(params);

  await transporter.sendMail({
    from:
      process.env.SMTP_FROM ||
      `"La Vieja Adventures" <ciudadesmeraldacr@gmail.com>`,
    to: toEmail,
    cc: [adminEmail],
    subject: `Nueva reservación creada: ${params.orderId}`,
    html,
  });

  console.log("Confirmation email sent");
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

  // 1) GET PAYPAL ORDER DETAILS
  let paypalOrder: any = null;
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

  // 2) PARSE ORDER DETAILS
  const payer = paypalOrder.payer || {};
  const purchaseUnit = paypalOrder.purchase_units?.[0] ?? {};
  const payments = purchaseUnit.payments ?? {};
  const capture = payments.captures?.[0] ?? null;

  const payerName = `${payer.name?.given_name || ""} ${
    payer.name?.surname || ""
  }`.trim();
  const payerEmail = payer.email_address || "";

  let meta: any = null;
  if (purchaseUnit.custom_id) {
    try {
      meta = JSON.parse(purchaseUnit.custom_id);
    } catch (e) {
      console.warn("Failed to parse custom_id JSON:", e);
    }
  }

  const metaCustomer = meta?.customer ?? meta;
  const metaBooking = meta?.booking ?? meta;

  const description = purchaseUnit.description || "";
  const ticketsMatch = description.match(/(\d+)\s*tickets?/i);
  const dateMatch =
    description.match(/\(([^)]+)\)/) || description.match(/para\s+(.*)/i);

  const name = metaCustomer?.name || payerName || "Cliente";
  const email = metaCustomer?.email || payerEmail || "";
  const phone = metaCustomer?.phone || "";

  const ticketsStr =
    meta?.tickets?.toString() ||
    metaBooking?.tickets?.toString() ||
    metaCustomer?.tickets?.toString() ||
    (ticketsMatch ? ticketsMatch[1] : "");

  const date =
    meta?.date ||
    metaBooking?.date ||
    metaCustomer?.date ||
    (dateMatch ? dateMatch[1] : "");

  const tourTime: string | null = meta?.time ?? null;
  const tourPackage: string | null = meta?.pkg ?? null;
  const packagePrice: number | null =
    meta?.ppUSD != null ? Number(meta.ppUSD) : null;

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
    packagePrice,
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
