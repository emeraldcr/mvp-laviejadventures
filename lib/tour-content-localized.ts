import type { TourContent } from "@/lib/tour-content";
import { getTourContent } from "@/lib/tour-content";
import type { TourDetail } from "@/lib/tours/detail";

export type TourLocale = "es" | "en";

/** One editorial shape for both public routes with localized source fields. */
export function getLocalizedTourContent(tour: TourDetail, locale: TourLocale): TourContent | null {
  const source = getTourContent(tour.slug);
  if (!source || locale === "es") return source;

  const packageIncludes = Array.from(new Set(tour.packages.flatMap((pkg) => pkg.includes ?? [])));
  return {
    tagline: "A guided nature and adventure experience in San Carlos",
    overview: [tour.descriptionEn || tour.descriptionEs, "Your guide will confirm the meeting details and the conditions that apply to the selected activity before departure."],
    highlights: packageIncludes.length > 0 ? packageIncludes : ["Local guidance", "Safety briefing", "A nature experience shaped by the conditions of the day"],
    itinerary: [],
    included: packageIncludes.length > 0 ? packageIncludes : tour.inclusions,
    notIncluded: ["Transportation unless confirmed in your package", "Food and drinks unless listed in the package", "Professional photographs", "Tips"],
    whatToBring: ["Comfortable clothing", "Secure footwear with good grip", "Water and personal medication", "A dry change of clothes for river activities", "A waterproof bag for your phone"],
    goodToKnow: ["The route and timing can change with weather or river conditions.", "For river activities, heavy rain or a rising river means the guide may modify or reschedule the experience.", "Confirm age, fitness, group size and meeting time with our team before booking."],
    faqs: [
      { q: "What should I bring?", a: "Bring comfortable clothing, secure footwear, water and any personal medication. River activities also need a dry change of clothes." },
      { q: "Can the route change?", a: "Yes. The guide makes the safety decision and may adjust or reschedule the route when weather or river conditions are unsafe." },
      { q: "How do I confirm the meeting time?", a: "Send us your preferred date and group details. Our team will confirm the exact meeting point and time." },
    ],
    gallery: source.gallery,
  };
}
