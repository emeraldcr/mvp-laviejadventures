// Add-on catalog shared by the booking UI and the PayPal order API.
// Keep this file free of client-only imports (icons live in constants.ts)
// so API routes can price add-ons server-side.

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

export type AddonPricingOptions = {
  transportPricePerPerson?: number | null;
};

export function getAddonPricePerPerson(
  addonId: string,
  options: AddonPricingOptions = {},
): number {
  const addon = ADDON_DATA.find((item) => item.id === addonId);
  if (!addon) return 0;

  if (addonId === "transporte" && typeof options.transportPricePerPerson === "number") {
    return options.transportPricePerPerson;
  }

  return addon.price;
}

export function getAddonsPricePerPerson(
  addonIds: readonly string[] | undefined | null,
  options: AddonPricingOptions = {},
): number {
  if (!Array.isArray(addonIds) || addonIds.length === 0) return 0;

  const requested = new Set(addonIds.map((id) => String(id).trim()).filter(Boolean));

  return ADDON_DATA
    .filter((addon) => requested.has(addon.id))
    .reduce((sum, addon) => sum + getAddonPricePerPerson(addon.id, options), 0);
}
