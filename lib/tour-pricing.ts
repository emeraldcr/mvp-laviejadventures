import type { TourSummary } from "@/lib/types/index";
import { CRC_PER_USD } from "@/lib/reservation/packages";

type PricePair = {
  usd: number | null;
  crc: number | null;
};
type TourPricingInput = Pick<TourSummary, "priceCRC" | "packages">;

export type TourPriceDisplay = {
  primary: string;
  secondary: string | null;
  compact: string;
};

function isPositiveNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

export function tourMinPrice(tour?: TourPricingInput | null): PricePair | null {
  const packagePrices = (tour?.packages ?? [])
    .map((pkg) => ({
      usd: isPositiveNumber(pkg.price) ? pkg.price : null,
      crc: isPositiveNumber(pkg.priceCRC) ? pkg.priceCRC : null,
    }))
    .filter((price) => price.usd != null || price.crc != null);

  if (packagePrices.length > 0) {
    return packagePrices.reduce((lowest, current) => {
      const lowestComparable = lowest.crc ?? (lowest.usd != null ? lowest.usd * CRC_PER_USD : Number.POSITIVE_INFINITY);
      const currentComparable = current.crc ?? (current.usd != null ? current.usd * CRC_PER_USD : Number.POSITIVE_INFINITY);
      return currentComparable < lowestComparable ? current : lowest;
    });
  }

  return isPositiveNumber(tour?.priceCRC) ? { usd: null, crc: tour.priceCRC } : null;
}

function formatUsd(value: number, isEs: boolean): string {
  return `US$${value.toLocaleString(isEs ? "es-CR" : "en-US", {
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  })}`;
}

function formatCrc(value: number, _isEs: boolean): string {
  return `₡${Math.round(value).toLocaleString("en-US").replace(/,/g, " ")}`;
}

export function getTourPriceDisplay(tour: TourPricingInput | undefined | null, isEs: boolean): TourPriceDisplay {
  const price = tourMinPrice(tour);
  if (price == null) {
    const fallback = isEs ? "Consultar" : "Ask us";
    return { primary: fallback, secondary: null, compact: fallback };
  }

  const usd = price.usd;
  const crc = price.crc;

  const primary = crc != null ? formatCrc(crc, isEs) : formatUsd(usd ?? 0, isEs);
  const secondary = crc != null && usd != null ? formatUsd(usd, isEs) : null;

  return {
    primary,
    secondary: secondary && secondary !== primary ? secondary : null,
    compact: secondary && secondary !== primary ? `${primary} / ${secondary}` : primary,
  };
}

export function formatTourPrice(tour: TourPricingInput | undefined | null, isEs: boolean): string {
  return getTourPriceDisplay(tour, isEs).compact;
}

export function tourTitle(tour: TourSummary, isEs: boolean): string {
  return isEs ? tour.titleEs : tour.titleEn;
}
