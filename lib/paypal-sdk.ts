"use client";

export type PayPalButtons = {
  render: (container: HTMLElement) => Promise<void> | void;
  close: () => Promise<void> | void;
  isEligible?: () => boolean;
};
export type PayPalSdk = { Buttons: (config: Record<string, unknown>) => PayPalButtons };

declare global {
  interface Window { paypal?: PayPalSdk }
}

let pendingSdk: { src: string; promise: Promise<PayPalSdk> } | null = null;

// Shared across checkout mounts, including React Strict Mode. A consumer must
// never remove the script or callbacks another checkout is still waiting for.
export function loadPayPalSdk(clientId: string): Promise<PayPalSdk> {
  const params = new URLSearchParams({
    "client-id": clientId, components: "buttons", currency: "USD", intent: "capture",
  });
  const src = `https://www.paypal.com/sdk/js?${params}`;
  if (pendingSdk) {
    return pendingSdk.src === src ? pendingSdk.promise
      : Promise.reject(new Error("paypal_sdk_config_mismatch"));
  }
  const existing = document.querySelector<HTMLScriptElement>("#paypal-sdk");
  if (existing && existing.src !== src) return Promise.reject(new Error("paypal_sdk_config_mismatch"));
  if (window.paypal?.Buttons) return Promise.resolve(window.paypal);

  const promise = new Promise<PayPalSdk>((resolve, reject) => {
    const script = existing ?? document.createElement("script");
    const cleanup = () => {
      clearTimeout(timer);
      script.removeEventListener("load", loaded);
      script.removeEventListener("error", failed);
    };
    const failed = () => {
      cleanup();
      script.remove();
      pendingSdk = null;
      reject(new Error("paypal_sdk_load_error"));
    };
    const loaded = () => {
      if (!window.paypal?.Buttons) { failed(); return; }
      cleanup();
      resolve(window.paypal);
    };
    script.addEventListener("load", loaded);
    script.addEventListener("error", failed);
    const timer = setTimeout(failed, 20_000);
    if (!existing) {
      script.id = "paypal-sdk";
      script.src = src;
      script.async = true;
      document.body.appendChild(script);
    }
  });
  pendingSdk = { src, promise };
  return promise;
}
