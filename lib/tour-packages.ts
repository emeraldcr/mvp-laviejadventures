import type { TourPackageOption } from "@/lib/types/index";

type PackageSchedule = "weekday" | "weekend" | "any";

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

export const BIRDWATCHING_PACKAGES: TourPackageOption[] = [
  {
    id: "essential-package",
    name: "Essential Package",
    nameEs: "Paquete Esencial",
    price: 45,
    priceCRC: 24990,
    descriptionEn: "Guided birdwatching tour with an expert naturalist",
    descriptionEs: "Tour guiado de avistamiento de aves con naturalista experto",
    includes: ["Naturalist guide", "Shared binoculars", "Observed species checklist"],
    groupTour: true,
    departureTimes: ["05:30", "06:00"],
    scheduleNote: "Early departures are recommended for best bird activity",
  },
  {
    id: "birder-plus-package",
    name: "Birder Plus Package",
    nameEs: "Paquete Avistador Plus",
    price: 65,
    priceCRC: 34990,
    descriptionEn: "Essential package plus breakfast and photography guidance",
    descriptionEs: "Paquete Esencial + desayuno y guia de fotografia",
    includes: ["Everything in Essential Package", "Breakfast", "Photography guidance"],
    groupTour: true,
    departureTimes: ["05:30", "06:00"],
    scheduleNote: "Early departures are recommended for best bird activity",
  },
  {
    id: "private-birdwatching-package",
    name: "Private Birdwatching Package",
    nameEs: "Paquete Avistamiento Privado",
    price: 92,
    priceCRC: 49990,
    descriptionEn: "Private birdwatching tour with photos and a personalized focus",
    descriptionEs: "Tour privado exclusivo con fotos profesionales y enfoque personalizado",
    includes: ["Private guide", "Flexible focus by species or photography", "Professional photos"],
    groupTour: false,
    departureTimes: ["Flexible"],
    scheduleNote: "Flexible departure time - please check availability with the operator",
  },
];

export function fallbackPackagesForTour(slug?: string | null): TourPackageOption[] {
  if (slug === "tour-ciudad-esmeralda") return CIUDAD_ESMERALDA_PACKAGES;
  if (slug === "avistamiento-aves-norteno" || slug === "avistamiento-aves") return BIRDWATCHING_PACKAGES;
  return [];
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

export function getPackageSchedule(pkg: Pick<TourPackageOption, "id" | "name" | "nameEs" | "groupTour"> | null | undefined): PackageSchedule {
  if (!pkg) return "any";

  const normalized = [pkg.id, pkg.name, pkg.nameEs]
    .filter(Boolean)
    .map(normalizePackageScheduleText)
    .join(" ");

  if (/\b(private|privado)\b/.test(normalized) || pkg.groupTour === false) {
    return "weekday";
  }

  if (
    /\b(essential|esencial|lunch|almuerzo|basic|basico|standard|estandar|daily)\b/.test(normalized) ||
    normalized.includes("full day") ||
    normalized.includes("full-day") ||
    normalized.includes("dia completo") ||
    pkg.groupTour === true
  ) {
    return "weekend";
  }

  return "any";
}

export function isWeekendIsoDate(dateIso: string): boolean | null {
  const match = dateIso.trim().match(/^(\d{4})-(\d{2})-(\d{2})(?:$|T)/);
  if (!match) return null;

  const [, yearRaw, monthRaw, dayRaw] = match;
  const year = Number(yearRaw);
  const month = Number(monthRaw);
  const dayOfMonth = Number(dayRaw);
  const localDate = new Date(year, month - 1, dayOfMonth);

  if (
    localDate.getFullYear() !== year ||
    localDate.getMonth() !== month - 1 ||
    localDate.getDate() !== dayOfMonth
  ) {
    return null;
  }

  const day = localDate.getDay();

  return day === 0 || day === 6;
}

export function isPackageAvailableOnDate(
  pkg: Pick<TourPackageOption, "id" | "name" | "nameEs" | "groupTour"> | null | undefined,
  dateIso: string
): boolean {
  const schedule = getPackageSchedule(pkg);
  const isWeekend = isWeekendIsoDate(dateIso);

  if (schedule === "any" || isWeekend === null) return true;
  if (schedule === "weekend") return isWeekend;

  return !isWeekend;
}

function normalizePackageScheduleText(value: unknown): string {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[_\s]+/g, " ");
}
