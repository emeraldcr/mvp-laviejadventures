// app/api/paypal/create-order/route.ts

import { NextResponse } from "next/server";
import { getPayPalAuthHeader, getPayPalApiBaseUrl } from "@/lib/paypal";

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

    // Create PayPal order
    const res = await fetch(`${getPayPalApiBaseUrl()}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: getPayPalAuthHeader(),
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

            custom_id: JSON.stringify({
              customer: { name, email, phone },
              booking: { tickets, date },
              total: formattedTotal,
            }),
          },
        ],

        
      }),
    });

    const data = await res.json();

    if (!res.ok || !data.id) {
      console.error("PayPal Create Order Error:", data);
      return NextResponse.json(
        { message: "Failed to create PayPal order.", details: data },
        { status: res.status }
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
      { message: "Internal server error.", error: error.message },
      { status: 500 }
    );
  }
}
