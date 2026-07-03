import type { TourSummary } from "@/lib/types/index";

export const WHATSAPP_HREF = "https://wa.me/50662332535";

export function tourMinPrice(tour?: TourSummary | null): number | null {
  const prices = (tour?.packages ?? [])
    .map((pkg) => pkg.price)
    .filter((price): price is number => typeof price === "number" && price > 0);
  if (prices.length > 0) return Math.min(...prices);
  return typeof tour?.priceCRC === "number" ? tour.priceCRC : null;
}

export function formatTourPrice(tour: TourSummary | undefined | null, isEs: boolean): string {
  const price = tourMinPrice(tour);
  if (price == null) return isEs ? "Consultar" : "Ask us";
  if (price > 1000) {
    return new Intl.NumberFormat(isEs ? "es-CR" : "en-US", {
      style: "currency",
      currency: "CRC",
      maximumFractionDigits: 0,
    }).format(price);
  }
  return `$${price}`;
}

export function tourTitle(tour: TourSummary, isEs: boolean): string {
  return isEs ? tour.titleEs : tour.titleEn;
}
