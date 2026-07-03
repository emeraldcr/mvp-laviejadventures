// Add-on catalog shared by the booking UI and the PayPal order API.
// Keep this file free of client-only imports (icons live in constants.ts)
// so API routes can price add-ons server-side.

export interface AddOnData {
  id: string;
  nameEs: string;
  nameEn: string;
  descriptionEs: string;
  descriptionEn: string;
  price: number;
}

export const ADDON_DATA: AddOnData[] = [
  {
    id: "almuerzo",
    nameEs: "Almuerzo Típico",
    nameEn: "Traditional Lunch",
    descriptionEs: "Casado costarricense (pollo, res o vegetariano) con bebida natural y postre.",
    descriptionEn: "Costa Rican casado (chicken, beef or vegetarian) with natural drink and dessert.",
    price: 15,
  },
  {
    id: "guia-privado",
    nameEs: "Guía Privado",
    nameEn: "Private Guide",
    descriptionEs: "Guía exclusivo para tu grupo con atención personalizada y ritmo flexible.",
    descriptionEn: "Exclusive guide for your group with personalized attention and flexible pace.",
    price: 25,
  },
  {
    id: "alojamiento",
    nameEs: "Alojamiento",
    nameEn: "Lodging",
    descriptionEs: "Noche de hospedaje en alojamiento local cerca de la experiencia.",
    descriptionEn: "One night stay at local lodging near the experience.",
    price: 40,
  },
  {
    id: "transporte",
    nameEs: "Transporte",
    nameEn: "Transport",
    descriptionEs: "Traslado de ida y vuelta desde puntos de encuentro designados.",
    descriptionEn: "Round-trip transfer from designated meeting points.",
    price: 15,
  },
];

export function getAddonsPricePerPerson(addonIds: readonly string[] | undefined | null): number {
  if (!Array.isArray(addonIds) || addonIds.length === 0) return 0;

  const requested = new Set(addonIds.map((id) => String(id).trim()).filter(Boolean));

  return ADDON_DATA
    .filter((addon) => requested.has(addon.id))
    .reduce((sum, addon) => sum + addon.price, 0);
}
