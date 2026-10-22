"use client";

import { localizeHref, tourDifficulty, tourDuration } from "@/lib/i18n";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowUpRight, Clock3, Filter, MapPin, Zap } from "lucide-react";
import { useMemo, useState } from "react";
import { useLanguage } from "@/lib/LanguageContext";
import { translations } from "@/lib/translations";
import SiteHeader from "@/app/components/navigation/SiteHeader";
import PageFooter from "@/app/components/sections/PageFooter";
import { getTourPriceDisplay, tourTitle } from "@/app/components/home/home-utils";
import { getTourImage } from "@/lib/tour-display";
import type { PublicTour } from "@/lib/tours/public-catalog";
import TourIntentGuide from "@/app/components/tours/TourIntentGuide";

export type TourData = PublicTour;

export function ToursClient({ tours }: { tours: PublicTour[] }) {
  const { lang } = useLanguage();
  const isEs = lang === "es";
  const tr = translations[lang].tours;
  const router = useRouter();
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [durationFilter, setDurationFilter] = useState("all");

  const filteredTours = useMemo(() => tours.filter((tour) => {
    const difficulty = tour.difficulty?.toLowerCase() ?? "";
    const duration = tour.durationHours;
    const difficultyMatches = difficultyFilter === "all" || difficulty.includes(difficultyFilter);
    const durationMatches = durationFilter === "all"
      || (duration !== undefined && (
        (durationFilter === "short" && duration.max <= 2)
        || (durationFilter === "medium" && duration.min <= 4 && duration.max >= 2)
        || (durationFilter === "long" && duration.max >= 4)
      ));
    return difficultyMatches && durationMatches;
  }), [difficultyFilter, durationFilter, tours]);

  const handleSelectTour = (slug: string) => {
    router.push(localizeHref(`/reservar?tour=${encodeURIComponent(slug)}`, lang));
  };

  return (
    <main className="lva-public-shell min-h-screen overflow-x-hidden font-sans">
      <SiteHeader solid />

      <section className="border-b border-stone-200 bg-white pt-28 pb-10 dark:border-white/10 dark:bg-stone-950 md:pt-32 md:pb-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-emerald-700 dark:text-emerald-300">
            {tr.badge}
          </p>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-2xl">
              <h1 className="font-display text-balance text-4xl font-black leading-[0.98] tracking-tight text-stone-950 dark:text-stone-50 md:text-5xl">
                {tr.title}
              </h1>
              <p className="mt-4 text-base leading-relaxed text-stone-600 dark:text-stone-300 md:text-lg">
                {tr.description}
              </p>
            </div>
            <p className="text-sm font-semibold text-stone-500 dark:text-stone-400">
              {filteredTours.length} {tr.experiences}
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <TourIntentGuide candidateTours={filteredTours} onSelectTour={handleSelectTour} />
          <div className="mb-8 rounded-3xl border border-stone-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-stone-900 sm:p-5">
            <div className="flex flex-wrap items-center gap-3">
              <div className="mr-1 inline-flex items-center gap-2 text-sm font-black text-stone-900 dark:text-stone-100">
                <Filter size={16} className="text-emerald-700 dark:text-emerald-300" />
                {isEs ? "Encuentre su plan" : "Find your plan"}
              </div>
              <label className="sr-only" htmlFor="tour-difficulty">{isEs ? "Nivel" : "Level"}</label>
              <select id="tour-difficulty" value={difficultyFilter} onChange={(event) => setDifficultyFilter(event.target.value)} className="min-h-11 rounded-xl border border-stone-300 bg-white px-3 text-sm font-semibold text-stone-800 dark:border-white/15 dark:bg-stone-950 dark:text-stone-100">
                <option value="all">{isEs ? "Todos los niveles" : "All levels"}</option>
                <option value="fácil">{isEs ? "Fácil" : "Easy"}</option>
                <option value="moderado">{isEs ? "Moderado" : "Moderate"}</option>
                <option value="intermedio">{isEs ? "Intermedio" : "Intermediate"}</option>
                <option value="extremo">{isEs ? "Extremo" : "Extreme"}</option>
              </select>
              <label className="sr-only" htmlFor="tour-duration">{isEs ? "Duración" : "Duration"}</label>
              <select id="tour-duration" value={durationFilter} onChange={(event) => setDurationFilter(event.target.value)} className="min-h-11 rounded-xl border border-stone-300 bg-white px-3 text-sm font-semibold text-stone-800 dark:border-white/15 dark:bg-stone-950 dark:text-stone-100">
                <option value="all">{isEs ? "Cualquier duración" : "Any duration"}</option>
                <option value="short">{isEs ? "Hasta 2 horas" : "Up to 2 hours"}</option>
                <option value="medium">{isEs ? "2–4 horas" : "2–4 hours"}</option>
                <option value="long">{isEs ? "4+ horas" : "4+ hours"}</option>
              </select>
              {(difficultyFilter !== "all" || durationFilter !== "all") && (
                <button type="button" onClick={() => { setDifficultyFilter("all"); setDurationFilter("all"); }} className="min-h-11 px-2 text-sm font-bold text-emerald-800 underline underline-offset-4 dark:text-emerald-300">
                  {isEs ? "Limpiar" : "Clear"}
                </button>
              )}
            </div>
          </div>
          <div className="grid gap-x-7 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
            {filteredTours.map((tour) => {
              const title = tourTitle(tour, isEs);
              const location = tour.location?.split("-")[0]?.trim() || "San Carlos";
              const isFeatured = tour.isFeatured || tour.isMain;
              const price = getTourPriceDisplay(tour, isEs);

              return (
                <article key={tour.slug} className="group">
                  <div className="relative aspect-[4/5] overflow-hidden rounded-[1.75rem] bg-stone-900 shadow-[0_26px_70px_rgba(30,24,16,0.16)] sm:aspect-[3/4]">
                    <Image
                      src={getTourImage(tour.slug)}
                      alt={title}
                      fill
                      sizes="(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/78 via-black/10 to-black/12" />

                    <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                      {isFeatured && (
                        <span className="rounded-full bg-emerald-500 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-950">
                          {tr.featuredLabel}
                        </span>
                      )}
                      {tour.difficulty && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-bold text-stone-900 backdrop-blur-sm">
                          <Zap size={11} className="text-brand-ink" />
                          {tourDifficulty(tour.difficulty, lang)}
                        </span>
                      )}
                    </div>

                    <span className="absolute bottom-4 left-4 max-w-[calc(100%-5.5rem)] rounded-2xl bg-white px-4 py-2.5 text-stone-900 shadow-lg">
                      <span className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
                        <span className="text-[11px] font-black uppercase tracking-wide text-stone-500">
                          {tr.from}
                        </span>
                        <span className="text-sm font-black">{price.primary}</span>
                        <span className="text-xs font-medium text-stone-500">
                          / {tr.perPerson}
                        </span>
                      </span>
                      {price.secondary && (
                        <span className="mt-0.5 block text-[11px] font-bold leading-none text-emerald-700">
                          {price.secondary}
                        </span>
                      )}
                    </span>
                  </div>

                  <div className="mt-4 px-1">
                    <h2 className="font-display text-xl font-black tracking-tight text-stone-950 dark:text-stone-50">
                      {title}
                    </h2>
                    {(tour.descriptionEs || tour.descriptionEn) && (
                      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-stone-500 dark:text-stone-400">
                        {isEs ? tour.descriptionEs : tour.descriptionEn}
                      </p>
                    )}
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-stone-500 dark:text-stone-400">
                      {tour.duration && (
                        <span className="inline-flex items-center gap-1.5">
                          <Clock3 size={14} />
                          {tourDuration(tour.duration, lang)}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin size={14} />
                        {location}
                      </span>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleSelectTour(tour.slug)}
                        className="inline-flex items-center gap-2 rounded-full bg-[#00796B] px-5 py-2.5 text-xs font-black uppercase tracking-wide text-white transition hover:bg-[#00695C]"
                      >
                        {tr.reserve}
                        <ArrowRight size={14} />
                      </button>
                      <Link
                        href={localizeHref(`/tour/${encodeURIComponent(tour.slug)}`, lang)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-stone-300 px-4 py-2.5 text-xs font-bold text-stone-700 transition hover:border-stone-400 hover:text-stone-900 dark:border-white/15 dark:text-stone-200 dark:hover:border-white/30 dark:hover:text-white"
                      >
                        {isEs ? "Ver detalle" : "View details"}
                        <ArrowUpRight size={14} />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {filteredTours.length === 0 && (
            <div className="rounded-3xl border border-dashed border-stone-300 bg-white px-6 py-16 text-center text-stone-500 dark:border-white/15 dark:bg-stone-900 dark:text-stone-400">
              {isEs
                ? "No hay experiencias con esos filtros. Pruebe otra combinación, mae."
                : "No experiences match those filters. Try another combination."}
            </div>
          )}
        </div>
      </section>

      <PageFooter />
    </main>
  );
}
