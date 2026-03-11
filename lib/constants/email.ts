// lib/constants/email.ts
// Centraliza los valores de remitente y URL base usados en todos los emails.

/**
 * Remitente por defecto para emails transaccionales.
 * Puede sobreescribirse con la variable de entorno SMTP_FROM.
 */
export const EMAIL_FROM_DEFAULT = '"La Vieja Adventures" <noreply@laviejaadventures.com>';

/**
 * URL base de la aplicación en producción.
 * Puede sobreescribirse con la variable de entorno APP_BASE_URL.
 */
export const APP_BASE_URL_DEFAULT = "https://www.laviejaadventures.com";
