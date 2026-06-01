import type { TourPackageOption } from "@/lib/types/index";

export const CIUDAD_ESMERALDA_PACKAGES: TourPackageOption[] = [
  {
    id: "essential-package",
    name: "Essential Package",
    nameEs: "Paquete Esencial",
    price: 40,
    priceCRC: 21000,
    descriptionEn: "Complete canyon hike with safety equipment and professional guide",
    descriptionEs: "Caminata completa por el canon con equipo de seguridad y guia profesional",
    includes: [
      "Entrance fee",
      "Bilingual professional guide",
      "Safety equipment (helmet, life vest, harness)",
      "3-4 hour canyoneering experience",
    ],
    groupTour: true,
    departureTimes: ["08:00", "09:00", "10:00"],
    scheduleNote: "All groups are combined in the same departure time",
  },
  {
    id: "lunch-package",
    name: "Lunch Package",
    nameEs: "Paquete con Almuerzo",
    price: 60,
    priceCRC: 31500,
    descriptionEn: "Essential package plus traditional Costa Rican lunch",
    descriptionEs: "Paquete Esencial + almuerzo tipico costarricense",
    includes: [
      "Everything in Essential Package",
      "Typical Costa Rican casado (chicken, beef or vegetarian)",
      "Natural drink and dessert",
    ],
    groupTour: true,
    departureTimes: ["08:00", "09:00", "10:00"],
    scheduleNote: "All groups are combined in the same departure time",
  },
  {
    id: "private-package",
    name: "Private Package",
    nameEs: "Paquete Privado",
    price: 80,
    priceCRC: 42000,
    descriptionEn: "Private canyon adventure with lunch and personalized attention",
    descriptionEs: "Aventura privada por el canon con almuerzo y atencion personalizada",
    includes: [
      "Everything in Lunch Package",
      "Private guide for your group only",
      "Flexible schedule",
      "Professional photos during the tour",
      "Personalized guidance",
    ],
    groupTour: false,
    departureTimes: ["Flexible"],
    scheduleNote: "Flexible departure time - please check availability with the operator",
  },
];

export function fallbackPackagesForTour(slug?: string | null): TourPackageOption[] {
  return slug === "tour-ciudad-esmeralda" ? CIUDAD_ESMERALDA_PACKAGES : [];
}

export function normalizeTourPackages(value: unknown): TourPackageOption[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter((pkg): pkg is Record<string, unknown> => Boolean(pkg) && typeof pkg === "object")
    .map((pkg, index) => {
      const name = String(pkg.name ?? "").trim();
      const nameEs = String(pkg.nameEs ?? "").trim();
      const id = String(pkg.id ?? (nameEs || name || `package-${index + 1}`))
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

      return {
        id: id || `package-${index + 1}`,
        name,
        nameEs: nameEs || undefined,
        price: Number(pkg.price ?? 0),
        priceCRC: pkg.priceCRC == null ? null : Number(pkg.priceCRC),
        descriptionEn: String(pkg.descriptionEn ?? "").trim() || undefined,
        descriptionEs: String(pkg.descriptionEs ?? "").trim() || undefined,
        includes: Array.isArray(pkg.includes) ? pkg.includes.map((item) => String(item)) : [],
        groupTour: pkg.groupTour === false ? false : true,
        departureTimes: Array.isArray(pkg.departureTimes)
          ? pkg.departureTimes.map((time) => String(time).trim()).filter(Boolean)
          : [],
        scheduleNote: String(pkg.scheduleNote ?? "").trim() || undefined,
      };
    })
    .filter((pkg) => pkg.name && Number.isFinite(pkg.price));
}
