export const SITE_URL = "https://www.laviejaadventures.com";
export const BUSINESS_PHONE = "+506 6233-2535";
export const BUSINESS_PHONE_E164 = "+50662332535";
export const BUSINESS_WHATSAPP_URL = `https://wa.me/${BUSINESS_PHONE_E164.replace("+", "")}`;
export const BUSINESS_NAME = "La Vieja Adventures";
// Google listing snapshot supplied by the business on 2026-10-21.
export const GOOGLE_REVIEWS = { rating: 4.9, count: 174, url: "https://share.google/Se1sz2tHGj9yHEtya", asOf: "2026-10-21" } as const;
export function formatGoogleReviewsDate(locale: "es" | "en") {
  const [year, month, day] = GOOGLE_REVIEWS.asOf.split("-").map(Number);
  return new Intl.DateTimeFormat(locale === "es" ? "es-CR" : "en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}
export const BUSINESS_ADDRESS = { streetAddress: "Sucre de Ciudad Quesada", addressLocality: "San Carlos", addressRegion: "Alajuela", postalCode: "21001", addressCountry: "CR" };
export const SOCIAL_URLS = {
  facebook: "https://www.facebook.com/laviejaadventures",
  instagram: "https://www.instagram.com/laviejaadventures",
  tiktok: "https://www.tiktok.com/@la.vieja.adventures",
  youtube: "https://www.youtube.com/@laviejaadventures",
  twitter: "https://x.com/adventuresvieja",
} as const;
