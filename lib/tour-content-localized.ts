import type { TourContent } from "@/lib/tour-content";
import { getTourContent } from "@/lib/tour-content";
import type { TourDetail } from "@/lib/tours/detail";

export type TourLocale = "es" | "en";

const ENGLISH_BIRDWATCHING_CONTENT: TourContent = {
  tagline: "Birds of the Juan Castro Blanco biological corridor at sunrise",
  overview: [
    "Northern Costa Rica is one of the country's richest birdwatching regions: more than 400 species are recorded in the Juan Castro Blanco biological corridor, a natural bridge between Monteverde's cloud forest and the San Carlos valleys.",
    "This tour starts at sunrise — between 5:30 and 6:00 — when birdsong peaks and the canopy catches the first golden light. It is not a race: it is a morning of listening, patience, and discovery with local naturalists who know the route.",
    "Your guide teaches identification by sound, silhouette, and behavior before color. Toucans, tanagers, hummingbirds, motmots, and oropendolas are common; with luck, you may find forest-floor species such as crested guans or endemic woodpeckers. We finish by sharing the species list — many guests record more than 30 in one morning.",
    "Ideal for first-time birders, nature photographers, and experienced birders looking for a local guide with deep knowledge of the corridor.",
  ],
  highlights: [
    "Sunrise departure — the busiest time for bird activity",
    "Juan Castro Blanco biological corridor: 400+ recorded species",
    "Bilingual guide focused on calls, silhouettes, and habitats",
    "Shared high-quality binoculars included",
    "Species list reviewed at the end of the walk",
    "A calm pace for all ages and experience levels",
    "Route adapted to the season and the day's conditions",
    "Strategic stops through forest, streams, edges, and viewpoints",
  ],
  itinerary: [
    { time: "5:30", title: "Meeting and welcome", description: "Meet at sunrise for a quick briefing, binocular adjustment, and a review of signals for moving without disturbing birds." },
    { time: "5:45", title: "First sightings", description: "We scan forest edges and open areas, where clay-coloured thrushes, tanagers, and oropendolas are often the first to appear." },
    { time: "6:15", title: "Streams and river edges", description: "A stop by the water, where hummingbirds, kingfishers, and herons take advantage of the cool morning moisture." },
    { time: "6:45", title: "Into the forest", description: "We enter the canopy and understory looking for toucans, motmots, and woodpeckers. The guide locates them by call before you see them." },
    { time: "7:15", title: "Viewpoint and photography", description: "A panoramic stop for swifts, raptors, and the transition from cloud forest to valley." },
    { time: "7:30", title: "Species list and close", description: "Review the birds seen, share recommendations for the rest of the day, and return to the meeting point." },
  ],
  included: [
    "Bilingual local birding guide",
    "Shared high-quality binoculars",
    "Observation route through strategic points in the corridor",
    "Help identifying birds by call, silhouette, and habitat",
    "Species list at the end of the walk",
    "Context about conservation and the biological corridor",
  ],
  notIncluded: ["Transportation to or from the meeting point", "Breakfast (available in the Plus package)", "Tips", "Personal photography equipment"],
  whatToBring: [
    "Your own binoculars if you have them (shared pairs are also available, subject to confirmation)",
    "Neutral clothing: green, beige, or brown; avoid bright colours",
    "Comfortable closed shoes for forest trails",
    "A light jacket: cloud-forest mornings can be cool",
    "Biodegradable repellent and sunscreen",
    "Water and a light snack",
    "A camera or phone with zoom if you want to take photographs",
  ],
  goodToKnow: [
    "The departure is early: sunrise concentrates around 80% of bird activity.",
    "Neutral clothing and slow movements improve sightings considerably.",
    "We cannot guarantee specific species — this is living nature — but the area is exceptionally rich.",
    "In the rainy season (May–November), the forest is especially active; bring a light rain layer.",
    "Children are welcome: the guide adapts the pace and explanations for every age.",
    "Free cancellation up to 48 hours before the tour.",
  ],
  faqs: [
    { q: "Do I need to bring binoculars?", a: "Your own binoculars help, but shared high-quality binoculars are included. Ask us about a dedicated pair when booking a private package." },
    { q: "What time does it start exactly?", a: "Between 5:30 and 6:00 depending on the season. We confirm the exact time when you book — earlier usually means more activity." },
    { q: "Is it suitable if I have never birded before?", a: "Absolutely. The guide starts from the basics: how to use binoculars, follow a call, and read a habitat." },
    { q: "How many species do people usually see?", a: "It varies by season and conditions, but many guests record 25 to 40 species during a two-hour morning." },
    { q: "Can we go if it rains?", a: "Yes, light rain often makes the forest more active. We only pause for lightning or unsafe trail conditions." },
    { q: "Is there a private option for photographers?", a: "Yes. The Private Birdwatching Package includes a flexible pace, species-focused guiding, and professional photos. Ask us to confirm availability." },
    { q: "Where is the meeting point?", a: "In the Juan Castro Blanco / San Carlos area. We send the exact location and coordinates once the booking is confirmed." },
    { q: "Can we combine it with another tour the same day?", a: "Yes. Many guests birdwatch at sunrise and choose another experience in the afternoon. Message us and we can shape the itinerary." },
  ],
  gallery: [],
};

/** One editorial shape for both public routes with localized source fields. */
export function getLocalizedTourContent(tour: TourDetail, locale: TourLocale): TourContent | null {
  const source = getTourContent(tour.slug);
  if (!source || locale === "es") return source;

  if (tour.slug === "avistamiento-aves" || tour.slug === "avistamiento-aves-norteno") {
    return { ...ENGLISH_BIRDWATCHING_CONTENT, gallery: source.gallery };
  }

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
