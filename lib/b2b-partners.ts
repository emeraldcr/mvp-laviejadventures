export const B2B_PARTNER_TYPES = [
  "tour_operator",
  "hotel",
  "cabin",
  "transport",
  "restaurant",
  "agency",
  "other",
] as const;

export type B2BPartnerType = (typeof B2B_PARTNER_TYPES)[number];

export const DEFAULT_B2B_PARTNER_TYPE: B2BPartnerType = "tour_operator";

export const B2B_PARTNER_TYPE_LABELS: Record<B2BPartnerType, { es: string; en: string }> = {
  tour_operator: { es: "Tour operador", en: "Tour operator" },
  hotel: { es: "Hotel", en: "Hotel" },
  cabin: { es: "Cabina / lodge", en: "Cabin / lodge" },
  transport: { es: "Transporte", en: "Transport" },
  restaurant: { es: "Restaurante", en: "Restaurant" },
  agency: { es: "Agencia", en: "Agency" },
  other: { es: "Otro partner", en: "Other partner" },
};

export const ACCOMMODATION_PARTNER_TYPES = new Set<B2BPartnerType>(["hotel", "cabin"]);

export function normalizeB2BPartnerType(value: unknown): B2BPartnerType {
  const normalized = String(value ?? "").trim().toLowerCase().replaceAll("-", "_");
  return B2B_PARTNER_TYPES.includes(normalized as B2BPartnerType)
    ? (normalized as B2BPartnerType)
    : DEFAULT_B2B_PARTNER_TYPE;
}

export function getB2BPartnerTypeLabel(type: unknown, lang: "es" | "en" = "es") {
  const normalizedType = normalizeB2BPartnerType(type);
  return B2B_PARTNER_TYPE_LABELS[normalizedType][lang];
}

export function isAccommodationPartnerType(type: unknown) {
  return ACCOMMODATION_PARTNER_TYPES.has(normalizeB2BPartnerType(type));
}
