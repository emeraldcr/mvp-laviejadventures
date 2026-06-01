// app/api/paypal/capture-order/route.ts

import { NextResponse } from "next/server";
import { getPayPalApiBaseUrl, getPayPalAccessToken } from "@/lib/paypal";

interface CaptureRequestBody {
  orderID: string;
}

interface PayPalPayer {
  name?: {
    given_name?: string;
    surname?: string;
  };
  email_address?: string;
  payer_id?: string;
}

interface PayPalCapture {
  id?: string;
}

interface PayPalPurchaseUnit {
  custom_id?: string;
  payments?: {
    captures?: PayPalCapture[];
  };
}

interface PayPalCaptureResponse {
  id?: string;
  status?: string;
  payer?: PayPalPayer;
  purchase_units?: PayPalPurchaseUnit[];
}

// Helper to safely parse custom_id
function parseCustomData(customId: string | null | undefined) {
  if (!customId) return null;
  try {
    return JSON.parse(customId);
  } catch {
    return { rawCustomId: customId };
  }
}

export async function POST(req: Request) {
  try {
    const { orderID }: CaptureRequestBody = await req.json();

    if (!orderID?.trim()) {
      return NextResponse.json(
        { success: false, message: "orderID is required" },
        { status: 400 }
      );
    }

    const accessToken = await getPayPalAccessToken();

    const response = await fetch(
      `${getPayPalApiBaseUrl()}/v2/checkout/orders/${orderID}/capture`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        // IMPORTANT: Do NOT send body for simple capture
      }
    );

    const data: PayPalCaptureResponse = await response.json();

    if (!response.ok) {
      console.error("PayPal Capture Failed:", {
        status: response.status,
        data,
        orderID,
      });

      return NextResponse.json(
        {
          success: false,
          message: "Failed to capture PayPal order",
          error: data,
        },
        { status: response.status || 500 }
      );
    }

    // Success response
    const purchaseUnit = data.purchase_units?.[0];
    const capture = purchaseUnit?.payments?.captures?.[0];

    const payerName =
      [data.payer?.name?.given_name, data.payer?.name?.surname]
        .filter(Boolean)
        .join(" ") || null;

    return NextResponse.json({
      success: true,
      id: data.id,
      status: data.status,
      captureID: capture?.id ?? null,
      payer: {
        name: payerName,
        email: data.payer?.email_address ?? null,
        payerID: data.payer?.payer_id ?? null,
      },
      metadata: parseCustomData(purchaseUnit?.custom_id),
      raw: data, // Remove in production if you want
    });

  } catch (error: unknown) {
    console.error("Capture Route Error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown internal error";

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}