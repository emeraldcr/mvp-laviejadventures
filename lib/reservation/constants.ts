import { UtensilsCrossed, Users, TreePalm, Route } from "lucide-react";
import type { AddOnOption } from "./types";

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PHONE_NUMBER_REGEX = /^[\d\s().-]{6,20}$/;

export const DEFAULT_DEPARTURE_TIMES = ["08:00", "09:00", "10:00"];

export const ADDON_OPTIONS: AddOnOption[] = [
  {
    id: "almuerzo",
    nameEs: "Almuerzo Típico",
    nameEn: "Traditional Lunch",
    descriptionEs: "Casado costarricense (pollo, res o vegetariano) con bebida natural y postre.",
    descriptionEn: "Costa Rican casado (chicken, beef or vegetarian) with natural drink and dessert.",
    price: 15,
    icon: UtensilsCrossed,
  },
  {
    id: "guia-privado",
    nameEs: "Guía Privado",
    nameEn: "Private Guide",
    descriptionEs: "Guía exclusivo para tu grupo con atención personalizada y ritmo flexible.",
    descriptionEn: "Exclusive guide for your group with personalized attention and flexible pace.",
    price: 25,
    icon: Users,
  },
  {
    id: "alojamiento",
    nameEs: "Alojamiento",
    nameEn: "Lodging",
    descriptionEs: "Noche de hospedaje en alojamiento local cerca de la experiencia.",
    descriptionEn: "One night stay at local lodging near the experience.",
    price: 40,
    icon: TreePalm,
  },
  {
    id: "transporte",
    nameEs: "Transporte",
    nameEn: "Transport",
    descriptionEs: "Traslado de ida y vuelta desde puntos de encuentro designados.",
    descriptionEn: "Round-trip transfer from designated meeting points.",
    price: 15,
    icon: Route,
  },
];

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