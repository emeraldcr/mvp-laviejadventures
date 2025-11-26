// lib/paypal.ts

/**
 * Returns the PayPal REST API Base URL
 * Sandbox → https://api-m.sandbox.paypal.com
 * Live → https://api-m.paypal.com
 */
export function getPayPalApiBaseUrl() {
  const mode = process.env.PAYPAL_MODE?.toLowerCase();

  return mode === "live"
    ? "https://api-m.paypal.com" // LIVE
    : "https://api-m.sandbox.paypal.com"; // SANDBOX
}

/**
 * Creates a Basic auth header value for OAuth token request
 */
function getPayPalBasicAuthHeader() {
  const clientId =
    process.env.PAYPAL_CLIENT_ID || process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Missing PayPal API credentials.");
  }

  const encoded = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  return `Basic ${encoded}`;
}

/**
 * Get an OAuth access token from PayPal
 */
export async function getPayPalAccessToken() {
  const baseUrl = getPayPalApiBaseUrl();

  const res = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: getPayPalBasicAuthHeader(),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  const data = await res.json();

  if (!res.ok || !data.access_token) {
    console.error("PayPal OAuth Error:", data);
    throw new Error("Failed to obtain PayPal access token");
  }

  return data.access_token as string;
}
