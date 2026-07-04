import { fallbackPackagesForTour } from "@/lib/tour-packages";
import type { TourPackageOption, TourSummary } from "@/lib/types/index";

const CRC_TO_USD = 525;

export function getTourPackageOptions(tour: TourSummary | null | undefined): TourPackageOption[] {
  const fromTour = (tour?.packages ?? []).filter(
    (pkg) => typeof pkg.price === "number" && pkg.price > 0 && pkg.name,
  );
  if (fromTour.length > 0) return fromTour;

  const fallback = fallbackPackagesForTour(tour?.slug);
  if (fallback.length > 0) return fallback;

  if (typeof tour?.priceCRC === "number" && tour.priceCRC > 0) {
    const usd = Math.max(1, Math.round(tour.priceCRC / CRC_TO_USD));
    return [
      {
        id: "general-entry",
        name: "General Entry",
        nameEs: "Entrada General",
        price: usd,
        priceCRC: tour.priceCRC,
        descriptionEn: tour.descriptionEn ?? "",
        descriptionEs: tour.descriptionEs ?? "",
        groupTour: true,
        departureTimes: ["08:00", "09:00", "10:00"],
      },
    ];
  }

  return [
    {
      id: "general-entry",
      name: "General Entry",
      nameEs: "Entrada General",
      price: 40,
      groupTour: true,
      departureTimes: ["08:00", "09:00", "10:00"],
    },
  ];
}

export function resolveInitialPackage(
  packages: TourPackageOption[],
  preferredId?: string | null,
): TourPackageOption {
  if (preferredId) {
    const match = packages.find((pkg) => pkg.id === preferredId);
    if (match) return match;
  }
  return packages[0];
}

export function getPackageDisplayName(pkg: TourPackageOption, isEs: boolean): string {
  return isEs ? pkg.nameEs || pkg.name : pkg.name;
}

export function packageIncludesLunch(pkg: TourPackageOption | null | undefined): boolean {
  if (!pkg) return false;
  const text = [pkg.id, pkg.name, pkg.nameEs, pkg.descriptionEn, pkg.descriptionEs]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return /\b(lunch|almuerzo|lunch-package|private-package)\b/.test(text);
}

export function getExcludedAddonIds(pkg: TourPackageOption | null | undefined): string[] {
  return packageIncludesLunch(pkg) ? ["almuerzo"] : [];
}

export function getPackageDepartureTimes(pkg: TourPackageOption | null | undefined): string[] {
  const times = (pkg?.departureTimes ?? []).map((t) => t.trim()).filter(Boolean);
  return times.length > 0 ? Array.from(new Set(times)) : [];
}