"use client";

import {
  Bike,
  Waves,
  UtensilsCrossed,
  CloudRain,
  Binoculars,
  Moon,
  MountainSnow,
  Flame,
  Clock,
  ChevronRight,
  Star,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/app/context/LanguageContext";
import { translations } from "@/lib/translations";
import DynamicHeroHeader from "@/app/components/sections/DynamicHeroHeader";

const ICON_MAP: Record<string, LucideIcon> = {
  Bike,
  Waves,
  UtensilsCrossed,
  CloudRain,
  Binoculars,
  Moon,
  MountainSnow,
  Flame,
  Star,
};

const difficultyConfig: Record<string, { color: string }> = {
  Facil: { color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
  "FÃ¡cil": { color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
  Intermedio: { color: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
  Moderado: { color: "bg-orange-500/20 text-orange-300 border-orange-500/30" },
  "Intermedio a avanzado": { color: "bg-red-500/20 text-red-300 border-red-500/30" },
};

export type TourData = {
  id: string;
  slug: string;
  iconName: string;
  titleEs: string;
  titleEn: string;
  descriptionEs: string;
  descriptionEn: string;
  duration: string;
  difficulty: string;
  priceCRC: number;
  tagEs: string;
  tagEn: string;
  accent: string;
  border: string;
  isFeatured: boolean;
  isMain: boolean;
};

export function ToursClient({ tours }: { tours: TourData[] }) {
  const { lang } = useLanguage();
  const tr = translations[lang].tours;
  const featuredTour = tours.find((tour) => tour.isFeatured || tour.isMain) ?? tours[0] ?? null;
  const gridTours = featuredTour ? tours.filter((tour) => tour.id !== featuredTour.id) : tours;

  const formatPrice = (priceCRC: number) =>
    priceCRC.toLocaleString("es-CR").replace(/,/g, ".");

  return (
    <main className="min-h-screen bg-black text-white">
      <DynamicHeroHeader showHeroSlider={false} />

      <section className="relative overflow-hidden px-4 pb-16 pt-24 text-center">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-teal-950/30 to-black" />
        <div className="relative z-10 mx-auto max-w-3xl">
          <span className="mb-4 inline-block text-xs font-bold uppercase tracking-[0.25em] text-teal-400">
            {tr.badge}
          </span>
          <h1 className="mb-5 bg-gradient-to-br from-white via-white to-teal-200 bg-clip-text text-5xl font-black text-transparent sm:text-6xl">
            {tr.title}
          </h1>
          <p className="mx-auto max-w-xl text-lg text-zinc-400">{tr.description}</p>
        </div>
      </section>

      {featuredTour && (
        <section className="mx-auto mb-16 max-w-6xl px-4">
          <div className="relative overflow-hidden rounded-3xl border border-teal-500/30 bg-gradient-to-br from-teal-900/50 via-teal-950/80 to-black shadow-[0_0_80px_rgba(20,184,166,0.15)]">
            <div className="pointer-events-none absolute right-0 top-0 h-64 w-64 rounded-full bg-teal-500/10 blur-3xl" />
            <div className="pointer-events-none absolute bottom-0 left-0 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl" />

            <div className="relative z-10 flex flex-col items-start gap-8 p-8 sm:flex-row sm:items-center sm:p-12">
              <div className="flex-shrink-0">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-teal-400/30 bg-teal-500/20 shadow-lg shadow-teal-900/50">
                  <Star className="h-10 w-10 text-teal-300" strokeWidth={1.5} />
                </div>
              </div>

              <div className="flex-1">
                <div className="mb-3 flex items-center gap-3">
                  <span className="text-xs font-bold uppercase tracking-widest text-teal-400">
                    {tr.featuredLabel}
                  </span>
                  <span className="rounded-full border border-teal-500/40 bg-teal-500/20 px-2 py-0.5 text-xs font-semibold text-teal-300">
                    {tr.mostBooked}
                  </span>
                </div>
                <h2 className="mb-3 text-3xl font-black text-white sm:text-4xl">
                  {lang === "es" ? featuredTour.titleEs : featuredTour.titleEn}
                </h2>
                <p className="max-w-lg text-base text-zinc-300">
                  {lang === "es" ? featuredTour.descriptionEs : featuredTour.descriptionEn}
                </p>
              </div>

              <div className="flex-shrink-0 text-left sm:text-right">
                <p className="mb-1 text-sm text-zinc-400">{tr.from}</p>
                <p className="text-4xl font-black text-white">
                  <span className="text-2xl text-teal-400">CRC</span> {formatPrice(featuredTour.priceCRC)}
                </p>
                <p className="mt-1 text-xs text-zinc-500">{tr.perPerson}</p>
                <Link
                  href={`/?tour=${featuredTour.slug}#booking`}
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-teal-500 px-6 py-3 text-sm font-bold text-black shadow-lg shadow-teal-900/40 transition-all duration-200 hover:bg-teal-400"
                >
                  {tr.bookNow} <ChevronRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-4 pb-24">
        <div className="mb-10 flex items-center gap-4">
          <h2 className="text-2xl font-bold text-white">{tr.alternativesTitle}</h2>
          <div className="h-px flex-1 bg-gradient-to-r from-zinc-700 to-transparent" />
          <span className="text-sm text-zinc-500">
            {tours.length} {tr.experiences}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {gridTours.map((tour) => {
            const Icon = ICON_MAP[tour.iconName] ?? Star;
            const diffLabel = tr.difficulty[tour.difficulty] ?? tour.difficulty;
            const diff = difficultyConfig[tour.difficulty] ?? difficultyConfig.Facil;

            return (
              <article
                key={tour.id}
                className={[
                  "group relative flex flex-col overflow-hidden rounded-2xl border transition-all duration-300",
                  "bg-gradient-to-b",
                  tour.accent,
                  tour.border,
                  "hover:-translate-y-1 hover:shadow-[0_8px_40px_rgba(0,0,0,0.6)]",
                ].join(" ")}
              >
                <div className="flex items-start justify-between gap-3 px-5 pb-4 pt-6">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/10 transition-colors group-hover:bg-white/15">
                    <Icon className="h-6 w-6 text-white/80" strokeWidth={1.5} />
                  </div>
                  <span className="mt-1 rounded-full border border-white/10 bg-white/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-white/60">
                    {lang === "es" ? tour.tagEs : tour.tagEn}
                  </span>
                </div>

                <div className="flex-1 px-5">
                  <h3 className="mb-2 text-lg font-bold leading-snug text-white">
                    {lang === "es" ? tour.titleEs : tour.titleEn}
                  </h3>
                  <p className="mb-4 text-sm leading-relaxed text-zinc-400">
                    {lang === "es" ? tour.descriptionEs : tour.descriptionEn}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 px-5 pb-2">
                  <span className="flex items-center gap-1.5 text-xs text-zinc-400">
                    <Clock size={12} className="text-zinc-500" />
                    {tour.duration}
                  </span>
                  <span className={`rounded-full border px-2 py-0.5 text-xs ${diff.color}`}>
                    {diffLabel}
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between gap-3 border-t border-white/10 px-5 pb-5 pt-4">
                  <div>
                    <p className="text-xs text-zinc-500">{tr.from}</p>
                    <p className="text-xl font-black text-white">
                      <span className="text-sm text-emerald-400">CRC</span> {formatPrice(tour.priceCRC)}
                    </p>
                  </div>
                  <Link
                    href={`/?tour=${tour.slug}#booking`}
                    className="flex flex-shrink-0 items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-white/20"
                  >
                    {tr.reserve} <ChevronRight size={14} />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
