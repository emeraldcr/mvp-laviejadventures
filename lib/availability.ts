// lib/availability.ts

import { AvailabilityMap } from "./types";

/**
 * Genera la disponibilidad para TODO un mes:
 * - Sábados y Domingos → 50 cupos
 * - Entre semana → 20 cupos
 * - NEW: Optional overrides for specific dates (e.g., holidays with 0 slots)
 */
export function generateAvailability(
  year: number,
  month: number,
  overrides: Partial<AvailabilityMap> = {} // NEW: Allow custom overrides per day
): AvailabilityMap {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const availability: AvailabilityMap = {};

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dayOfWeek = date.getDay(); // 0 = Domingo, 6 = Sábado

    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    availability[day] = overrides[day] ?? (isWeekend ? 50 : 20);
  }

  return availability;
}