// app/api/paypal/create-order/route.ts

import { NextResponse } from "next/server";
import {
  getPayPalApiBaseUrl,
  getPayPalAccessToken,
} from "@/lib/paypal";
import { getDb } from "@/lib/mongodb";
import {
  PAYPAL_CURRENCY,
  PAYPAL_CUSTOM_ID_MAX_LENGTH,
  PAYPAL_NO_SHIPPING_PREFERENCE,
} from "@/lib/constants/paypal";
import { COLLECTIONS } from "@/lib/constants/db";
import { isDateOnOrAfterMinBookableInCostaRica } from "@/lib/costa-rica-time";
import { APP_BASE_URL_DEFAULT } from "@/lib/constants/email";

interface PayPalErrorDetail {
  issue?: string;
  description?: string;
}

interface CreateOrderResponse {
  id?: string;
  details?: PayPalErrorDetail[];
  debug_id?: string;
}

export async function POST(req: Request) {
  try {
    const { name, email, phone, tickets, total, date, tourTime, tourPackage, packagePrice, tourSlug, tourName, language } = await req.json();
    // `date` is expected to be an ISO date string (YYYY-MM-DD) sent from the client
    const requestUrl = new URL(req.url);
    const appBaseUrl =
      process.env.APP_BASE_URL ||
      process.env.NEXTAUTH_URL ||
      (requestUrl.origin !== "null" ? requestUrl.origin : APP_BASE_URL_DEFAULT);

    if (!name || !email || !phone || !tickets || !total || !date || !tourPackage) {
      return NextResponse.json(
        { message: "Missing required fields." },
        { status: 400 }
      );
    }

    if (!isDateOnOrAfterMinBookableInCostaRica(String(date))) {
      return NextResponse.json(
        { message: "Selected date is no longer available. Please choose the next available day." },
        { status: 400 }
      );
    }

    const formattedTotal = Number(total).toFixed(2);
    const paypalLocale = language === "en" ? "en-US" : "es-CR";

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
      lang: language === "en" ? "en" : "es",
    });
    const custom_id = customIdPayload.length <= PAYPAL_CUSTOM_ID_MAX_LENGTH ? customIdPayload : JSON.stringify({
      tickets,
      time: tourTime ?? null,
      pkg: tourPackage ?? null,
      date,
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
            description: `Reserva: ${tickets} pax - ${tourName ?? packageLabel}${timeLabel ? ` (${timeLabel})` : ""} - ${date}`,
            custom_id,
          },
        ],
        payment_source: {
          paypal: {
            experience_context: {
              payment_method_preference: "IMMEDIATE_PAYMENT_REQUIRED",
              brand_name: "La Vieja Adventures",
              locale: paypalLocale,
              landing_page: "LOGIN",
              shipping_preference: PAYPAL_NO_SHIPPING_PREFERENCE,
              user_action: "PAY_NOW",
              return_url: `${appBaseUrl}/success`,
              cancel_url: `${appBaseUrl}/booking?paypal=cancelled`,
            },
          },
        },
      }),
    });

    const data = (await res.json()) as CreateOrderResponse;

    if (!res.ok || !data.id) {
      console.error("PayPal Create Order Error:", data);
      const errorDetail = data.details?.[0];
      const errorMessage = errorDetail
        ? `${errorDetail.issue} ${errorDetail.description} (${data.debug_id})`
        : "Failed to create PayPal order.";
      return NextResponse.json(
        { message: errorMessage, details: data.details, debug_id: data.debug_id },
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
              date,
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

    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error("Server Error:", error);

    return NextResponse.json(
      { message: "Internal server error.", error: error instanceof Error ? error.message : "Unknown" },
      { status: 500 }
    );
  }
}
