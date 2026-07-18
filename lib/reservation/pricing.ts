import { fallbackPackagesForTour } from "@/lib/tour-packages";
import type { TourPackageOption, TourSummary } from "@/lib/types/index";
import { buildGeneralEntryPackage } from "./packages";

export function getTourPackageOptions(tour: TourSummary | null | undefined): TourPackageOption[] {
  const fromTour = (tour?.packages ?? []).filter(
    (pkg) => typeof pkg.price === "number" && pkg.price > 0 && pkg.name,
  );
  if (fromTour.length > 0) return fromTour;

  const fallback = fallbackPackagesForTour(tour?.slug);
  if (fallback.length > 0) return fallback;

  if (typeof tour?.priceCRC === "number" && tour.priceCRC > 0) {
    return [buildGeneralEntryPackage(tour, tour.slug)];
  }

  return [buildGeneralEntryPackage(tour, tour?.slug)];
}

export function resolveInitialPackage(
  packages: TourPackageOption[],
  preferredId?: string | null,
): TourPackageOption {
  if (preferredId) {
    const match = packages.find((pkg) => pkg.id === preferredId || pkg.name === preferredId);
    if (match) return match;
  }
  return packages[0];
}

/** Best default package: mid-tier if 3+, else cheapest. */
export function resolveRecommendedPackage(
  packages: TourPackageOption[],
  isDisabled?: (pkg: TourPackageOption) => boolean,
): TourPackageOption | null {
  if (!packages.length) return null;
  const open = packages.filter((pkg) => !(isDisabled?.(pkg) ?? false));
  const pool = open.length > 0 ? open : packages;
  if (pool.length >= 3) {
    const sorted = [...pool].sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
    return sorted[1] ?? sorted[0] ?? null;
  }
  return [...pool].sort((a, b) => (a.price ?? 0) - (b.price ?? 0))[0] ?? null;
}

export function getPackageId(pkg: TourPackageOption | null | undefined): string {
  if (!pkg) return "";
  return pkg.id ?? pkg.name ?? "";
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
