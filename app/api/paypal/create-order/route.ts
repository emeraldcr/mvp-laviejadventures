// app/api/paypal/create-order/route.ts

import { NextResponse } from "next/server";
import {
  getPayPalApiBaseUrl,
  getPayPalAccessToken,
} from "@/lib/payments/paypal";
import { getDb } from "@/lib/data/mongodb";
import { findTourPackage, isPackageAvailableForDate, isTourPackage, isTourTime } from "@/lib/booking/tour-options";
import {
  isISODateOnly,
  isSafeText,
  isSlugLike,
  isValidEmail,
  isValidPhone,
  normalizeEmail,
  normalizePhone,
  normalizeSlugLike,
  sanitizeText,
  toPositiveCurrency,
  toPositiveInt,
} from "@/lib/security/input-validation";

interface CreateOrderLink {
  rel?: string;
  href?: string;
}

interface CreateOrderResponse {
  id?: string;
  links?: CreateOrderLink[];
}

interface SanitizedCreateOrderPayload {
  name: string;
  email: string;
  phone: string;
  tickets: number;
  total: number;
  date: string;
  tourTime: "08:00" | "09:00" | "10:00";
  tourPackage: "basic" | "full-day" | "private";
  packagePrice: number;
  tourSlug: string | null;
  tourName: string | null;
  specialRequests: string | null;
}

function sanitizeCreateOrderPayload(body: Record<string, unknown>): SanitizedCreateOrderPayload | null {
  const name = sanitizeText(body.name, 100);
  const email = normalizeEmail(body.email);
  const phone = normalizePhone(body.phone);
  const tickets = toPositiveInt(body.tickets);
  const total = toPositiveCurrency(body.total);
  const date = typeof body.date === "string" ? body.date.trim() : "";

  const rawTourTime = typeof body.tourTime === "string" ? body.tourTime.trim() : "";
  if (!isTourTime(rawTourTime)) return null;
  const tourTime = rawTourTime;

  const rawPackage = typeof body.tourPackage === "string" ? body.tourPackage.trim() : "";
  if (!isTourPackage(rawPackage)) return null;
  const tourPackage = rawPackage;

  const selectedPackage = findTourPackage(tourPackage);
  if (!selectedPackage) return null;
  const packagePrice = selectedPackage.priceUSD;
  const clientPackagePrice = body.packagePrice == null ? null : toPositiveCurrency(body.packagePrice);
  const tourSlugRaw = body.tourSlug == null ? "" : normalizeSlugLike(body.tourSlug, 80);
  const tourNameRaw = body.tourName == null ? "" : sanitizeText(body.tourName, 120);
  const specialRequestsRaw = body.specialRequests == null ? "" : sanitizeText(body.specialRequests, 500);

  if (!name || !isSafeText(name, 2)) return null;
  if (!isValidEmail(email)) return null;
  if (!isValidPhone(phone)) return null;
  if (!tickets) return null;
  if (!total) return null;
  if (!isISODateOnly(date)) return null;
  if (tourSlugRaw && !isSlugLike(tourSlugRaw)) return null;
  if (tourNameRaw && !isSafeText(tourNameRaw, 2)) return null;
  if (specialRequestsRaw && !isSafeText(specialRequestsRaw, 2)) return null;
  if (body.packagePrice != null && (!clientPackagePrice || clientPackagePrice !== packagePrice)) return null;
  if (!isPackageAvailableForDate(selectedPackage, date)) return null;
  const subtotal = packagePrice * tickets;
  const maxTaxInclusiveTotal = subtotal * 1.25;
  if (total < subtotal || total > maxTaxInclusiveTotal) {
    // The client sends a tax-inclusive total. Keep the PayPal charge inside
    // the package subtotal plus a conservative maximum tax/service band.
    return null;
  }

  return {
    name,
    email,
    phone,
    tickets,
    total,
    date,
    tourTime,
    tourPackage,
    packagePrice,
    tourSlug: tourSlugRaw || null,
    tourName: tourNameRaw || null,
    specialRequests: specialRequestsRaw || null,
  };
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Record<string, unknown>;
    const payload = sanitizeCreateOrderPayload(body);

    if (!payload) {
      return NextResponse.json(
        { message: "Invalid or missing fields." },
        { status: 400 }
      );
    }

    const { name, email, phone, tickets, total, date, tourTime, tourPackage, packagePrice, tourSlug, tourName, specialRequests } = payload;
    const formattedTotal = total.toFixed(2);

    const packageLabel =
      tourPackage === "basic"
        ? "Paquete Básico"
        : tourPackage === "full-day"
        ? "Día Completo con Almuerzo"
        : tourPackage === "private"
        ? "Tour Privado"
        : "Tour";

    const timeLabel = tourTime === "08:00" ? "8:00 AM" : tourTime === "09:00" ? "9:00 AM" : "10:00 AM";

    // PayPal custom_id max length is 127 chars — keep metadata compact to avoid truncation
    const customIdPayload = JSON.stringify({
      tickets,
      time: tourTime,
      pkg: tourPackage,
      ppUSD: packagePrice,
      tourSlug: tourSlug ?? null,
      tourName: tourName ?? null,
      date,
    });
    const custom_id = customIdPayload.length <= 127 ? customIdPayload : JSON.stringify({
      tickets,
      time: tourTime,
      pkg: tourPackage,
      date,
    });

    // 1) Get OAuth access token
    const accessToken = await getPayPalAccessToken();

    // 2) Create PayPal order using Bearer token
    const res = await fetch(`${getPayPalApiBaseUrl()}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: "USD",
              value: formattedTotal,
            },
            description: `Reserva: ${tickets} pax - ${tourName ?? packageLabel} (${timeLabel}) - ${date}`,
            custom_id,
          },
        ],
      }),
    });

    const data = (await res.json()) as CreateOrderResponse;

    if (!res.ok || !data.id) {
      console.error("PayPal Create Order Error:", data);
      return NextResponse.json(
        { message: "Failed to create PayPal order.", details: data },
        { status: res.status || 500 }
      );
    }

    try {
      const db = await getDb();
      await db.collection("paypal_order_contexts").updateOne(
        { orderId: data.id },
        {
          $set: {
            orderId: data.id,
            customer: {
              name,
              email,
              phone,
            },
            booking: {
              tickets,
              date,
              tourTime,
              tourPackage,
              packagePrice,
              tourSlug: tourSlug ?? null,
              tourName: tourName ?? null,
              total,
              specialRequests,
            },
            updatedAt: new Date(),
          },
          $setOnInsert: {
            createdAt: new Date(),
          },
        },
        { upsert: true }
      );
    } catch (contextError) {
      console.error("Failed to persist PayPal order context:", contextError);
    }

    // Extract approval URL
    const approvalUrl = data.links?.find(
      (link) => link.rel === "approve"
    )?.href;

    if (!approvalUrl) {
      return NextResponse.json(
        {
          message: "Order created but no approval URL returned.",
          orderID: data.id,
          raw: data,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      orderID: data.id,
      approvalUrl,
    });
  } catch (error: unknown) {
    console.error("Server Error:", error);

    return NextResponse.json(
      { message: "Internal server error.", error: error instanceof Error ? error.message : "Unknown" },
      { status: 500 }
    );
  }
}
