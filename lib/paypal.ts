// lib/paypal.ts

/**
 * Returns the PayPal REST API Base URL
 * Sandbox → https://api-m.sandbox.paypal.com
 * Live   → https://api-m.paypal.com
 */
export function getPayPalApiBaseUrl() {
  const mode = process.env.PAYPAL_MODE?.toLowerCase() ?? "sandbox";
  return mode === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
}

/**
 * Creates Basic auth header for OAuth token request
 */
function getPayPalBasicAuthHeader() {
  const mode = process.env.PAYPAL_MODE?.toLowerCase() ?? "sandbox";

  let clientId: string | undefined;
  let clientSecret: string | undefined;

  if (mode === "live") {
    clientId = process.env.PAYPAL_CLIENT_ID;
    clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  } else {
    clientId = process.env.PAYPAL_SANDBOX_CLIENT_ID;
    clientSecret = process.env.PAYPAL_SANDBOX_CLIENT_SECRET;
  }

  if (!clientId || !clientSecret) {
    const missing = !clientId ? "Client ID" : "Client Secret";
    throw new Error(
      `Missing PayPal ${mode.toUpperCase()} ${missing}. ` +
      `Check environment variables (PAYPAL_${mode === "live" ? "" : "SANDBOX_"}* prefix).`
    );
  }

  const encoded = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  return `Basic ${encoded}`;
}

// Simple in-memory token cache (tokens last ~9 hours)
let cachedToken: { value: string; expiresAt: number } | null = null;

/**
 * Get (and cache) a PayPal OAuth access token
 */
export async function getPayPalAccessToken(): Promise<string> {
  const now = Date.now();

  // Reuse if still valid (with 1-minute safety buffer)
  if (cachedToken && cachedToken.expiresAt > now + 60_000) {
    return cachedToken.value;
  }

  const baseUrl = getPayPalApiBaseUrl();

  const res = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: getPayPalBasicAuthHeader(),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) {
    let errorData;
    try {
      errorData = await res.json();
    } catch {
      errorData = { message: res.statusText };
    }
    console.error(`PayPal OAuth failed (${res.status}):`, errorData);
    throw new Error(`Failed to obtain PayPal access token: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();

  if (!data.access_token || typeof data.expires_in !== "number") {
    console.error("Invalid PayPal token response:", data);
    throw new Error("Invalid PayPal token response format");
  }

  cachedToken = {
    value: data.access_token,
    expiresAt: now + data.expires_in * 1000,
  };

  return data.access_token;
}
