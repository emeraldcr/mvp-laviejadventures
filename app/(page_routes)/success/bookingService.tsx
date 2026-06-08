// app/payment/success/bookingService.ts
import { getPayPalApiBaseUrl, getPayPalAccessToken } from "@/lib/helpers/paypal";
import { getDb } from "@/lib/helpers/mongodb";
import { auth } from "@/lib/auth";
import { sendConfirmationEmail } from "./emailService";
import { COLLECTIONS } from "@/lib/constants/db";
import type { BookingRecord } from "@/lib/types/types";

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

type PayPalOrderContext = {
  customer?: {
    name?: string | null;
    email?: string | null;
    phone?: string | null;
  } | null;
  booking?: {
    tickets?: number | string | null;
    date?: string | null;
    tourTime?: string | null;
    tourPackage?: string | null;
    tourSlug?: string | null;
    tourName?: string | null;
    packagePrice?: number | string | null;
    total?: number | string | null;
    language?: "es" | "en" | string | null;
  } | null;
};

type CustomerMeta = {
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  tickets?: number | string | null;
  date?: string | null;
};

type BookingMeta = {
  tickets?: number | string | null;
  date?: string | null;
  tourTime?: string | null;
  tourPackage?: string | null;
  tourSlug?: string | null;
  tourName?: string | null;
  packagePrice?: number | string | null;
};

type PayPalCustomMeta = CustomerMeta &
  BookingMeta & {
    customer?: CustomerMeta | null;
    booking?: BookingMeta | null;
    time?: string | null;
    pkg?: string | null;
    ppUSD?: number | string | null;
    total?: number | string | null;
    lang?: string | null;
  };

type SuccessPageResult = {
  error: string | null;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  date?: string | null;
  tickets?: string | number | null;
  amount?: string | number | null;
  currency?: string | null;
  orderId?: string | null;
  captureId?: string | null;
  status?: string | null;
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

  // 2. Parse data, backed by the context saved when the PayPal order was created.
  const persistedContext = await fetchPayPalOrderContext(orderId);
  const parsed = parsePayPalOrder(paypalOrder, persistedContext);

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
    const col = db.collection(COLLECTIONS.RESERVATIONS);

    const existing = await col.findOne({ orderId: record.orderId });
    if (existing) {
      const backfill: Partial<BookingRecord> = {};
      const fieldsToBackfill: Array<keyof BookingRecord> = [
        "captureId",
        "status",
        "name",
        "email",
        "phone",
        "date",
        "tickets",
        "amount",
        "currency",
        "tourTime",
        "tourPackage",
        "tourSlug",
        "tourName",
        "packagePrice",
        "userId",
        "userEmail",
      ];

      fieldsToBackfill.forEach((field) => {
        if ((existing[field] == null || existing[field] === "") && record[field] != null && record[field] !== "") {
          backfill[field] = record[field] as never;
        }
      });

      if (Object.keys(backfill).length > 0) {
        await col.updateOne({ _id: existing._id }, { $set: { ...backfill, updatedAt: new Date() } });
      }

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

async function fetchPayPalOrderContext(orderId: string): Promise<PayPalOrderContext | null> {
  try {
    const db = await getDb();
    const context = await db
      .collection<PayPalOrderContext & { orderId: string }>(COLLECTIONS.PAYPAL_ORDER_CONTEXTS)
      .findOne({ orderId });

    return context ?? null;
  } catch (err) {
    console.error("Mongo PayPal context read error:", err);
    return null;
  }
}

function parsePayPalOrder(paypalOrder: PayPalOrderResponse, persistedContext: PayPalOrderContext | null) {
  const payer = paypalOrder.payer || {};
  const purchaseUnit = paypalOrder.purchase_units?.[0] ?? {};
  const payments = purchaseUnit.payments ?? {};
  const capture = payments.captures?.[0] ?? null;

  const payerName = `${payer.name?.given_name || ""} ${payer.name?.surname || ""}`.trim();
  const payerEmail = payer.email_address || "";

  let meta: PayPalCustomMeta | null = null;
  if (purchaseUnit.custom_id) {
    try {
      const parsedMeta = JSON.parse(purchaseUnit.custom_id) as unknown;
      if (parsedMeta && typeof parsedMeta === "object" && !Array.isArray(parsedMeta)) {
        meta = parsedMeta as PayPalCustomMeta;
      }
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
  const rawPackagePrice = meta?.ppUSD ?? persistedBooking?.packagePrice ?? null;
  const packagePrice = rawPackagePrice != null && rawPackagePrice !== "" ? Number(rawPackagePrice) : null;
  const tourSlug = meta?.tourSlug || persistedBooking?.tourSlug || null;
  const tourName = meta?.tourName || persistedBooking?.tourName || null;

  const language: "es" | "en" = 
    (meta?.lang === "en" || meta?.lang === "es" ? meta.lang : 
     persistedBooking?.language === "en" || persistedBooking?.language === "es" ? persistedBooking.language : "es");

  const amountStr = String(capture?.amount?.value || purchaseUnit.amount?.value || meta?.total || "");
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
    tourName,
    packagePrice,
    language,
  };
}
