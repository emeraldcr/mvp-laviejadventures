// lib/paypal.ts

/**
 * Returns the PayPal REST API Base URL
 * Sandbox → https://api-m.sandbox.paypal.com
 * Live → https://api-m.paypal.com
 */
function isLivePayPalMode(mode: string | undefined) {
  const normalizedMode = mode?.trim().toLowerCase();
  return normalizedMode === "live" || normalizedMode === "production" || normalizedMode === "prod";
}

function isConfiguredPayPalCredential(value: string | undefined) {
  if (!value) return false;

  const normalizedValue = value.trim().toLowerCase();
  return Boolean(normalizedValue) && !normalizedValue.startsWith("your-");
}

export function getPayPalApiBaseUrl() {
  const mode = process.env.PAYPAL_MODE;

  return isLivePayPalMode(mode)
    ? "https://api-m.paypal.com" // LIVE
    : "https://api-m.sandbox.paypal.com"; // SANDBOX
}

/**
 * Creates a Basic auth header value for OAuth token request
 */
function getPayPalBasicAuthHeader() {
  const mode = process.env.PAYPAL_MODE;
  const isLiveMode = isLivePayPalMode(mode);

  let clientId: string | undefined;
  let clientSecret: string | undefined;

  if (isLiveMode) {
    clientId =
      process.env.PAYPAL_CLIENT_ID?.trim() || process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID?.trim();
    clientSecret = process.env.PAYPAL_CLIENT_SECRET?.trim();
  } else {
    // sandbox/dev mode
    clientId =
      process.env.PAYPAL_SANDBOX_CLIENT_ID?.trim() || process.env.NEXT_PUBLIC_PAYPAL_SANDBOX_CLIENT_ID?.trim();
    clientSecret = process.env.PAYPAL_SANDBOX_CLIENT_SECRET?.trim();
  }

  if (!isConfiguredPayPalCredential(clientId) || !isConfiguredPayPalCredential(clientSecret)) {
    throw new Error(
      isLiveMode
        ? "Missing PayPal LIVE API credentials."
        : "Missing PayPal SANDBOX API credentials."
    );
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
    const reason =
      typeof data?.error_description === "string"
        ? data.error_description
        : typeof data?.message === "string"
        ? data.message
        : typeof data?.error === "string"
        ? data.error
        : "Unknown PayPal OAuth error";

    console.error("PayPal OAuth Error:", { status: res.status, reason, details: data });
    throw new Error(`Failed to obtain PayPal access token (${res.status}): ${reason}`);
  }

  return data.access_token as string;
}
