// app/api/paypal/capture-order/route.ts

import { NextResponse } from "next/server";
import { getPayPalAuthHeader, getPayPalApiBaseUrl } from "@/lib/paypal";

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

    // -------------------------------
    // CAPTURE ORDER
    // -------------------------------

    const res = await fetch(
      `${getPayPalApiBaseUrl()}/v2/checkout/orders/${orderID}/capture`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: getPayPalAuthHeader(),
        },
        body: JSON.stringify({}), // PayPal requires an empty JSON payload
      }
    );

    const data = await res.json();

    if (!res.ok) {
      console.error("PayPal Capture Error:", data);
      return NextResponse.json(
        { message: "Failed to capture PayPal order.", details: data },
        { status: res.status }
      );
    }

    // -------------------------------
    // SAFE DATA EXTRACTION
    // -------------------------------

    const purchaseUnit = data.purchase_units?.[0] ?? null;

    const capture =
      purchaseUnit?.payments?.captures?.[0] ?? null;

    const captureID = capture?.id ?? null;

    const rawCustomId = purchaseUnit?.custom_id ?? null;

    let customData = null;

    if (rawCustomId) {
      try {
        customData = JSON.parse(rawCustomId);
      } catch (err) {
        console.error("Error parsing custom_id JSON:", err);
      }
    }

    // Build clean output object for your frontend
    return NextResponse.json(
      {
        status: data.status,
        captureID,
        payer: {
          name:
            data.payer?.name?.given_name +
            " " +
            (data.payer?.name?.surname || ""),
          email: data.payer?.email_address || null,
          payerID: data.payer?.payer_id,
        },
        metadata: customData, // customer + booking + total
        raw: data, // optional: full PayPal capture response
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
