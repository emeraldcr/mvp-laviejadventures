// app/api/paypal/create-order/route.ts

import { NextResponse } from "next/server";
import {
  getPayPalApiBaseUrl,
  getPayPalAccessToken,
} from "@/lib/paypal";
import { getDb } from "@/lib/mongodb";
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
  tourTime: string | null;
  tourPackage: "basic" | "full-day" | "private";
  packagePrice: number | null;
  tourSlug: string | null;
  tourName: string | null;
}

function sanitizeCreateOrderPayload(body: Record<string, unknown>): SanitizedCreateOrderPayload | null {
  const name = sanitizeText(body.name, 100);
  const email = normalizeEmail(body.email);
  const phone = normalizePhone(body.phone);
  const tickets = toPositiveInt(body.tickets);
  const total = toPositiveCurrency(body.total);
  const date = typeof body.date === "string" ? body.date.trim() : "";

  const rawTourTime = typeof body.tourTime === "string" ? body.tourTime.trim() : "";
  const allowedTourTimes = new Set(["08:00", "09:00", "10:00"]);
  const tourTime = rawTourTime ? (allowedTourTimes.has(rawTourTime) ? rawTourTime : null) : null;

  const rawPackage = typeof body.tourPackage === "string" ? body.tourPackage.trim() : "";
  const allowedPackages = new Set(["basic", "full-day", "private"]);
  if (!allowedPackages.has(rawPackage)) return null;
  const tourPackage = rawPackage as "basic" | "full-day" | "private";

  const packagePrice = body.packagePrice == null ? null : toPositiveCurrency(body.packagePrice);
  const tourSlugRaw = body.tourSlug == null ? "" : normalizeSlugLike(body.tourSlug, 80);
  const tourNameRaw = body.tourName == null ? "" : sanitizeText(body.tourName, 120);

  if (!name || !isSafeText(name, 2)) return null;
  if (!isValidEmail(email)) return null;
  if (!isValidPhone(phone)) return null;
  if (!tickets) return null;
  if (!total) return null;
  if (!isISODateOnly(date)) return null;
  if (tourSlugRaw && !isSlugLike(tourSlugRaw)) return null;
  if (tourNameRaw && !isSafeText(tourNameRaw, 2)) return null;
  if (body.packagePrice != null && !packagePrice) return null;

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

    const { name, email, phone, tickets, total, date, tourTime, tourPackage, packagePrice, tourSlug, tourName } = payload;
    const formattedTotal = total.toFixed(2);

    const packageLabel =
      tourPackage === "basic"
        ? "Paquete Básico"
        : tourPackage === "full-day"
        ? "Día Completo con Almuerzo"
        : tourPackage === "private"
        ? "Tour Privado"
        : "Tour";

    const timeLabel = tourTime
      ? tourTime === "08:00" ? "8:00 AM" : tourTime === "09:00" ? "9:00 AM" : "10:00 AM"
      : "";

    // PayPal custom_id max length is 127 chars — keep metadata compact to avoid truncation
    const customIdPayload = JSON.stringify({
      tickets,
      time: tourTime ?? null,
      pkg: tourPackage ?? null,
      ppUSD: packagePrice ?? null,
      tourSlug: tourSlug ?? null,
      tourName: tourName ?? null,
      date,
    });
    const custom_id = customIdPayload.length <= 127 ? customIdPayload : JSON.stringify({
      tickets,
      time: tourTime ?? null,
      pkg: tourPackage ?? null,
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
            description: `Reserva: ${tickets} pax - ${tourName ?? packageLabel}${timeLabel ? ` (${timeLabel})` : ""} - ${date}`,
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
              tourTime: tourTime ?? null,
              tourPackage: tourPackage ?? null,
              packagePrice,
              tourSlug: tourSlug ?? null,
              tourName: tourName ?? null,
              total,
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
