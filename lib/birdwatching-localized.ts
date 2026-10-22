import {
  BIRDWATCHING_HABITATS,
  BIRDWATCHING_LEARNING,
  BIRDWATCHING_SPECIES,
  BIRDWATCHING_STATS,
  BIRDWATCHING_VIDEOS,
  LIKELIHOOD_LABELS,
  type BirdHabitat,
  type BirdSpecies,
  type BirdVideo,
} from "@/lib/birdwatching-content";

type Locale = "es" | "en";

export type LocalizedBirdwatchingData = {
  videos: BirdVideo[];
  species: BirdSpecies[];
  habitats: BirdHabitat[];
  stats: typeof BIRDWATCHING_STATS;
  learning: string[];
  likelihoodLabels: Record<BirdSpecies["likelihood"], string>;
};

const ENGLISH_SPECIES: Array<Pick<BirdSpecies, "commonName" | "description" | "habitat">> = [
  { commonName: "Keel-billed toucan", description: "An icon of the tropical forest. Its deep, resonant call is often heard before the bird appears high in the canopy — one of the stars of the route.", habitat: "Canopy and forest edges" },
  { commonName: "Collared aracari", description: "Smaller than a toucan but just as striking. It moves in pairs or family groups and is excellent for practising silhouette identification.", habitat: "Secondary forest and open areas" },
  { commonName: "Blue-crowned motmot", description: "Long-tailed with a blue crown. It often perches quietly on low branches, making it a favourite for first-time nature photographers.", habitat: "Understory and clearings" },
  { commonName: "Montezuma oropendola", description: "Noisy colonies in tall trees. Its distinctive call and flocking flight mark the start of many birding mornings.", habitat: "Forest edges and pasture" },
  { commonName: "Rufous-tailed hummingbird", description: "One of the corridor's most common hummingbirds. It buzzes near flowers and streams, perfect for learning to track fast movement through binoculars.", habitat: "Gardens, streams, and flowering clearings" },
  { commonName: "Clay-coloured thrush", description: "Costa Rica's national bird. Its melodic dawn song helps the guide teach sound identification before the sun is fully up.", habitat: "Gardens, paths, and open areas" },
  { commonName: "Passerini's tanager", description: "Deep black with a scarlet breast on the male. It appears in mixed flocks with other tanagers — a classic group-birding exercise.", habitat: "Forest edges and farms" },
  { commonName: "Blue-gray tanager", description: "Soft blue and calm in its behaviour. It appears on almost every outing and is perfect for building a first species list.", habitat: "Mid-canopy and open areas" },
  { commonName: "Great kiskadee", description: "Vocal and confident. Its kis-ka-dee call echoes across the corridor and becomes a useful sound reference in the forest.", habitat: "Open areas, paths, and river edges" },
  { commonName: "White-collared swift", description: "Aerial flocks at sunrise. Learning to distinguish fast-flying swifts is part of the challenge — and reward — of the tour.", habitat: "Open sky over valleys and rivers" },
  { commonName: "Black guan", description: "A large and shyer understory bird. With patience and the guide's trained ear, it may appear crossing a trail inside the forest.", habitat: "Interior cloud forest" },
  { commonName: "Hoffmann's woodpecker", description: "Native to Costa Rica and Panama. Its rhythmic tapping is often the first clue before the guide spots it climbing a trunk.", habitat: "Wet forest and mature trees" },
];

export function getLocalizedBirdwatchingData(locale: Locale): LocalizedBirdwatchingData {
  if (locale === "es") {
    return {
      videos: BIRDWATCHING_VIDEOS,
      species: BIRDWATCHING_SPECIES,
      habitats: BIRDWATCHING_HABITATS,
      stats: BIRDWATCHING_STATS,
      learning: BIRDWATCHING_LEARNING,
      likelihoodLabels: LIKELIHOOD_LABELS,
    };
  }

  return {
    videos: BIRDWATCHING_VIDEOS.map((video, index) => ({
      ...video,
      title: ["Sunrise in the biological corridor", "Juan Castro Blanco trails and canopy", "La Vieja Adventures in action", "Local nature and adventure"][index] ?? video.title,
      caption: ["A real birding morning with our local guides.", "An easy walk through wet forest, streams, and natural viewpoints.", "Real experiences filmed in Northern Costa Rica.", "The habitat shared by more than 400 recorded bird species."][index] ?? video.caption,
    })),
    species: BIRDWATCHING_SPECIES.map((species, index) => ({ ...species, ...(ENGLISH_SPECIES[index] ?? {}) })),
    habitats: BIRDWATCHING_HABITATS.map((habitat, index) => ({
      ...habitat,
      title: ["Humid premontane forest", "Streams and river edges", "High-elevation cloud forest", "Forest edges and recovering farms"][index] ?? habitat.title,
      description: [
        "The heart of the route: dense canopy, epiphytes, moss, and understory where toucans, motmots, and woodpeckers live. Morning humidity brings the forest to life.",
        "Birds come to the water at sunrise. Viewpoints beside the La Vieja River and its tributaries can reveal kingfishers, herons, and hummingbirds.",
        "In Juan Castro Blanco National Park, morning mist concentrates higher-elevation species and Northern Costa Rica endemics.",
        "Open areas between forest and pasture are hotspots for tanagers, oropendolas, and field birds — excellent for beginners.",
      ][index] ?? habitat.description,
    })),
    stats: BIRDWATCHING_STATS.map((stat, index) => ({
      ...stat,
      label: ["Species recorded in the corridor", "Ideal sunrise departure", "Guided walk duration", "Visitor rating"][index] ?? stat.label,
    })),
    learning: [
      "Identify birds by call before seeing them",
      "Use binoculars with fast focus and tracking",
      "Read the habitat: canopy, understory, river edges, and open areas",
      "Keep a shared field list of observed species",
      "Photograph birds without changing their behaviour",
      "Understand the biological corridor's role in conservation",
    ],
    likelihoodLabels: {
      "muy-frecuente": "Very common",
      frecuente: "Common",
      posible: "Possible with luck",
    },
  };
}
