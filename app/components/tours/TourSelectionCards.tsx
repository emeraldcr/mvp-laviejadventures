"use client";

import Link from "next/link";
import { ChevronRight, Info } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import { getTourImage } from "@/lib/tour-display";
import { TourSummary } from "@/lib/types/index";

const TOUR_TAGS_BY_SLUG: Record<string, { tagEs: string; tagEn: string }> = [
  {
    slug: "tour-ciudad-esmeralda",
    tagEs: "Tour estrella",
    tagEn: "Star tour",
  },
  {
    slug: "ciudad-esmeralda",
    tagEs: "Tour estrella",
    tagEn: "Star tour",
  },
  {
    slug: "aventuras-cataratas",
    tagEs: "Temporada lluviosa",
    tagEn: "Rainy season pick",
  },
  {
    slug: "pozas-cristalinas",
    tagEs: "Mas vendido",
    tagEn: "Best seller",
  },
  {
    slug: "cuadra-tours-aventura",
    tagEs: "Adrenalina",
    tagEn: "Adrenaline",
  },
  {
    slug: "cascadas-secretas-rio-la-vieja",
    tagEs: "Cataratas",
    tagEn: "Waterfalls",
  },
  {
    slug: "tour-gastronomico-local",
    tagEs: "Cultura local",
    tagEn: "Local culture",
  },
  {
    slug: "lluvia-en-la-naturaleza",
    tagEs: "Sensorial",
    tagEn: "Sensory",
  },
  {
    slug: "avistamiento-aves-norteno",
    tagEs: "Fauna",
    tagEn: "Wildlife",
  },
  {
    slug: "avistamiento-aves",
    tagEs: "Fauna",
    tagEn: "Wildlife",
  },
  {
    slug: "tour-nocturno-la-vieja",
    tagEs: "Nocturno",
    tagEn: "Nocturnal",
  },
  {
    slug: "rapel-canon-del-rio",
    tagEs: "Extremo",
    tagEn: "Extreme",
  },
  {
    slug: "caminata-volcanes-dormidos",
    tagEs: "Volcanes",
    tagEn: "Volcanoes",
  },
].reduce((acc, t) => {
  acc[t.slug] = { tagEs: t.tagEs, tagEn: t.tagEn };
  return acc;
}, {} as Record<string, { tagEs: string; tagEn: string }>);

function inferTourTag(tour: TourSummary): { tagEs: string; tagEn: string } {
  const text = `${tour.slug} ${tour.titleEs} ${tour.titleEn} ${tour.descriptionEs ?? ""} ${tour.descriptionEn ?? ""}`.toLowerCase();

  if (text.includes("catarata") || text.includes("waterfall")) return { tagEs: "Cataratas", tagEn: "Waterfalls" };
  if (text.includes("canon") || text.includes("cañon") || text.includes("cañón") || text.includes("canyon")) return { tagEs: "Cañonismo", tagEn: "Canyoning" };
  if (text.includes("cuadra") || text.includes("atv")) return { tagEs: "Adrenalina", tagEn: "Adrenaline" };
  if (text.includes("gastronom") || text.includes("culinary") || text.includes("food")) return { tagEs: "Cultura local", tagEn: "Local culture" };
  if (text.includes("ave") || text.includes("bird")) return { tagEs: "Fauna", tagEn: "Wildlife" };
  if (text.includes("nocturn") || text.includes("night")) return { tagEs: "Nocturno", tagEn: "Nocturnal" };
  if (text.includes("volcan") || text.includes("volcano")) return { tagEs: "Volcanes", tagEn: "Volcanoes" };
  if (text.includes("lluvia") || text.includes("rain")) return { tagEs: "Bosque lluvioso", tagEn: "Rainforest" };
  if (tour.difficulty?.toLowerCase().includes("avanz")) return { tagEs: "Alta intensidad", tagEn: "High intensity" };
  if (tour.difficulty?.toLowerCase().includes("moder")) return { tagEs: "Aventura moderada", tagEn: "Moderate adventure" };

  return { tagEs: "Experiencia local", tagEn: "Local experience" };
}

type Props = {
  tours: TourSummary[];
  onSelectTour: (slug: string) => void;
  selectedTourSlug?: string | null;
  className?: string;
  cardClassName?: string;
};

export default function TourSelectionCards({
  tours,
  onSelectTour,
  selectedTourSlug,
  className = "grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3",
  cardClassName = "h-[350px]",
}: Props) {
  const { lang } = useLanguage();

  return (
    <div className={className}>
      {tours.map((tour) => {
        const tag = {
          ...inferTourTag(tour),
          ...TOUR_TAGS_BY_SLUG[tour.slug],
          ...(tour.tagEs || tour.tagEn ? { tagEs: tour.tagEs ?? inferTourTag(tour).tagEs, tagEn: tour.tagEn ?? inferTourTag(tour).tagEn } : {}),
        };
        const tourTitle = lang === "es" ? tour.titleEs : tour.titleEn;
        const isSelected = selectedTourSlug === tour.slug;

        const tourHref = `/tour/${encodeURIComponent(tour.slug)}`;

        return (
          <article
            key={tour.slug}
            data-carousel-card
            className={`group relative overflow-hidden rounded-3xl border bg-zinc-950 text-left shadow-[0_12px_40px_rgba(0,0,0,0.45)] transition ${
              isSelected
                ? "border-emerald-400 ring-2 ring-emerald-400/70"
                : "border-white/15 hover:border-cyan-300/60"
            } ${cardClassName}`}
          >
            <img
              src={getTourImage(tour.slug)}
              alt={tourTitle}
              className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/15" />
            <div className="absolute inset-0 bg-cyan-500/0 transition duration-500 group-hover:bg-cyan-500/20" />
            <div className="absolute inset-x-0 bottom-0 p-5">
              <span className="mb-2 inline-block rounded-full border border-white/25 bg-black/35 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-200">
                {isSelected ? (lang === "es" ? "Seleccionado" : "Selected") : lang === "es" ? tag.tagEs : tag.tagEn}
              </span>
              <h3 className="line-clamp-2 text-xl font-black text-white">{tourTitle}</h3>
              <p className="mt-2 line-clamp-2 text-sm text-zinc-200">
                {lang === "es" ? tour.descriptionEs : tour.descriptionEn}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onSelectTour(tour.slug)}
                  className="inline-flex items-center gap-1.5 rounded-full bg-cyan-300 px-4 py-2 text-[11px] font-black uppercase tracking-[0.16em] text-black shadow-lg shadow-cyan-950/50 transition hover:bg-white"
                >
                  {lang === "es" ? "Reservar" : "Reserve"}
                  <ChevronRight className="h-3.5 w-3.5" aria-hidden />
                </button>
                <Link
                  href={tourHref}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-black/45 px-4 py-2 text-[11px] font-black uppercase tracking-[0.16em] text-white backdrop-blur transition hover:border-cyan-300 hover:text-cyan-200"
                >
                  <Info className="h-3.5 w-3.5" aria-hidden />
                  {lang === "es" ? "Ver mas" : "More info"}
                </Link>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
