import { UtensilsCrossed, Users, TreePalm, Route, type LucideIcon } from "lucide-react";
import type { AddOnOption } from "./types";
import { ADDON_DATA } from "./addons";

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PHONE_NUMBER_REGEX = /^[\d\s().-]{6,20}$/;

export const DEFAULT_DEPARTURE_TIMES = ["08:00", "09:00", "10:00"];

const ADDON_ICONS: Record<string, LucideIcon> = {
  almuerzo: UtensilsCrossed,
  "guia-privado": Users,
  alojamiento: TreePalm,
  transporte: Route,
};

export const ADDON_OPTIONS: AddOnOption[] = ADDON_DATA.map((addon) => ({
  ...addon,
  icon: ADDON_ICONS[addon.id] ?? Route,
}));

export const formatDepartureLabel = (value: string): string => {
  const normalized = value.trim();
  const match = normalized.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return normalized;

  const hour24 = Number(match[1]);
  const minute = match[2];
  const period = hour24 >= 12 ? "PM" : "AM";
  const hour12 = hour24 % 12 || 12;
  return `${hour12}:${minute} ${period}`;
};