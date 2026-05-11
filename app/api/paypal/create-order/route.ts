// app/api/paypal/create-order/route.ts

import { NextResponse } from "next/server";
import {
  getPayPalApiBaseUrl,
  getPayPalAccessToken,
} from "@/lib/paypal";
import { getDb } from "@/lib/mongodb";
import { PAYPAL_CURRENCY, PAYPAL_CUSTOM_ID_MAX_LENGTH } from "@/lib/constants/paypal";
import { COLLECTIONS } from "@/lib/constants/db";
import { getMinBookableIsoDateInCostaRica, isDateOnOrAfterMinBookableInCostaRica } from "@/lib/costa-rica-time";

interface CreateOrderLink {
  rel?: string;
  href?: string;
}

interface CreateOrderResponse {
  id?: string;
  links?: CreateOrderLink[];
}

function normalizeOrderDate(date: unknown, dateIso: unknown): string | null {
  const parseIso = (value: string) => {
    const isoMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!isoMatch) return null;
    const year = Number(isoMatch[1]);
    const month = Number(isoMatch[2]);
    const day = Number(isoMatch[3]);
    if (!year || month < 1 || month > 12 || day < 1 || day > 31) return null;
    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  };

  const tryParseDate = (value: unknown) => {
    if (typeof value !== "string" || !value.trim()) return null;
    const iso = parseIso(value);
    if (iso) return iso;
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return null;
    return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, "0")}-${String(parsed.getDate()).padStart(2, "0")}`;
  };

  return tryParseDate(dateIso) ?? tryParseDate(date);
}

export async function POST(req: Request) {
  try {
    const { name, email, phone, tickets, total, date, dateIso, tourTime, tourPackage, packagePrice, tourSlug, tourName, language } = await req.json();

    if (!name || !email || !phone || !tickets || !total || !date || !tourPackage) {
      return NextResponse.json(
        { message: "Missing required fields." },
        { status: 400 }
      );
    }

    const normalizedDate = normalizeOrderDate(date, dateIso);
    if (!normalizedDate) {
      return NextResponse.json(
        {
          message: "Invalid reservation date format.",
          selectedDate: String(date),
          dateIso: String(dateIso ?? ""),
        },
        { status: 400 }
      );
    }

    if (!isDateOnOrAfterMinBookableInCostaRica(normalizedDate)) {
      const minBookableDate = getMinBookableIsoDateInCostaRica();
      return NextResponse.json(
        {
          message: "Selected date is no longer available. Please choose the next available day.",
          minBookableDate,
          selectedDate: String(date),
          dateIso: normalizedDate,
        },
        { status: 400 }
      );
    }

    const formattedTotal = Number(total).toFixed(2);

    const packageLabel =
      tourPackage === "basic"
        ? "Paquete Básico"
        : tourPackage === "full-day"
        ? "Día Completo con Almuerzo"
        : tourPackage === "private"
        ? "Tour Privado"
        : "Tour";

    const effectiveTourName = tourName || packageLabel;

    const timeLabel = tourTime
      ? tourTime === "08:00" ? "8:00 AM" : tourTime === "09:00" ? "9:00 AM" : "10:00 AM"
      : "";

    // PayPal custom_id max length is 127 chars — keep metadata compact to avoid truncation
    const customIdPayload = JSON.stringify({
      customer: { phone },
      tickets,
      time: tourTime ?? null,
      pkg: tourPackage ?? null,
      ppUSD: packagePrice ?? null,
      tourSlug: tourSlug ?? null,
      tourName: effectiveTourName,
      date: normalizedDate,
      lang: language === "en" ? "en" : "es",
    });
    const custom_id = customIdPayload.length <= PAYPAL_CUSTOM_ID_MAX_LENGTH ? customIdPayload : JSON.stringify({
      customer: { phone },
      tickets,
      time: tourTime ?? null,
      pkg: tourPackage ?? null,
      tourName: effectiveTourName,
      date: normalizedDate,
      lang: language === "en" ? "en" : "es",
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
              currency_code: PAYPAL_CURRENCY,
              value: formattedTotal,
            },
            description: `Reserva: ${tickets} pax - ${tourName ?? packageLabel}${timeLabel ? ` (${timeLabel})` : ""} - ${normalizedDate}`,
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
      await db.collection(COLLECTIONS.PAYPAL_ORDER_CONTEXTS).updateOne(
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
              tickets: Number(tickets),
              date: normalizedDate,
              tourTime: tourTime ?? null,
              tourPackage: tourPackage ?? null,
              packagePrice: packagePrice != null ? Number(packagePrice) : null,
              tourSlug: tourSlug ?? null,
              tourName: tourName ?? null,
              total: Number(total),
              language: language === "en" ? "en" : "es",
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
