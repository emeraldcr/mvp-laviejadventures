import { cache } from "react";
import { getDb } from "@/lib/helpers/mongodb";
import { COLLECTIONS } from "@/lib/constants/db";
import { buildStandardPackagesFromPrice, fallbackPackagesForTour, normalizeTourPackages } from "@/lib/tour-packages";
import type { TourPackageOption } from "@/lib/types/index";
import { usted } from "@/lib/editorial";

export type TourDetail = {
  slug: string;
  titleEs: string;
  titleEn: string;
  descriptionEs: string;
  descriptionEn: string;
  details: string;
  duration: string;
  difficulty: string;
  location: string;
  priceCRC: number;
  tagEs: string;
  inclusions: string[];
  restrictions: string;
  cancellationPolicy: string;
  packages: TourPackageOption[];
};

const DEFAULT_TOUR: TourDetail = {
  slug: "tour-ciudad-esmeralda",
  titleEs: "Tour Ciudad Esmeralda",
  titleEn: "Ciudad Esmeralda Tour",
  descriptionEs: "Adentrate en el Canon del Rio La Vieja y descubre Ciudad Esmeralda entre senderos, pozas naturales y paisajes de aventura.",
  descriptionEn: "Explore La Vieja River Canyon and discover Ciudad Esmeralda through trails, natural pools, and adventure landscapes.",
  details: "Recorrido guiado por senderos, rio y canon hacia Cascada El Zafiro. Ideal para viajeros que quieren una experiencia natural con buena dosis de aventura.",
  duration: "3-4 horas",
  difficulty: "Moderado",
  location: "Juan Castro Blanco, Alajuela Norte, Costa Rica",
  priceCRC: 21000,
  tagEs: "Aventura",
  inclusions: ["Guia certificado", "Equipo de seguridad", "Ingreso a zonas naturales", "Briefing de seguridad"],
  restrictions: "Recomendado para personas en buenas condiciones fisicas.",
  cancellationPolicy: "Cancelacion gratuita hasta 48 horas antes del tour.",
  packages: fallbackPackagesForTour("tour-ciudad-esmeralda"),
};

const DEFAULT_BIRDWATCHING_TOUR: TourDetail = {
  slug: "avistamiento-aves-norteno",
  titleEs: "Avistamiento de Aves Norteno",
  titleEn: "Northern Birdwatching",
  descriptionEs: "Observacion guiada de aves con binoculares, senderos de bosque y explicaciones sobre comportamiento, habitat y conservacion.",
  descriptionEn: "Guided birdwatching with binoculars, forest trails, and insight into behavior, habitats, and conservation.",
  details: "Observacion guiada de aves en el corredor biologico Juan Castro Blanco, con ritmo tranquilo y apoyo para identificar especies por canto, silueta y color.",
  duration: "2 horas",
  difficulty: "Fácil",
  location: "Juan Castro Blanco, Alajuela Norte, Costa Rica",
  priceCRC: 23500,
  tagEs: "Tour estrella",
  inclusions: [
    "Guia especializado en aves bilingue",
    "Binoculares compartidos de alta calidad",
    "Lista de especies observadas",
    "Explicaciones educativas sobre avifauna local",
  ],
  restrictions: "Apto para principiantes. Se recomienda ropa de colores neutros.",
  cancellationPolicy: "Cancelacion gratuita hasta 24 horas antes del tour.",
  packages: fallbackPackagesForTour("avistamiento-aves-norteno"),
};

function getFallbackTour(slug: string): TourDetail | null {
  if (slug === "avistamiento-aves-norteno" || slug === "avistamiento-aves") return DEFAULT_BIRDWATCHING_TOUR;
  if (slug === DEFAULT_TOUR.slug) return DEFAULT_TOUR;
  return null;
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map((item) => String(item)).filter(Boolean) : [];
}

export const getTour = cache(async (slug: string): Promise<TourDetail | null> => {
  try {
    const db = await getDb();
    const tour = await db.collection(COLLECTIONS.TOURS).findOne({
      slug,
      isActive: { $ne: false },
      type: { $in: ["public", "both"] },
    });

    if (!tour) return getFallbackTour(slug);

    const resolvedSlug = String(tour.slug ?? slug);
    const isBirdwatching = resolvedSlug === "avistamiento-aves" || resolvedSlug === "avistamiento-aves-norteno";
    const packages = isBirdwatching ? [] : normalizeTourPackages(tour.packages);
    const slugFallback = packages.length > 0 ? packages : fallbackPackagesForTour(resolvedSlug);
    const priceCRC = Number(tour.priceCRC ?? tour.retailPricePerPax ?? 0);
    const resolvedPackages = slugFallback.length > 0
      ? slugFallback
      : buildStandardPackagesFromPrice(priceCRC);

    return {
      slug: resolvedSlug,
      titleEs: String(tour.titleEs ?? tour.name ?? DEFAULT_TOUR.titleEs),
      titleEn: String(tour.titleEn ?? tour.name ?? tour.titleEs ?? DEFAULT_TOUR.titleEn),
      descriptionEs: usted(String(tour.descriptionEs ?? tour.details ?? "")),
      descriptionEn: String(tour.descriptionEn ?? tour.descriptionEs ?? tour.details ?? ""),
      details: usted(String(tour.details ?? tour.descriptionEs ?? tour.descriptionEn ?? "")),
      duration: String(tour.duration ?? ""),
      difficulty: String(tour.difficulty ?? ""),
      location: String(tour.location ?? ""),
      priceCRC,
      tagEs: String(tour.tagEs ?? ""),
      inclusions: asStringArray(tour.inclusions ?? tour.includes),
      restrictions: String(tour.restrictions ?? ""),
      cancellationPolicy: String(tour.cancellationPolicy ?? ""),
      packages: resolvedPackages,
    };
  } catch (error) {
    console.error("Failed to load tour detail:", error);
    return getFallbackTour(slug);
  }
});

