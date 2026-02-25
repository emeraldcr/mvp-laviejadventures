// app/api/paypal/create-order/route.ts

import { NextResponse } from "next/server";
import {
  getPayPalApiBaseUrl,
  getPayPalAccessToken,
} from "@/lib/paypal";

interface CreateOrderLink {
  rel?: string;
  href?: string;
}

interface CreateOrderResponse {
  id?: string;
  links?: CreateOrderLink[];
}

export async function POST(req: Request) {
  try {
    const { name, email, tickets, total, date, tourTime, tourPackage, packagePrice } = await req.json();

    if (!name || !email || !tickets || !total) {
      return NextResponse.json(
        { message: "Missing required fields." },
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

    const timeLabel = tourTime
      ? tourTime === "08:00" ? "8:00 AM" : tourTime === "09:00" ? "9:00 AM" : "10:00 AM"
      : "";

    // PayPal custom_id max length is 127 chars — use compact JSON to carry metadata
    const customIdPayload = JSON.stringify({
      tickets,
      time: tourTime ?? null,
      pkg: tourPackage ?? null,
      ppUSD: packagePrice ?? null,
      date,
    });
    // Truncate to 127 chars as a safeguard (date is the longest field)
    const custom_id = customIdPayload.slice(0, 127);

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
            description: `Reserva: ${tickets} pax - ${packageLabel}${timeLabel ? ` (${timeLabel})` : ""} - ${date}`,
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
