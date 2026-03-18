// lib/constants/paypal.ts
// Constantes para la integración con PayPal.

/** Moneda utilizada en todos los pagos PayPal */
export const PAYPAL_CURRENCY = "USD";

/** Longitud máxima del campo custom_id en una orden PayPal */
export const PAYPAL_CUSTOM_ID_MAX_LENGTH = 127;

/** Parámetros estables del SDK de PayPal */
export const PAYPAL_SDK_COMPONENTS = "buttons";
export const PAYPAL_SDK_INTENT = "capture";
export const PAYPAL_SDK_COMMIT = "true";

/** Fecha base de integración para mantener compatibilidad al cambiar client IDs */
export const PAYPAL_SDK_INTEGRATION_DATE = "2026-03-18";

/** Preferencia de envío para bienes/servicios sin entrega física */
export const PAYPAL_NO_SHIPPING_PREFERENCE = "NO_SHIPPING";
