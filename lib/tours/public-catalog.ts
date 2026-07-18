import { getDb } from "@/lib/helpers/mongodb";
import { COLLECTIONS } from "@/lib/constants/db";
import { buildStandardPackagesFromPrice, fallbackPackagesForTour, normalizeTourPackages } from "@/lib/tour-packages";
import type { TourSummary } from "@/lib/types/index";

export type PublicTour = TourSummary & {
  iconName?: string;
  accent?: string;
  border?: string;
  isFeatured?: boolean;
  isMain?: boolean;
};

const STAR_TOUR_SLUGS = new Set(["tour-ciudad-esmeralda", "ciudad-esmeralda"]);

const TOUR_PRIORITY_BY_SLUG: Record<string, number> = {
  "tour-ciudad-esmeralda": 1,
  "ciudad-esmeralda": 1,
  "avistamiento-aves-norteno": 2,
  "avistamiento-aves": 2,
  "caminata-volcanes-dormidos": 3,
  "lluvia-en-la-naturaleza": 4,
};

function tourPriority(slug: string) {
  return TOUR_PRIORITY_BY_SLUG[slug] ?? 50;
}

function prioritizeTours<T extends { slug?: string; priceCRC?: number }>(tours: T[]) {
  return [...tours].sort((a, b) => {
    const priorityDiff = tourPriority(String(a.slug ?? "")) - tourPriority(String(b.slug ?? ""));
    if (priorityDiff !== 0) return priorityDiff;
    return (Number(a.priceCRC) || 999999) - (Number(b.priceCRC) || 999999);
  });
}

const DEFAULT_CITY_TOUR = {
  slug: "tour-ciudad-esmeralda",
  iconName: "Star",
  titleEs: "Tour Ciudad Esmeralda – Cañón del Río La Vieja",
  titleEn: "Ciudad Esmeralda Tour – La Vieja River Canyon",
  descriptionEs:
    "Caminata por senderos, río y cañón hacia la Cascada El Zafiro y sus pozas naturales.",
  descriptionEn:
    "A hike through trails, river, and canyon to El Zafiro Waterfall and its natural pools.",
  duration: "3-4 horas",
  difficulty: "Moderado",
  priceCRC: 25000,
  location: "Sucre de Ciudad Quesada, San Carlos, Alajuela, Costa Rica",
  tagEs: "Aventura insignia",
  tagEn: "Signature adventure",
  accent: "from-teal-900/40 to-teal-950/60",
  border: "border-teal-700/30 hover:border-teal-500/60",
  type: "both",
  isActive: true,
  isFeatured: true,
  isMain: true,
};

const DEFAULT_TOURS = [
  DEFAULT_CITY_TOUR,
  {
    slug: "cuadra-tours-aventura",
    iconName: "Bike",
    titleEs: "Cuadra-Tours Aventura",
    titleEn: "ATV Adventure Tours",
    descriptionEs:
      "Recorre senderos exclusivos en cuadra, atravesando bosques, fincas y miradores naturales de la zona norte.",
    descriptionEn:
      "Ride exclusive ATV trails through forests, farms and natural viewpoints of the northern zone.",
    duration: "1.5 – 2 horas",
    difficulty: "Intermedio",
    priceCRC: 19990,
    tagEs: "Adrenalina",
    tagEn: "Adrenaline",
    accent: "from-amber-900/40 to-amber-950/60",
    border: "border-amber-700/30 hover:border-amber-500/60",
    type: "public",
    isActive: true,
    isFeatured: false,
    isMain: false,
  },
  {
    slug: "cascadas-secretas-rio-la-vieja",
    iconName: "Waves",
    titleEs: "Cascadas Secretas del Río La Vieja",
    titleEn: "Secret Waterfalls of La Vieja River",
    descriptionEs:
      "Caminata guiada hacia hermosas cascadas escondidas, perfectas para fotografías y para conectar con la naturaleza.",
    descriptionEn:
      "Guided hike to beautiful hidden waterfalls, perfect for photography and connecting with nature.",
    duration: "2 – 3 horas",
    difficulty: "Moderado",
    priceCRC: 19990,
    tagEs: "Naturaleza",
    tagEn: "Nature",
    accent: "from-cyan-900/40 to-cyan-950/60",
    border: "border-cyan-700/30 hover:border-cyan-500/60",
    type: "public",
    isActive: true,
    isFeatured: false,
    isMain: false,
  },
  {
    slug: "tour-gastronomico-local",
    iconName: "UtensilsCrossed",
    titleEs: "Tour Gastronómico Local",
    titleEn: "Local Gastronomic Tour",
    descriptionEs:
      "Una experiencia culinaria completa probando platillos tradicionales preparados por cocineros locales.",
    descriptionEn:
      "A complete culinary experience tasting traditional dishes prepared by local cooks.",
    duration: "1.5 horas",
    difficulty: "Fácil",
    priceCRC: 24990,
    tagEs: "Cultura",
    tagEn: "Culture",
    accent: "from-rose-900/40 to-rose-950/60",
    border: "border-rose-700/30 hover:border-rose-500/60",
    type: "public",
    isActive: true,
    isFeatured: false,
    isMain: false,
  },
  {
    slug: "lluvia-en-la-naturaleza",
    iconName: "CloudRain",
    titleEs: "Lluvia en la Naturaleza",
    titleEn: "Rain in Nature",
    descriptionEs:
      "Explora el bosque bajo la magia de la lluvia con equipo especial. Una experiencia sensorial inolvidable.",
    descriptionEn:
      "Explore the forest in the magic of the rain with special gear. An unforgettable sensory experience.",
    duration: "1 hora",
    difficulty: "Fácil",
    priceCRC: 19990,
    tagEs: "Sensorial",
    tagEn: "Sensory",
    accent: "from-indigo-900/40 to-indigo-950/60",
    border: "border-indigo-700/30 hover:border-indigo-500/60",
    type: "public",
    isActive: true,
    isFeatured: false,
    isMain: false,
  },
  {
    slug: "avistamiento-aves",
    iconName: "Binoculars",
    titleEs: "Avistamiento de Aves",
    titleEn: "Northern Birdwatching",
    descriptionEs:
      "Observa especies únicas del corredor biológico del Parque Nacional del Agua Juan Castro Blanco.",
    descriptionEn:
      "Observe unique species from the biological corridor of Juan Castro Blanco National Water Park.",
    duration: "2 horas",
    difficulty: "Fácil",
    priceCRC: 22990,
    tagEs: "Tour estrella",
    tagEn: "Star tour",
    accent: "from-lime-900/40 to-lime-950/60",
    border: "border-lime-700/30 hover:border-lime-500/60",
    type: "public",
    isActive: true,
    isFeatured: true,
    isMain: true,
  },
  {
    slug: "tour-nocturno-la-vieja",
    iconName: "Moon",
    titleEs: "Tour Nocturno La Vieja Adventures",
    titleEn: "La Vieja Adventures Night Tour",
    descriptionEs:
      "Descubre la vida nocturna del bosque: insectos, anfibios, mamíferos y sonidos de la montaña.",
    descriptionEn:
      "Discover the nightlife of the forest: insects, amphibians, mammals and mountain sounds.",
    duration: "1.5 horas",
    difficulty: "Fácil",
    priceCRC: 22990,
    tagEs: "Nocturno",
    tagEn: "Nocturnal",
    accent: "from-violet-900/40 to-violet-950/60",
    border: "border-violet-700/30 hover:border-violet-500/60",
    type: "public",
    isActive: true,
    isFeatured: false,
    isMain: false,
  },
  {
    slug: "rapel-canon-del-rio",
    iconName: "MountainSnow",
    titleEs: "Rapel en Cañón del Río",
    titleEn: "River Canyon Rappelling",
    descriptionEs:
      "Descenso controlado en secciones del cañón con guías certificados y equipo profesional.",
    descriptionEn:
      "Controlled descent through canyon sections with certified guides and professional equipment.",
    duration: "2 horas",
    difficulty: "Intermedio a avanzado",
    priceCRC: 29990,
    tagEs: "Extremo",
    tagEn: "Extreme",
    accent: "from-red-900/40 to-red-950/60",
    border: "border-red-700/30 hover:border-red-500/60",
    type: "public",
    isActive: true,
    isFeatured: false,
    isMain: false,
  },
  {
    slug: "caminata-volcanes-dormidos",
    iconName: "Flame",
    titleEs: "Caminata a Volcanes Dormidos",
    titleEn: "Hike to Dormant Volcanoes",
    descriptionEs:
      "Explora cráteres antiguos y miradores únicos del Parque Nacional del Agua Juan Castro Blanco.",
    descriptionEn:
      "Explore ancient craters and unique viewpoints of Juan Castro Blanco National Water Park.",
    duration: "3 – 4 horas",
    difficulty: "Moderado",
    priceCRC: 34990,
    tagEs: "Volcanes",
    tagEn: "Volcanoes",
    accent: "from-orange-900/40 to-orange-950/60",
    border: "border-orange-700/30 hover:border-orange-500/60",
    type: "public",
    isActive: true,
    isFeatured: false,
    isMain: false,
  },
];

const DEFAULT_TOUR_DETAILS: Record<
  string,
  {
    location: string;
    inclusions: string[];
    exclusions: string[];
    restrictions: string;
    cancellationPolicy: string;
  }
> = {
  "cuadra-tours-aventura": {
    location: "Senderos privados - Zona Norte",
    inclusions: ["Guia local", "Equipo de seguridad", "Ruta en senderos privados"],
    exclusions: ["Transporte", "Alimentos y bebidas no especificadas"],
    restrictions: "Intermedio",
    cancellationPolicy: "Cancelacion gratuita hasta 24 horas antes del tour.",
  },
  "cascadas-secretas-rio-la-vieja": {
    location: "Ciudad Esmeralda - Rio La Vieja",
    inclusions: ["Guia local", "Acceso a senderos", "Paradas fotograficas"],
    exclusions: ["Transporte", "Alimentos y bebidas no especificadas"],
    restrictions: "Moderado",
    cancellationPolicy: "Cancelacion gratuita hasta 24 horas antes del tour.",
  },
  "tour-gastronomico-local": {
    location: "Ciudad Esmeralda - Zona Norte",
    inclusions: ["Degustacion local", "Anfitrion local", "Experiencia cultural"],
    exclusions: ["Transporte", "Consumos adicionales"],
    restrictions: "Facil",
    cancellationPolicy: "Cancelacion gratuita hasta 24 horas antes del tour.",
  },
  "lluvia-en-la-naturaleza": {
    location: "Bosque de Ciudad Esmeralda",
    inclusions: ["Guia local", "Equipo especial para lluvia", "Ruta sensorial"],
    exclusions: ["Transporte", "Alimentos y bebidas no especificadas"],
    restrictions: "Facil",
    cancellationPolicy: "Cancelacion gratuita hasta 24 horas antes del tour.",
  },
  "avistamiento-aves": {
    location: "Corredor biologico Juan Castro Blanco",
    inclusions: ["Guia local", "Ruta de observacion", "Apoyo para identificacion de especies"],
    exclusions: ["Transporte", "Binoculares personales"],
    restrictions: "Facil",
    cancellationPolicy: "Cancelacion gratuita hasta 24 horas antes del tour.",
  },
  "avistamiento-aves-norteno": {
    location: "Juan Castro Blanco, Alajuela Norte, Costa Rica",
    inclusions: [
      "Guia especializado en aves bilingue",
      "Binoculares compartidos de alta calidad",
      "Lista de especies observadas",
      "Explicaciones educativas sobre avifauna local",
    ],
    exclusions: ["Transporte", "Binoculares personales", "Alimentos y bebidas no especificadas"],
    restrictions: "Facil",
    cancellationPolicy: "Cancelacion gratuita hasta 24 horas antes del tour.",
  },
  "tour-nocturno-la-vieja": {
    location: "Bosque La Vieja Adventures",
    inclusions: ["Guia local", "Ruta nocturna", "Briefing de seguridad"],
    exclusions: ["Transporte", "Linterna personal"],
    restrictions: "Facil",
    cancellationPolicy: "Cancelacion gratuita hasta 24 horas antes del tour.",
  },
  "rapel-canon-del-rio": {
    location: "Canon del Rio La Vieja",
    inclusions: ["Guia certificado", "Equipo profesional", "Briefing de seguridad"],
    exclusions: ["Transporte", "Alimentos y bebidas no especificadas"],
    restrictions: "Intermedio a avanzado",
    cancellationPolicy: "Cancelacion gratuita hasta 24 horas antes del tour.",
  },
  "caminata-volcanes-dormidos": {
    location: "Parque Nacional del Agua Juan Castro Blanco",
    inclusions: ["Guia local", "Ruta a crateres antiguos", "Miradores naturales"],
    exclusions: ["Transporte", "Alimentos y bebidas no especificadas"],
    restrictions: "Moderado",
    cancellationPolicy: "Cancelacion gratuita hasta 24 horas antes del tour.",
  },
};

function serializePublicTour(t: Record<string, unknown>): PublicTour {
  const slug = String(t.slug ?? "");
  const defaults = DEFAULT_TOUR_DETAILS[slug] ?? null;

  const sourcePackages = normalizeTourPackages(t.packages);
  const slugFallback = sourcePackages.length > 0 ? sourcePackages : fallbackPackagesForTour(slug);
  const packages = slugFallback.length > 0
    ? slugFallback
    : buildStandardPackagesFromPrice(typeof t.priceCRC === "number" ? t.priceCRC : null);

  return {
    id: String(t._id ?? slug),
    slug,
    iconName: typeof t.iconName === "string" ? t.iconName : undefined,
    titleEs: String(t.titleEs ?? ""),
    titleEn: String(t.titleEn ?? ""),
    descriptionEs: String(t.descriptionEs ?? ""),
    descriptionEn: String(t.descriptionEn ?? ""),
    duration: typeof t.duration === "string" ? t.duration : undefined,
    difficulty: typeof t.difficulty === "string" ? t.difficulty : undefined,
    priceCRC: typeof t.priceCRC === "number" ? t.priceCRC : undefined,
    location: String(t.location ?? defaults?.location ?? ""),
    inclusions: Array.isArray(t.inclusions)
      ? t.inclusions.map(String)
      : Array.isArray(t.includes)
        ? t.includes.map(String)
        : defaults?.inclusions ?? [],
    exclusions: Array.isArray(t.exclusions)
      ? t.exclusions.map(String)
      : defaults?.exclusions ?? [],
    cancellationPolicy: String(t.cancellationPolicy ?? defaults?.cancellationPolicy ?? ""),
    restrictions: String(t.restrictions ?? defaults?.restrictions ?? ""),
    packages: packages.map((pkg) => ({
      id: pkg.id,
      name: pkg.name,
      nameEs: pkg.nameEs,
      price: pkg.price,
      priceCRC: pkg.priceCRC,
      descriptionEn: pkg.descriptionEn,
      descriptionEs: pkg.descriptionEs,
      includes: Array.isArray(pkg.includes) ? pkg.includes : [],
      groupTour: pkg.groupTour,
      departureTimes: Array.isArray(pkg.departureTimes) ? pkg.departureTimes : [],
      scheduleNote: pkg.scheduleNote,
    })),
    tagEs: typeof t.tagEs === "string" ? t.tagEs : undefined,
    tagEn: typeof t.tagEn === "string" ? t.tagEn : undefined,
    accent: typeof t.accent === "string" ? t.accent : undefined,
    border: typeof t.border === "string" ? t.border : undefined,
    isFeatured: STAR_TOUR_SLUGS.has(slug),
    isMain: STAR_TOUR_SLUGS.has(slug),
  };
}

export async function readPublicTours(): Promise<PublicTour[]> {
  const db = await getDb();
  const collection = db.collection(COLLECTIONS.TOURS);

  let tours = await collection
    .find({ type: { $in: ["public", "both"] }, isActive: { $ne: false } })
    .sort({ priceCRC: 1 })
    .toArray();

  if (tours.length === 0) {
    await collection.insertMany(DEFAULT_TOURS);
    tours = await collection
      .find({ type: { $in: ["public", "both"] }, isActive: { $ne: false } })
      .sort({ priceCRC: 1 })
      .toArray();
  }

  const hasCiudadEsmeralda = tours.some((tour) =>
    ["tour-ciudad-esmeralda", "ciudad-esmeralda"].includes(String(tour.slug ?? "")),
  );
  const publicTours = hasCiudadEsmeralda ? tours : [DEFAULT_CITY_TOUR, ...tours];

  return prioritizeTours(
    publicTours.map((tour) => serializePublicTour(tour as Record<string, unknown>)),
  );
}
