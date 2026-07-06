// Add-on catalog shared by the booking UI and the PayPal order API.
// Keep this file free of client-only imports (icons live in constants.ts)
// so API routes can price add-ons server-side.

import type { ReservationAddonDetails } from "./types";
import {
  isTransportConfigComplete,
  type TransportQuoteResult,
} from "./transport";

export interface AddOnData {
  id: string;
  category: "food" | "lodging" | "transport" | "service" | "media";
  nameEs: string;
  nameEn: string;
  descriptionEs: string;
  descriptionEn: string;
  price: number;
  priceNoteEs: string;
  priceNoteEn: string;
  configurable?: boolean;
}

export const ADDON_DATA: AddOnData[] = [
  {
    id: "almuerzo",
    category: "food",
    nameEs: "Restaurante La Vieja",
    nameEn: "La Vieja Restaurant",
    descriptionEs: "Menú local con casado, opción vegetariana, bebida natural y selección de comida para el grupo.",
    descriptionEn: "Local menu with casado, vegetarian option, natural drink, and group food selection.",
    price: 18,
    priceNoteEs: "por persona, desde",
    priceNoteEn: "per person, from",
    configurable: true,
  },
  {
    id: "guia-privado",
    category: "service",
    nameEs: "Guía Privado",
    nameEn: "Private Guide",
    descriptionEs: "Guía exclusivo para tu grupo con atención personalizada, ritmo flexible y paradas a gusto.",
    descriptionEn: "Exclusive guide for your group with personalized attention and flexible pace.",
    price: 35,
    priceNoteEs: "por persona",
    priceNoteEn: "per person",
  },
  {
    id: "alojamiento",
    category: "lodging",
    nameEs: "Hospedaje",
    nameEn: "Lodging",
    descriptionEs: "Solicitud de hostal, hotel o cabina cerca de San Vicente para dormir cerquita de la aventura.",
    descriptionEn: "Hostel, hotel, or cabin request near San Vicente so you can stay close to the adventure.",
    price: 55,
    priceNoteEs: "por persona/noche, desde",
    priceNoteEn: "per person/night, from",
    configurable: true,
  },
  {
    id: "transporte",
    category: "transport",
    nameEs: "Transporte",
    nameEn: "Transport",
    descriptionEs: "Traslado en Costa Rica con selección de pickup y drop-off para coordinar la ruta segura.",
    descriptionEn: "Costa Rica transfer with pickup and drop-off selection for safer route coordination.",
    price: 30,
    priceNoteEs: "por persona, desde",
    priceNoteEn: "per person, from",
    configurable: true,
  },
  {
    id: "fotos",
    category: "media",
    nameEs: "Fotos de Aventura",
    nameEn: "Adventure Photos",
    descriptionEs: "Paquete digital con momentos clave de la experiencia para que usted disfrute sin andar pendiente.",
    descriptionEn: "Digital photo package with key moments from the experience so you can stay present.",
    price: 20,
    priceNoteEs: "por persona",
    priceNoteEn: "per person",
  },
];

export const FOOD_MEAL_OPTIONS = ["Casado con pollo", "Casado con res", "Vegetariano", "Menú infantil"];
export const FOOD_PROTEIN_OPTIONS = ["Pollo", "Res", "Vegetariano", "Sin preferencia"];

const LODGING_TYPE_MULTIPLIER: Record<NonNullable<ReservationAddonDetails["lodgingType"]>, number> = {
  hostel: 0.9,
  hotel: 1.15,
  cabin: 1,
};

export type AddonPricingOptions = {
  transportPricePerPerson?: number | null;
};

export type AddonPriceBreakdownItem = {
  id: string;
  pricePerPerson: number;
};

export type ResolvedAddonsPricing = {
  pricePerPerson: number;
  breakdown: AddonPriceBreakdownItem[];
  transportQuote: TransportQuoteResult | null;
};

export class AddonPricingError extends Error {
  addonId: string;
  code: "incomplete_config" | "transport_quote_failed";

  constructor(addonId: string, code: AddonPricingError["code"], message: string) {
    super(message);
    this.name = "AddonPricingError";
    this.addonId = addonId;
    this.code = code;
  }
}

export function getDefaultLodgingDetails(): Pick<ReservationAddonDetails, "lodgingType" | "lodgingNights"> {
  return { lodgingType: "cabin", lodgingNights: 1 };
}

export function getDefaultFoodDetails(): Pick<ReservationAddonDetails, "restaurantMeal" | "restaurantProtein"> {
  return {
    restaurantMeal: FOOD_MEAL_OPTIONS[0],
    restaurantProtein: FOOD_PROTEIN_OPTIONS[0],
  };
}

export function resolveLodgingNights(details: ReservationAddonDetails): number {
  const nights = Number(details.lodgingNights ?? 1);
  if (!Number.isFinite(nights) || nights < 1) return 1;
  return Math.min(Math.round(nights), 7);
}

export function isLodgingConfigComplete(details: ReservationAddonDetails): boolean {
  return Boolean(details.lodgingType && resolveLodgingNights(details) >= 1);
}

export function isFoodConfigComplete(details: ReservationAddonDetails): boolean {
  return Boolean(details.restaurantMeal?.trim() && details.restaurantProtein?.trim());
}

export function isAddonConfigComplete(addonId: string, details: ReservationAddonDetails): boolean {
  if (addonId === "transporte") return isTransportConfigComplete(details);
  if (addonId === "alojamiento") return isLodgingConfigComplete(details);
  if (addonId === "almuerzo") return isFoodConfigComplete(details);
  return true;
}

export function getAddonConfigErrorMessage(addonId: string, lang: "es" | "en" = "es"): string {
  const addon = ADDON_DATA.find((item) => item.id === addonId);
  const name = addon ? (lang === "es" ? addon.nameEs : addon.nameEn) : addonId;

  if (lang === "es") {
    return `Completá la configuración de ${name} antes de continuar.`;
  }
  return `Complete the ${name} configuration before continuing.`;
}

export function validateSelectedAddons(
  addonIds: readonly string[] | undefined | null,
  details: ReservationAddonDetails,
  lang: "es" | "en" = "es",
): { ok: true } | { ok: false; addonId: string; message: string } {
  if (!Array.isArray(addonIds)) return { ok: true };

  for (const addonId of addonIds) {
    if (!isAddonConfigComplete(addonId, details)) {
      return {
        ok: false,
        addonId,
        message: getAddonConfigErrorMessage(addonId, lang),
      };
    }
  }

  return { ok: true };
}

export function getAddonPricePerPerson(
  addonId: string,
  details: ReservationAddonDetails = {},
  options: AddonPricingOptions = {},
): number {
  const addon = ADDON_DATA.find((item) => item.id === addonId);
  if (!addon) return 0;

  if (addonId === "alojamiento") {
    const nights = resolveLodgingNights(details);
    const lodgingType = details.lodgingType ?? "cabin";
    const multiplier = LODGING_TYPE_MULTIPLIER[lodgingType] ?? 1;
    return Math.round(addon.price * nights * multiplier);
  }

  if (addonId === "transporte" && typeof options.transportPricePerPerson === "number") {
    return options.transportPricePerPerson;
  }

  return addon.price;
}

export function getAddonsPricePerPerson(
  addonIds: readonly string[] | undefined | null,
  details: ReservationAddonDetails = {},
  options: AddonPricingOptions = {},
): number {
  if (!Array.isArray(addonIds) || addonIds.length === 0) return 0;

  const requested = new Set(addonIds.map((id) => String(id).trim()).filter(Boolean));

  return ADDON_DATA
    .filter((addon) => requested.has(addon.id))
    .reduce((sum, addon) => sum + getAddonPricePerPerson(addon.id, details, options), 0);
}

export function buildAddonsBreakdown(
  addonIds: readonly string[] | undefined | null,
  details: ReservationAddonDetails = {},
  options: AddonPricingOptions = {},
): AddonPriceBreakdownItem[] {
  if (!Array.isArray(addonIds) || addonIds.length === 0) return [];

  const requested = new Set(addonIds.map((id) => String(id).trim()).filter(Boolean));

  return ADDON_DATA
    .filter((addon) => requested.has(addon.id))
    .map((addon) => ({
      id: addon.id,
      pricePerPerson: getAddonPricePerPerson(addon.id, details, options),
    }));
}

export function getAddonById(addonId: string): AddOnData | undefined {
  return ADDON_DATA.find((addon) => addon.id === addonId);
}