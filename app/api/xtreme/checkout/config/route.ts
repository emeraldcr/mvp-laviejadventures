import { NextResponse } from "next/server";
import { PAYPAL_CURRENCY } from "@/lib/constants/paypal";

function isLivePayPalMode() {
  const mode = process.env.PAYPAL_MODE?.trim().toLowerCase();
  return mode === "live" || mode === "production" || mode === "prod";
}

function getClientId() {
  if (isLivePayPalMode()) {
    return process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID?.trim() || process.env.PAYPAL_CLIENT_ID?.trim();
  }

  return process.env.NEXT_PUBLIC_PAYPAL_SANDBOX_CLIENT_ID?.trim() || process.env.PAYPAL_SANDBOX_CLIENT_ID?.trim();
}

export async function GET() {
  const clientId = getClientId();

  if (!clientId || clientId.toLowerCase().startsWith("your-")) {
    return NextResponse.json(
      { success: false, message: "PayPal no está configurado para Xtreme Gym." },
      { status: 503 },
    );
  }

  return NextResponse.json({
    clientId,
    currency: PAYPAL_CURRENCY,
  });
}
