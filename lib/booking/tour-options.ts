export const TOUR_TIME_OPTIONS = ["08:00", "09:00", "10:00"] as const;

export type TourTime = (typeof TOUR_TIME_OPTIONS)[number];
export type TourPackage = "basic" | "full-day" | "private";
export type TourPackageAvailability = "anytime" | "weekdays";

export type TourPackageOption = {
  id: TourPackage;
  priceUSD: number;
  priceCRC: number | null;
  availableOn: TourPackageAvailability;
};

export const TOUR_PACKAGES: TourPackageOption[] = [
  {
    id: "basic",
    priceUSD: 30,
    priceCRC: 15000,
    availableOn: "anytime",
  },
  {
    id: "full-day",
    priceUSD: 40,
    priceCRC: 20000,
    availableOn: "anytime",
  },
  {
    id: "private",
    priceUSD: 60,
    priceCRC: null,
    availableOn: "weekdays",
  },
];

export const TOUR_PACKAGE_PRICE_USD = TOUR_PACKAGES.reduce(
  (prices, pkg) => ({ ...prices, [pkg.id]: pkg.priceUSD }),
  {} as Record<TourPackage, number>
);

export function isTourTime(value: unknown): value is TourTime {
  return typeof value === "string" && TOUR_TIME_OPTIONS.includes(value as TourTime);
}

export function isTourPackage(value: unknown): value is TourPackage {
  return typeof value === "string" && TOUR_PACKAGES.some((pkg) => pkg.id === value);
}

export function findTourPackage(value: unknown): TourPackageOption | null {
  return TOUR_PACKAGES.find((pkg) => pkg.id === value) ?? null;
}

export function isWeekendDate(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

export function isISODateWeekend(date: string): boolean | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;

  const parsedDate = new Date(`${date}T12:00:00`);
  if (Number.isNaN(parsedDate.getTime())) return null;

  return isWeekendDate(parsedDate);
}

export function isPackageAvailableForDate(pkg: TourPackageOption, date: string): boolean {
  if (pkg.availableOn === "anytime") return true;

  const isWeekend = isISODateWeekend(date);
  if (isWeekend === null) return false;

  return !isWeekend;
}
