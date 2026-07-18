// lib/constants/db.ts
// Centraliza el nombre de la base de datos y los nombres de colecciones MongoDB.

/** Nombre de la base de datos MongoDB */
export const DB_NAME = "lva";

/** Nombres de colecciones MongoDB */
export const COLLECTIONS = {
  ADMINS: "admins",
  USERS: "users",
  OPERATORS: "operators",
  OPERATOR_BOOKINGS: "operator_bookings",
  B2B_SETTINGS: "b2b_settings",
  TOURS: "tours",
  LOGIN_LOGS: "login_logs",
  PAYPAL_ORDER_CONTEXTS: "paypal_order_contexts",
  RESERVATION_CAPACITY_HOLDS: "reservation_capacity_holds",
  RESERVATIONS: "Reservations",
  ANALYTICS_EVENTS: "analytics_events",
  MUNDIAL_ANALYTICS: "mundial_analytics",
  HERO_SLOGANS: "hero_slogans",
  STORE_PRODUCTS: "store_products",
  STORE_SETTINGS: "store_settings",
  DJ_TRACKS: "dj_tracks",
  PENALITOS_STATE: "penalitos_state",
  MUNDIAL_BANS: "mundial_bans",
  MUNDIAL_RECOVERY_TICKETS: "mundial_recovery_tickets",
  MUNDIAL_PREMIUM: "mundial_premium",
  MUNDIAL_PREMIUM_PREDICTIONS: "mundial_premium_predictions",
} as const;
