"use client";

import { useEffect } from "react";

export default function PayPalLoader() {
  useEffect(() => {
    if (document.getElementById("paypal-sdk")) return;

    const mode = process.env.NEXT_PUBLIC_PAYPAL_MODE?.toLowerCase() || "sandbox";
    const clientId =
      mode === "live"
        ? process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID
        : process.env.NEXT_PUBLIC_PAYPAL_SANDBOX_CLIENT_ID;

    if (!clientId) {
      console.warn("PayPal client ID missing — check environment variables");
      return;
    }

    const params = new URLSearchParams({
      "client-id": clientId,
      currency: "USD",
      intent: "capture",
      components: "buttons",
    });

    const script = document.createElement("script");
    script.id = "paypal-sdk";
    script.src = `https://www.paypal.com/sdk/js?${params.toString()}`;
    script.async = true;
    script.onerror = () => console.error("Failed to load PayPal SDK");
    script.onload = () => console.log("PayPal SDK loaded successfully");
    document.body.appendChild(script);
  }, []);

  return null;
}
