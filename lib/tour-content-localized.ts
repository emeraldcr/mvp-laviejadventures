import type { TourContent } from "@/lib/tour-content";
import { getTourContent } from "@/lib/tour-content";
import type { TourDetail } from "@/lib/tours/detail";

export type TourLocale = "es" | "en";

type EnglishEditorial = Partial<Pick<TourContent, "tagline" | "overview" | "highlights" | "itinerary" | "included" | "notIncluded" | "whatToBring" | "goodToKnow" | "faqs">>;

/**
 * The Spanish editorial catalogue is the source of truth for the local route.
 * English pages still need the operational detail, though: a generic fallback
 * must not silently remove the itinerary or the safety limits guests rely on.
 */
const ENGLISH_ROUTE_CONTENT: Record<string, EnglishEditorial> = {
  "cuadra-tours-aventura": {
    tagline: "Private trails, mud, river crossings and San Carlos viewpoints on four wheels",
    itinerary: [
      { time: "0:00", title: "Welcome and briefing", description: "Check-in, helmet fitting and a clear safety talk. Practise on flat ground until you feel comfortable." },
      { time: "0:20", title: "Into the trails", description: "Ride onto private roads between farms and forest, following the guide in a controlled line." },
      { time: "0:50", title: "Viewpoint and photos", description: "Stop at a high viewpoint to catch your breath and take group photos over the valley." },
      { time: "1:15", title: "River and mud", description: "Head down to the creek for a water crossing and the most playful muddy section." },
      { time: "1:45", title: "Return to base", description: "Ride back to base, return the equipment and clean up." },
    ],
    goodToKnow: [
      "Drivers must be at least 16 and hold a valid licence; younger guests may ride as passengers.",
      "During the green season (May–November), mud is part of the fun — expect to get dirty.",
      "One ATV may be shared by two people when the selected package allows it.",
      "The route follows the weather; heavy rain means we modify sections for safety.",
    ],
  },
  "cascadas-secretas-rio-la-vieja": {
    tagline: "A guided walk to hidden waterfalls and clear natural pools",
    itinerary: [
      { time: "0:00", title: "Meeting point and briefing", description: "Safety talk, equipment check and an overview of what we will see." },
      { time: "0:15", title: "Trail entrance", description: "An easy forest walk with stops to observe birds and plants." },
      { time: "0:45", title: "First waterfall", description: "Reach the first cascade and take time for photographs." },
      { time: "1:15", title: "Clear pool", description: "Optional swim and a break beside the river." },
      { time: "2:15", title: "Return", description: "Follow the trail back to the meeting point." },
    ],
    goodToKnow: [
      "Trails can be slippery; footwear with reliable grip is essential.",
      "The walk suits families and guests with moderate fitness, but children must stay with an adult.",
      "Use biodegradable sunscreen to protect the pools and river.",
      "The river level depends on recent rainfall; the guide decides whether swimming areas are safe.",
      "Heavy rain or a rising river can change or postpone the route.",
    ],
  },
  "tour-gastronomico-local": {
    tagline: "Country flavours: traditional food prepared by local hands",
    itinerary: [
      { time: "0:00", title: "Welcome", description: "A traditional drink, introductions and an overview of the experience." },
      { time: "0:15", title: "First tasting", description: "Typical starters and snacks while the host shares their story." },
      { time: "0:45", title: "Main dish", description: "A traditional dish prepared fresh by local cooks." },
      { time: "1:15", title: "Sweet and coffee", description: "Homemade dessert and coffee from the region to finish." },
    ],
    goodToKnow: [
      "Tell us in advance about vegetarian, vegan, allergy or other dietary needs so the menu can be adapted.",
      "This is a seated, relaxed experience suitable for older adults and children.",
      "The menu changes with the season and the ingredients available locally.",
    ],
  },
  "lluvia-en-la-naturaleza": {
    tagline: "The forest in the rain: a one-of-a-kind sensory experience",
    itinerary: [
      { time: "0:00", title: "Getting ready", description: "Receive your rain layer and equipment, then learn what to notice in a wet forest." },
      { time: "0:15", title: "Into the forest", description: "Walk at an easy pace while the guide interprets the changes brought by the rain." },
      { time: "0:40", title: "Sensory stop", description: "Pause to listen, smell and observe the forest at its most active." },
      { time: "1:00", title: "Close", description: "Return for a warm drink and a comfortable finish." },
    ],
    goodToKnow: [
      "The tour is designed for rain and is only rescheduled for lightning or unsafe conditions.",
      "It is low-intensity and suitable for most ages, with normal trail awareness required.",
      "Come ready to get wet — that is the point of the experience.",
    ],
  },
  "tour-nocturno-la-vieja": {
    tagline: "The forest's secret life after dark",
    itinerary: [
      { time: "18:30", title: "Night briefing", description: "Receive a flashlight, review the safety rules and learn what we may find." },
      { time: "18:45", title: "Night trail", description: "Walk slowly while looking for frogs, insects and eyes shining in the vegetation." },
      { time: "19:30", title: "Listening stop", description: "Turn off the lights for a moment and listen to the night forest." },
      { time: "20:00", title: "Return", description: "Follow the trail back to the meeting point." },
    ],
    goodToKnow: [
      "Long trousers and long sleeves help protect you from insects.",
      "Bring your own flashlight or headlamp even though the guide carries lighting.",
      "Wildlife is never touched, fed or disturbed; the guide controls safe observation distances.",
    ],
  },
  "rapel-canon-del-rio": {
    tagline: "A vertical descent through La Vieja River Canyon with certified guides",
    itinerary: [
      { time: "0:00", title: "Training and equipment", description: "Put on your harness and helmet, then learn the technique and safety system." },
      { time: "0:20", title: "Practice", description: "Complete a short descent on a low wall to build confidence." },
      { time: "0:45", title: "First descent", description: "Take your first real rappel with the guide beside you throughout." },
      { time: "1:20", title: "Canyon descents", description: "Continue through the higher sections selected for the route and the day's conditions." },
      { time: "2:00", title: "Close", description: "Review the experience, return the equipment and head back." },
    ],
    goodToKnow: [
      "This activity requires moderate fitness and no medical contraindications.",
      "It is not suitable for pregnancy or recent back or knee injuries.",
      "Fear of heights is normal; guides stay with you on every descent and let you progress at your pace.",
      "The route follows river flow and weather. Heavy rain or a rising river means we modify or reschedule for safety.",
    ],
  },
  "caminata-volcanes-dormidos": {
    tagline: "Ancient craters and high viewpoints in Juan Castro Blanco National Park",
    itinerary: [
      { time: "0:00", title: "Meeting and briefing", description: "Safety talk and an introduction to the national park." },
      { time: "0:20", title: "Cloud-forest ascent", description: "Climb through high-elevation vegetation with regular rest stops." },
      { time: "1:30", title: "Viewpoint and crater", description: "Reach the viewpoints and ancient craters for photographs and interpretation." },
      { time: "2:30", title: "Light lunch", description: "Take a hydration and snack break; bring your own food." },
      { time: "3:00", title: "Descent", description: "Follow the trail back to the meeting point." },
    ],
    goodToKnow: [
      "This is the most demanding hike in the catalogue and requires good fitness.",
      "High-elevation weather changes quickly; it can be cold and rainy even when the lowlands are sunny.",
      "We stay on marked trails and leave no waste inside the national park.",
      "The guide may shorten or postpone the route when weather or trail conditions are unsafe.",
    ],
  },
  "tour-ciudad-esmeralda": {
    tagline: "Our signature route: trail, river and canyon to El Zafiro",
    itinerary: [
      { time: "0:00", title: "Welcome and safety briefing", description: "Check-in, equipment and a straightforward explanation of the route and the guide's safety decisions." },
      { time: "0:20", title: "Into the forest", description: "Enter the trail toward the canyon." },
      { time: "1:15", title: "River and canyon", description: "Follow sections beside and inside the river canyon, stopping where the landscape opens up." },
      { time: "2:00", title: "El Zafiro Waterfall", description: "Reach the waterfall and enjoy the pool if the river level is safe." },
      { time: "3:00", title: "Return", description: "Head back to the starting point, wet, tired and happy." },
    ],
    goodToKnow: [
      "This route is for guests in good physical condition; message us before booking if you are unsure.",
      "Tell us honestly about medical conditions, mobility limitations or young children so we can recommend the right option.",
      "Heavy rain or a rising river means we do not enter the canyon: the guide modifies or reschedules the tour.",
      "Cancellations 48 hours or more before departure qualify for a full refund according to the policy.",
    ],
  },
};

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
  const routeContent = ENGLISH_ROUTE_CONTENT[tour.slug] ?? {};
  return {
    tagline: routeContent.tagline ?? "A guided nature and adventure experience in San Carlos",
    overview: routeContent.overview ?? [tour.descriptionEn || tour.descriptionEs, "Your guide will confirm the meeting details and the conditions that apply to the selected activity before departure."],
    highlights: routeContent.highlights ?? (packageIncludes.length > 0 ? packageIncludes : ["Local guidance", "Safety briefing", "A nature experience shaped by the conditions of the day"]),
    itinerary: routeContent.itinerary ?? [],
    included: routeContent.included ?? (packageIncludes.length > 0 ? packageIncludes : ["Local guide", "Safety briefing", "Route access"]),
    notIncluded: routeContent.notIncluded ?? ["Transportation unless confirmed in your package", "Food and drinks unless listed in the package", "Professional photographs", "Tips"],
    whatToBring: routeContent.whatToBring ?? ["Comfortable clothing", "Secure footwear with good grip", "Water and personal medication", "A dry change of clothes for river activities", "A waterproof bag for your phone"],
    goodToKnow: routeContent.goodToKnow ?? ["The route and timing can change with weather or river conditions.", "For river activities, heavy rain or a rising river means the guide may modify or reschedule the experience.", "Confirm age, fitness, group size and meeting time with our team before booking."],
    faqs: routeContent.faqs ?? [
      { q: "What should I bring?", a: "Bring comfortable clothing, secure footwear, water and any personal medication. River activities also need a dry change of clothes." },
      { q: "Can the route change?", a: "Yes. The guide makes the safety decision and may adjust or reschedule the route when weather or river conditions are unsafe." },
      { q: "How do I confirm the meeting time?", a: "Send us your preferred date and group details. Our team will confirm the exact meeting point and time." },
    ],
    gallery: source.gallery,
  };
}
