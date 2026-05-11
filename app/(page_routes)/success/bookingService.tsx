// app/payment/success/bookingService.ts
import { getPayPalApiBaseUrl, getPayPalAccessToken } from "@/lib/paypal";
import { getDb } from "@/lib/mongodb";
import { auth } from "@/lib/auth";
import { sendConfirmationEmail } from "./emailService";
import type { BookingRecord, SuccessPageResult } from "@/lib/types";

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
    payments?: {
      captures?: Array<{
        id?: string;
        status?: string;
        amount?: { value?: string; currency_code?: string };
      }>;
    };
  }>;
};

export async function processSuccessfulBooking(orderId: string): Promise<SuccessPageResult> {
  const session = await auth();
  const userId = (session?.user as { id?: string })?.id ?? null;
  const userEmail = session?.user?.email ?? null;

  // 1. Fetch PayPal order
  const paypalResult = await fetchPayPalOrder(orderId);
  if (paypalResult.error || !paypalResult.data) {
    return { error: paypalResult.error || "Error al obtener detalles de PayPal." };
  }

  const paypalOrder = paypalResult.data;

  // 2. Parse data
  const parsed = parsePayPalOrder(paypalOrder);

  if (parsed.status !== "COMPLETED" || !parsed.captureId) {
    return {
      error: "El pago de PayPal no está completado. No se creó la reservación.",
      name: parsed.name,
      email: parsed.email,
      phone: parsed.phone,
      date: parsed.date,
      tickets: parsed.ticketsStr,
    };
  }

  // 3. Save booking to database
  const booking: BookingRecord = {
    orderId,
    captureId: parsed.captureId,
    status: parsed.status,
    name: parsed.name,
    email: parsed.email,
    phone: parsed.phone,
    date: parsed.date,
    tickets: parsed.ticketsNumber,
    amount: parsed.amountNumber,
    currency: parsed.currency,
    tourTime: parsed.tourTime,
    tourPackage: parsed.tourPackage,
    tourSlug: parsed.tourSlug,
    tourName: parsed.tourName,
    packagePrice: parsed.packagePrice,
    userId,
    userEmail,
    paypalRaw: paypalOrder,
  };

  const reservationId = await saveBookingToDb(booking);

  // 4. Send confirmation email (non-blocking)
  if (parsed.email) {
    sendConfirmationEmail({
      to: parsed.email,
      name: parsed.name,
      phone: parsed.phone,
      date: parsed.date,
      tickets: parsed.ticketsStr,
      amount: parsed.amountStr,
      currency: parsed.currency,
      orderId,
      captureId: parsed.captureId,
      status: parsed.status,
      reservationId,
      language: parsed.language,
      tourName: parsed.tourName,
      tourPackage: parsed.tourPackage,
      tourTime: parsed.tourTime,
    }).catch(console.error);
  }

  return {
    error: null,
    name: parsed.name,
    email: parsed.email,
    phone: parsed.phone,
    date: parsed.date,
    tickets: parsed.ticketsStr,
    amount: parsed.amountStr,
    currency: parsed.currency,
    orderId,
    captureId: parsed.captureId,
    status: parsed.status,
  };
}

// ====================== Internal Helpers ======================

async function fetchPayPalOrder(orderId: string) {
  try {
    const accessToken = await getPayPalAccessToken();
    const res = await fetch(`${getPayPalApiBaseUrl()}/v2/checkout/orders/${orderId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const data = await res.json();

    if (!res.ok) {
      return {
        error: data?.message || data?.details?.[0]?.description || "PayPal error",
      };
    }
    return { data };
  } catch (err) {
    console.error("PayPal fetch error:", err);
    return { error: "No se pudo conectar con PayPal." };
  }
}

async function saveBookingToDb(record: BookingRecord): Promise<string | null> {
  try {
    const db = await getDb();
    const col = db.collection("Reservations");

    const existing = await col.findOne({ orderId: record.orderId });
    if (existing) return existing._id.toString();

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

function parsePayPalOrder(paypalOrder: PayPalOrderResponse) {
  const payer = paypalOrder.payer || {};
  const purchaseUnit = paypalOrder.purchase_units?.[0] ?? {};
  const payments = purchaseUnit.payments ?? {};
  const capture = payments.captures?.[0] ?? null;

  const payerName = `${payer.name?.given_name || ""} ${payer.name?.surname || ""}`.trim();
  const payerEmail = payer.email_address || "";

  // Try to get persisted context
  let persistedContext: any = null;
  // Note: You can keep this async if needed, but for simplicity we're skipping DB read here
  // Or you can move it to processSuccessfulBooking if you prefer.

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
  const persistedCustomer = persistedContext?.customer ?? null;
  const persistedBooking = persistedContext?.booking ?? null;

  const description = purchaseUnit.description || "";
  const ticketsMatch = description.match(/(\d+)\s*tickets?/i);
  const dateMatch = description.match(/\(([^)]+)\)/) || description.match(/para\s+(.*)/i);

  const name =
    metaCustomer?.name ||
    persistedCustomer?.name ||
    payerName ||
    "Cliente";

  const email =
    metaCustomer?.email ||
    persistedCustomer?.email ||
    payerEmail ||
    "";

  const phone = metaCustomer?.phone || persistedCustomer?.phone || "";

  const ticketsStr =
    String(meta?.tickets ?? "") ||
    String(metaBooking?.tickets ?? "") ||
    String(metaCustomer?.tickets ?? "") ||
    String(persistedBooking?.tickets ?? "") ||
    (ticketsMatch ? ticketsMatch[1] : "");

  const date =
    meta?.date ||
    metaBooking?.date ||
    metaCustomer?.date ||
    persistedBooking?.date ||
    (dateMatch ? dateMatch[1] : "");

  const tourTime = meta?.time || persistedBooking?.tourTime || null;
  const tourPackage = meta?.pkg || persistedBooking?.tourPackage || null;
  const packagePrice = meta?.ppUSD != null ? Number(meta.ppUSD) : persistedBooking?.packagePrice ?? null;
  const tourSlug = meta?.tourSlug || persistedBooking?.tourSlug || null;
  const tourName = meta?.tourName || persistedBooking?.tourName || null;

  const effectiveTourName = tourName || (tourPackage === "basic" ? "Paquete Básico" : tourPackage === "full-day" ? "Día Completo con Almuerzo" : tourPackage === "private" ? "Tour Privado" : "Tour");

  const language: "es" | "en" = 
    (meta?.lang === "en" || meta?.lang === "es" ? meta.lang : 
     persistedBooking?.language === "en" || persistedBooking?.language === "es" ? persistedBooking.language : "es");

  const amountStr = capture?.amount?.value || purchaseUnit.amount?.value || meta?.total || "";
  const currency = capture?.amount?.currency_code || purchaseUnit.amount?.currency_code || "USD";
  const status = capture?.status || paypalOrder.status || "";
  const captureId = capture?.id || "";

  const ticketsNumber = ticketsStr ? parseInt(ticketsStr, 10) : null;
  const amountNumber = amountStr ? parseFloat(amountStr) : null;

  return {
    name,
    email,
    phone,
    date,
    ticketsStr,
    ticketsNumber,
    amountStr,
    amountNumber,
    currency,
    status,
    captureId,
    tourTime,
    tourPackage,
    tourSlug,
    tourName: effectiveTourName,
    packagePrice,
    language,
  };
}