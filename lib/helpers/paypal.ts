// lib/paypal.ts

/**
 * PayPal Configuration & Token Management
 */

const PAYPAL_SANDBOX_BASE_URL = "https://api-m.sandbox.paypal.com";
const PAYPAL_LIVE_BASE_URL = "https://api-m.paypal.com";

interface PayPalTokenResponse {
  access_token?: string;
  expires_in?: number;
  error?: string;
  error_description?: string;
}

interface PayPalEnvConfig {
  clientId: string;
  clientSecret: string;
  baseUrl: string;
  isLive: boolean;
}

// Simple in-memory cache for access token (lasts ~9 hours)
let cachedToken: string | null = null;
let tokenExpiry: number = 0;

/**
 * Determines if we are in Live/Production mode
 */
function isLiveMode(): boolean {
  const mode = process.env.PAYPAL_MODE?.trim().toLowerCase();
  return mode === "live" || mode === "production" || mode === "prod";
}

/**
 * Validates that a credential is properly set
 */
function isValidCredential(value: string | undefined): boolean {
  return Boolean(value?.trim()) && !value!.trim().toLowerCase().startsWith("your-");
}

/**
 * Loads PayPal credentials based on environment
 */
function getPayPalConfig(): PayPalEnvConfig {
  const isLive = isLiveMode();

  let clientId: string | undefined;
  let clientSecret: string | undefined;

  if (isLive) {
    clientId = process.env.PAYPAL_CLIENT_ID?.trim() || process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID?.trim();
    clientSecret = process.env.PAYPAL_CLIENT_SECRET?.trim();
  } else {
    clientId = process.env.PAYPAL_SANDBOX_CLIENT_ID?.trim() || process.env.NEXT_PUBLIC_PAYPAL_SANDBOX_CLIENT_ID?.trim();
    clientSecret = process.env.PAYPAL_SANDBOX_CLIENT_SECRET?.trim();
  }

  if (!isValidCredential(clientId) || !isValidCredential(clientSecret)) {
    throw new Error(
      isLive
        ? "Missing PayPal LIVE credentials. Check PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET."
        : "Missing PayPal SANDBOX credentials. Check PAYPAL_SANDBOX_CLIENT_ID and PAYPAL_SANDBOX_CLIENT_SECRET."
    );
  }

  return {
    clientId: clientId!,
    clientSecret: clientSecret!,
    baseUrl: isLive ? PAYPAL_LIVE_BASE_URL : PAYPAL_SANDBOX_BASE_URL,
    isLive,
  };
}

/**
 * Returns the correct PayPal API Base URL
 */
export function getPayPalApiBaseUrl(): string {
  return getPayPalConfig().baseUrl;
}

/**
 * Get OAuth Access Token with caching
 */
export async function getPayPalAccessToken(): Promise<string> {
  // Return cached token if still valid
  if (cachedToken && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  const config = getPayPalConfig();

  const res = await fetch(`${config.baseUrl}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: getBasicAuthHeader(config.clientId, config.clientSecret),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  const data: PayPalTokenResponse = await res.json();

  if (!res.ok || !data.access_token) {
    const reason = data.error_description || data.error || "Unknown error";
    console.error("PayPal OAuth Error:", {
      status: res.status,
      reason,
      isLive: config.isLive,
      details: data,
    });

    throw new Error(`Failed to get PayPal access token (${res.status}): ${reason}`);
  }

  // Cache token (PayPal tokens usually expire in 9 hours = 32400 seconds)
  const expiresIn = data.expires_in || 32400;
  cachedToken = data.access_token;
  tokenExpiry = Date.now() + (expiresIn - 60) * 1000; // Refresh 1 minute early

  return cachedToken;
}

/**
 * Creates Basic Auth header
 */
function getBasicAuthHeader(clientId: string, clientSecret: string): string {
  const encoded = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  return `Basic ${encoded}`;
}