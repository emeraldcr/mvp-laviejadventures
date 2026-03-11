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
  RESERVATIONS: "Reservations",
  ANALYTICS_EVENTS: "analytics_events",
} as const;
