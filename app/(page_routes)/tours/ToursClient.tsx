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
  "Fácil": { color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
  "Intermedio": { color: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
  "Moderado": { color: "bg-orange-500/20 text-orange-300 border-orange-500/30" },
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

  const formatPrice = (priceCRC: number) =>
    priceCRC.toLocaleString("es-CR").replace(/,/g, ".");

  const getReservationHref = (tourSlug: string) => `/?tour=${encodeURIComponent(tourSlug)}#booking`;

  return (
    <main className="min-h-screen bg-black text-white">
      <DynamicHeroHeader showHeroSlider={false} />

      {/* Page header */}
      <section className="relative pt-24 pb-16 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-teal-950/30 to-black pointer-events-none" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <span className="inline-block text-xs font-bold tracking-[0.25em] uppercase text-teal-400 mb-4">
            {tr.badge}
          </span>
          <h1 className="text-5xl sm:text-6xl font-black mb-5 bg-gradient-to-br from-white via-white to-teal-200 bg-clip-text text-transparent">
            {tr.title}
          </h1>
          <p className="text-zinc-400 text-lg max-w-xl mx-auto">
            {tr.description}
          </p>
        </div>
      </section>

      {/* Featured tour */}
      <section className="max-w-6xl mx-auto px-4 mb-16">
        <div className="relative rounded-3xl overflow-hidden border border-teal-500/30 bg-gradient-to-br from-teal-900/50 via-teal-950/80 to-black shadow-[0_0_80px_rgba(20,184,166,0.15)]">
          <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 p-8 sm:p-12 flex flex-col sm:flex-row items-start sm:items-center gap-8">
            <div className="flex-shrink-0">
              <div className="w-20 h-20 rounded-2xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center shadow-lg shadow-teal-900/50">
                <Star className="w-10 h-10 text-teal-300" strokeWidth={1.5} />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs font-bold tracking-widest uppercase text-teal-400">
                  {tr.featuredLabel}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-teal-500/20 border border-teal-500/40 text-teal-300 text-xs font-semibold">
                  {tr.mostBooked}
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-white mb-3">
                {tr.featuredTitle}
              </h2>
              <p className="text-zinc-300 text-base max-w-lg">
                {tr.featuredDesc}
              </p>
            </div>
            <div className="flex-shrink-0 text-right">
              <p className="text-zinc-400 text-sm mb-1">{tr.from}</p>
              <p className="text-4xl font-black text-white">
                <span className="text-teal-400 text-2xl">₡</span>19.990
              </p>
              <p className="text-zinc-500 text-xs mt-1">{tr.perPerson}</p>
              <Link
                href={getReservationHref("tour-ciudad-esmeralda")}
                className="mt-4 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-teal-500 hover:bg-teal-400 text-black font-bold text-sm transition-all duration-200 shadow-lg shadow-teal-900/40"
              >
                {tr.bookNow} <ChevronRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Tours grid */}
      <section className="max-w-6xl mx-auto px-4 pb-24">
        <div className="flex items-center gap-4 mb-10">
          <h2 className="text-2xl font-bold text-white">{tr.alternativesTitle}</h2>
          <div className="flex-1 h-px bg-gradient-to-r from-zinc-700 to-transparent" />
          <span className="text-zinc-500 text-sm">{tours.length} {tr.experiences}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {tours.map((tour) => {
            const Icon = ICON_MAP[tour.iconName] ?? Star;
            const diffLabel = tr.difficulty[tour.difficulty] ?? tour.difficulty;
            const diff = difficultyConfig[tour.difficulty] ?? difficultyConfig["Fácil"];

            return (
              <article
                key={tour.id}
                className={[
                  "group relative rounded-2xl border transition-all duration-300",
                  "bg-gradient-to-b",
                  tour.accent,
                  tour.border,
                  "hover:shadow-[0_8px_40px_rgba(0,0,0,0.6)] hover:-translate-y-1",
                  "flex flex-col overflow-hidden",
                ].join(" ")}
              >
                {/* Top bar */}
                <div className="px-5 pt-6 pb-4 flex items-start justify-between gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-white/15 transition-colors">
                    <Icon className="w-6 h-6 text-white/80" strokeWidth={1.5} />
                  </div>
                  <span className="text-xs font-semibold tracking-wide uppercase px-2.5 py-1 rounded-full bg-white/10 text-white/60 border border-white/10 mt-1">
                    {lang === "es" ? tour.tagEs : tour.tagEn}
                  </span>
                </div>

                {/* Content */}
                <div className="px-5 flex-1">
                  <h3 className="text-lg font-bold text-white leading-snug mb-2">
                    {lang === "es" ? tour.titleEs : tour.titleEn}
                  </h3>
                  <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                    {lang === "es" ? tour.descriptionEs : tour.descriptionEn}
                  </p>
                </div>

                {/* Meta */}
                <div className="px-5 pb-2 flex flex-wrap gap-2">
                  <span className="flex items-center gap-1.5 text-xs text-zinc-400">
                    <Clock size={12} className="text-zinc-500" />
                    {tour.duration}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${diff.color}`}>
                    {diffLabel}
                  </span>
                </div>

                {/* Footer */}
                <div className="px-5 pt-4 pb-5 mt-3 border-t border-white/10 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs text-zinc-500">{tr.from}</p>
                    <p className="text-xl font-black text-white">
                      <span className="text-emerald-400 text-sm">₡</span>
                      {formatPrice(tour.priceCRC)}
                    </p>
                  </div>
                  <Link
                    href={getReservationHref(tour.slug)}
                    className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-semibold transition-all duration-200 flex items-center gap-1.5 flex-shrink-0"
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
