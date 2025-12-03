// lib/availability.ts

import { AvailabilityMap } from "./types";


export function generateAvailability(
  year: number,
  month: number,
  overrides: Partial<AvailabilityMap> = {} 
): AvailabilityMap {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const availability: AvailabilityMap = {};

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dayOfWeek = date.getDay();

    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    availability[day] = overrides[day] ?? (isWeekend ? 50 : 20);
  }

  return availability;
}