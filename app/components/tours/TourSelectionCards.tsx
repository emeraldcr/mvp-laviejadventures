"use client";

import { useLanguage } from "@/app/context/LanguageContext";
import { TourSummary } from "@/lib/types/index";

const TOUR_IMAGE_BY_SLUG: Record<string, string> = {
  "tour-ciudad-esmeralda": "/image/IMG_4671.jpg",
  "ciudad-esmeralda": "/image/IMG_4671.jpg",
  "aventuras-cataratas": "/image/IMG_6812.jpg",
  "pozas-cristalinas": "/image/IMG_4257.jpg",
  "caminata-volcanes-dormidos": "/ads/IMG_5666.jpg",
};

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
].reduce((acc, t) => {
  acc[t.slug] = { tagEs: t.tagEs, tagEn: t.tagEn };
  return acc;
}, {} as Record<string, { tagEs: string; tagEn: string }>);

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
        const tag = TOUR_TAGS_BY_SLUG[tour.slug] ?? {
          tagEs: "Nuevo tour",
          tagEn: "New tour",
        };
        const tourTitle = lang === "es" ? tour.titleEs : tour.titleEn;
        const isSelected = selectedTourSlug === tour.slug;

        return (
          <button
            key={tour.slug}
            type="button"
            onClick={() => onSelectTour(tour.slug)}
            className={`group relative overflow-hidden rounded-3xl border bg-zinc-950 text-left shadow-[0_12px_40px_rgba(0,0,0,0.45)] transition ${
              isSelected
                ? "border-emerald-400 ring-2 ring-emerald-400/70"
                : "border-white/15 hover:border-cyan-300/60"
            } ${cardClassName}`}
          >
            <img
              src={TOUR_IMAGE_BY_SLUG[tour.slug] ?? "/image/IMG_6810.jpg"}
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
              <p className="mt-3 text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
                {lang === "es" ? "Toca para reservar" : "Tap to reserve"}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
