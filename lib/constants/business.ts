// lib/constants/business.ts
// Business constants for tax, availability, and reservation capacity.

/** Tasa de IVA por defecto (%) cuando no hay configuración en base de datos */
export const DEFAULT_IVA_RATE = 13;

/** Slots de disponibilidad por defecto al generar el calendario */
export const DEFAULT_AVAILABILITY = {
  /** Días de semana (lunes–viernes) */
  WEEKDAY: 20,
  /** Fines de semana (sábado–domingo) */
  WEEKEND: 50,
} as const;

/** Estados que consumen cupo real, incluyendo variantes histÃ³ricas. */
export const CONFIRMED_RESERVATION_STATUSES = [
  "COMPLETED",
  "completed",
  "CONFIRMED",
  "confirmed",
  "CAPTURED",
  "captured",
  "APPROVED",
  "approved",
  "PAID",
  "paid",
] as const;
