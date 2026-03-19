// lib/constants/analytics.ts
// Analytics event names tracked across the app.

export type AnalyticsEventName =
  | "page_view"
  | "click"
  | "booking_step"
  | "booking_submitted";

export const VALID_EVENTS: AnalyticsEventName[] = [
  "page_view",
  "click",
  "booking_step",
  "booking_submitted",
];
