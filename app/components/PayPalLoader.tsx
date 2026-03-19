"use client";

import { useEffect } from "react";
import { getPayPalSdkUrl } from "@/lib/paypal-client";

export default function PayPalLoader() {
  useEffect(() => {
    if (document.getElementById("paypal-sdk")) return;

    const sdkUrl = getPayPalSdkUrl({
      components: ["buttons", "funding-eligibility"],
    });

    if (!sdkUrl) {
      console.warn("PayPal client ID missing — check environment variables");
      return;
    }

    const script = document.createElement("script");
    script.id = "paypal-sdk";
    script.src = sdkUrl;
    script.async = true;
    script.setAttribute("data-sdk-integration-source", "button-factory");
    script.onerror = () => console.error("Failed to load PayPal SDK");
    script.onload = () => console.log("PayPal SDK loaded successfully");
    document.body.appendChild(script);
  }, []);

  return null;
}
