// app/api/paypal/capture-order/route.ts

import { NextResponse } from "next/server";
import {
  getPayPalApiBaseUrl,
  getPayPalAccessToken,
} from "@/lib/paypal";

interface CaptureRequest {
  orderID: string;
}

export async function POST(req: Request) {
  try {
    const { orderID }: CaptureRequest = await req.json();

    if (!orderID) {
      return NextResponse.json(
        { message: "orderID is required." },
        { status: 400 }
      );
    }

    // 1) Get OAuth access token (same as create-order)
    const accessToken = await getPayPalAccessToken();

    // 2) Capture the order using Bearer token
    const res = await fetch(
      `${getPayPalApiBaseUrl()}/v2/checkout/orders/${orderID}/capture`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        // Body can be empty or {} for a simple capture
        body: JSON.stringify({}),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      console.error("PayPal Capture Error:", JSON.stringify(data, null, 2));
      return NextResponse.json(
        { message: "Failed to capture PayPal order.", details: data },
        { status: res.status || 500 }
      );
    }

    const purchaseUnit = data.purchase_units?.[0] ?? null;
    const capture = purchaseUnit?.payments?.captures?.[0] ?? null;
    const rawCustomId = purchaseUnit?.custom_id ?? null;

    let customData: any = null;

    // NOTE: if custom_id is *not* JSON (e.g. "tickets-2-2025-01-01"),
    // this will just fail silently and metadata will stay null.
    if (rawCustomId) {
      try {
        customData = JSON.parse(rawCustomId);
      } catch {
        // you could also do: customData = { custom_id: rawCustomId };
      }
    }

    return NextResponse.json(
      {
        id: data.id,
        status: data.status,
        captureID: capture?.id ?? null,
        payer: {
          name:
            (data.payer?.name?.given_name || "") +
            (data.payer?.name?.surname ? " " + data.payer?.name?.surname : ""),
          email: data.payer?.email_address ?? null,
          payerID: data.payer?.payer_id ?? null,
        },
        metadata: customData,
        raw: data,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Internal Capture Error:", err);
    return NextResponse.json(
      { message: "Internal server error.", error: err?.message ?? "Unknown" },
      { status: 500 }
    );
  }
}
