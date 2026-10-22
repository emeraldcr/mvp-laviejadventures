// MongoDB database and collection names used by persistence modules.

/** Nombre de la base de datos MongoDB */
export const DB_NAME = "lva";

/** Nombres de colecciones MongoDB */
export const COLLECTIONS = {
  USERS: "users",
  // Keep the stored collection name for existing reservation pricing data.
  RESERVATION_SETTINGS: "b2b_settings",
  TOURS: "tours",
  LOGIN_LOGS: "login_logs",
  PAYPAL_ORDER_CONTEXTS: "paypal_order_contexts",
  RESERVATION_DRAFTS: "reservation_drafts",
  RESERVATION_CAPACITY_HOLDS: "reservation_capacity_holds",
  RESERVATIONS: "Reservations",
  ANALYTICS_EVENTS: "analytics_events",
} as const;
