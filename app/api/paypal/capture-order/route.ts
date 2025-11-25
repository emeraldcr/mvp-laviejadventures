// app/api/paypal/capture-order/route.ts

import { NextResponse } from "next/server";
// Assuming these utility functions are correctly implemented
import { getPayPalAuthHeader, getPayPalApiBaseUrl } from "@/lib/paypal";

interface CaptureRequest {
  orderID: string;
}

export async function POST(req: Request) {
  try {
    const { orderID }: CaptureRequest = await req.json();

    if (!orderID) {
      return NextResponse.json({ message: "orderID is required." }, { status: 400 });
    }

    // --- FIX APPLIED HERE ---
    const res = await fetch(
      `${getPayPalApiBaseUrl()}/v2/checkout/orders/${orderID}/capture`,
      {
        method: "POST",
        headers: {
          // This is required for the Capture API endpoint
          "Content-Type": "application/json",
          Authorization: getPayPalAuthHeader(),
        },
        // PayPal's API requires an empty JSON body for a simple capture
        body: JSON.stringify({}), 
      }
    );
    // ------------------------

    const data = await res.json();

    if (!res.ok) {
      console.error("PayPal Capture Error:", JSON.stringify(data, null, 2));
      return NextResponse.json(
        { message: "Failed to capture PayPal order.", details: data },
        { status: res.status }
      );
    }

    const purchaseUnit = data.purchase_units?.[0] ?? null;
    const capture = purchaseUnit?.payments?.captures?.[0] ?? null;
    const rawCustomId = purchaseUnit?.custom_id ?? null;

    let customData = null;
    if (rawCustomId) {
      try {
        customData = JSON.parse(rawCustomId);
      } catch (err) {}
    }

    return NextResponse.json(
      {
        id: data.id,
        status: data.status,
        captureID: capture?.id ?? null,
        payer: {
          name:
            data.payer?.name?.given_name +
            " " +
            (data.payer?.name?.surname || ""),
          email: data.payer?.email_address ?? null,
          payerID: data.payer?.payer_id,
        },
        metadata: customData,
        raw: data,
      },
      { status: 200 }
    );

  } catch (err: any) {
    console.error("Internal Capture Error:", err);
    return NextResponse.json(
      { message: "Internal server error.", error: err.message },
      { status: 500 }
    );
  }
}