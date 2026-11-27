"use client";

// Only explicitly selected, non-personal parameters are sent to Google.
const bookingEvents = new Set([
  "booking_step", "booking_step_progressed", "booking_step_backtracked",
  "booking_step_completed", "booking_step_blocked", "booking_step_abandoned",
  "booking_selection_changed", "booking_checkout_started", "payment_order_created",
  "payment_approved", "payment_error", "whatsapp_checkout_click", "sinpe_checkout_selected",
]);

export function sendGoogleEvent(name: string, params: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  try {
    if (typeof window.gtag === "function") window.gtag("event", name, params);
    else {
      window.dataLayer = window.dataLayer || [];
      // gtag.js expects the arguments object used by its standard snippet.
      // eslint-disable-next-line prefer-rest-params
      (function (...args: unknown[]) { void args; window.dataLayer!.push(arguments); })("event", name, params);
    }
  } catch { /* Measurement must never interrupt a booking. */ }
}

export function sendBookingGoogleEvent(event: string, metadata: Record<string, unknown> = {}) {
  if (!bookingEvents.has(event)) return;
  const params: Record<string, unknown> = {};
  for (const [source, target] of [["step", "step"], ["fromStep", "from_step"], ["toStep", "to_step"], ["targetStep", "target_step"], ["durationSeconds", "duration_seconds"]] as const) {
    const value = metadata[source];
    if (typeof value === "number" && Number.isFinite(value)) params[target] = value;
  }
  const enums: Record<string, readonly string[]> = {
    field: ["tour_time", "tickets", "package"],
    stage: ["capture", "paypal_sdk_load", "paypal_buttons"],
  };
  for (const [key, allowed] of Object.entries(enums)) {
    if (typeof metadata[key] === "string" && allowed.includes(metadata[key] as string)) params[key] = metadata[key];
  }
  sendGoogleEvent(event, params);
}
