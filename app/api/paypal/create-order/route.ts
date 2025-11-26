// app/api/paypal/create-order/route.ts

import { NextResponse } from "next/server";
import {
  getPayPalApiBaseUrl,
  getPayPalAccessToken,
} from "@/lib/paypal";

export async function POST(req: Request) {
  try {
    const { name, email, phone, tickets, total, date } = await req.json();

    if (!name || !email || !tickets || !total) {
      return NextResponse.json(
        { message: "Missing required fields." },
        { status: 400 }
      );
    }

    const formattedTotal = Number(total).toFixed(2);

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
            description: `Reserva de ${tickets} tickets (${date})`,

            // PayPal custom_id max length is 127 chars → keep it short
            custom_id: `tickets-${tickets}-${date}`,
          },
        ],
      }),
    });

    const data = await res.json();

    if (!res.ok || !data.id) {
      console.error("PayPal Create Order Error:", data);
      return NextResponse.json(
        { message: "Failed to create PayPal order.", details: data },
        { status: res.status || 500 }
      );
    }

    // Extract approval URL
    const approvalUrl = data.links?.find(
      (link: any) => link.rel === "approve"
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
  } catch (error: any) {
    console.error("Server Error:", error);

    return NextResponse.json(
      { message: "Internal server error.", error: error?.message ?? "Unknown" },
      { status: 500 }
    );
  }
}
