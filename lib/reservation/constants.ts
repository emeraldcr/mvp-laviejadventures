import { Camera, Home, Route, UtensilsCrossed, Users, type LucideIcon } from "lucide-react";
import type { AddOnOption } from "./types";
import { ADDON_DATA } from "./addons";

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PHONE_NUMBER_REGEX = /^[\d\s().-]{6,20}$/;

export const DEFAULT_DEPARTURE_TIMES = ["08:00", "09:00", "10:00"];

export const TRANSPORT_LOCATIONS = [
  { id: "san-carlos", labelEs: "San Carlos", labelEn: "San Carlos" },
  { id: "la-fortuna", labelEs: "La Fortuna", labelEn: "La Fortuna" },
  { id: "ciudad-quesada", labelEs: "Ciudad Quesada", labelEn: "Ciudad Quesada" },
  { id: "san-jose", labelEs: "San José", labelEn: "San José" },
  { id: "hotel-airbnb", labelEs: "Hotel / Airbnb", labelEn: "Hotel / Airbnb" },
  { id: "la-vieja-adventures", labelEs: "La Vieja Adventures", labelEn: "La Vieja Adventures" },
  { id: "san-vicente", labelEs: "San Vicente", labelEn: "San Vicente" },
];

const TRANSPORT_LOCATION_MAP = new Map(TRANSPORT_LOCATIONS.map((location) => [location.id, location]));

export function getTransportLocationLabel(id: string, lang: "es" | "en") {
  if (id === "same-pickup") {
    return lang === "es" ? "Mismo pickup" : "Same pickup";
  }
  return TRANSPORT_LOCATION_MAP.get(id)?.[lang === "es" ? "labelEs" : "labelEn"] ?? id;
}

const ADDON_ICONS: Record<string, LucideIcon> = {
  almuerzo: UtensilsCrossed,
  "guia-privado": Users,
  alojamiento: Home,
  transporte: Route,
  fotos: Camera,
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
