// lib/paypal.ts

/**
 * Returns the PayPal REST API Base URL
 * Sandbox → https://api-m.sandbox.paypal.com
 * Live → https://api-m.paypal.com
 */
export function getPayPalApiBaseUrl() {
  const mode = process.env.PAYPAL_MODE?.toLowerCase();

  return mode === "live"
    ? "https://api-m.paypal.com"            // LIVE
    : "https://api-m.sandbox.paypal.com";   // SANDBOX
}

/**
 * Returns the Authorization header for PayPal REST API
 * Uses CLIENT_ID and SECRET to create a Basic token
 */
export function getPayPalAuthHeader() {
  if (!process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
    throw new Error("Missing PayPal API credentials.");
  }

  const encoded = Buffer.from(
    `${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString("base64");

  return `Basic ${encoded}`;
}
