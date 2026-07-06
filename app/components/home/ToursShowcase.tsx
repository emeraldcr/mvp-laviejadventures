"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Clock3, MapPin, Zap } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import { getTourImage } from "@/lib/tour-display";
import type { TourSummary } from "@/lib/types/index";
import { getTourPriceDisplay, tourTitle } from "./home-utils";

type Props = {
  tours: TourSummary[];
  onSelectTour: (slug: string) => void;
};

export default function ToursShowcase({ tours, onSelectTour }: Props) {
  const { lang } = useLanguage();
  const isEs = lang === "es";

  const stats = [
    { value: "4.9", label: isEs ? "Valoración promedio" : "Average rating" },
    { value: "+500", label: isEs ? "Aventureros al año" : "Adventurers per year" },
    { value: "100%", label: isEs ? "Guías locales" : "Local guides" },
    { value: "24h", label: isEs ? "Cancelación gratuita" : "Free cancellation" },
  ];

  return (
    <section id="tours" className="bg-[#f4f1ea] py-16 dark:bg-[#0b0a09] md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-white/70 bg-white/70 shadow-[0_28px_90px_rgba(30,24,16,0.12)] backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04] dark:shadow-[0_28px_90px_rgba(0,0,0,0.5)]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_10%,rgba(16,185,129,0.18),transparent_28%),radial-gradient(circle_at_86%_18%,rgba(245,158,11,0.16),transparent_24%),linear-gradient(110deg,rgba(255,255,255,0.72),rgba(255,255,255,0.22),rgba(255,255,255,0.66))] opacity-90" />
          <div className="pointer-events-none absolute -inset-y-16 -left-1/3 w-1/2 rotate-12 bg-gradient-to-r from-transparent via-white/65 to-transparent blur-sm animate-[lva-light-sweep_6.5s_ease-in-out_infinite]" />
          <div className="relative grid grid-cols-2 gap-px bg-emerald-600/10 dark:bg-emerald-500/10 md:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="group relative isolate overflow-hidden bg-gradient-to-br from-emerald-50 to-teal-50 px-4 py-7 text-center transition duration-300 hover:-translate-y-0.5 hover:from-emerald-100 hover:to-teal-100 hover:shadow-[0_18px_45px_rgba(16,185,129,0.25)] dark:from-emerald-950/40 dark:to-teal-950/40 dark:hover:from-emerald-900/50 dark:hover:to-teal-900/50"
              >
                <div className="pointer-events-none absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/30 to-transparent transition group-hover:via-emerald-400/80" />
                <div className="pointer-events-none absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-300/0 blur-2xl transition duration-300 group-hover:bg-emerald-400/25" />
                <p className="relative font-display text-3xl font-black tracking-tight text-emerald-900 transition duration-300 group-hover:text-emerald-700 dark:text-emerald-100 dark:group-hover:text-emerald-200 md:text-4xl">
                  {stat.value}
                </p>
                <p className="relative mt-1 text-[10px] font-bold uppercase tracking-widest text-emerald-700 transition group-hover:text-emerald-800 dark:text-emerald-300 dark:group-hover:text-emerald-200">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 flex flex-wrap items-end justify-between gap-6 md:mt-20">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-emerald-700 dark:text-emerald-300">
              {isEs ? "Experiencias" : "Experiences"}
            </p>
            <h2 className="font-display max-w-2xl text-balance text-4xl font-black leading-[0.98] tracking-tight text-stone-950 dark:text-stone-50 md:text-6xl">
              {isEs ? "Elegí la aventura que calza con tu grupo" : "Choose the adventure that fits your crew"}
            </h2>
          </div>
          <Link
            href="/tours"
            className="group inline-flex items-center gap-2 text-sm font-black text-stone-950 transition-colors hover:text-emerald-700 dark:text-stone-50 dark:hover:text-emerald-300"
          >
            {isEs ? "Ver todos los tours" : "See all tours"}
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-300 transition-all group-hover:border-emerald-600 group-hover:bg-emerald-600 group-hover:text-white dark:border-stone-600">
              <ArrowRight size={15} />
            </span>
          </Link>
        </div>

        <div className="mt-10 grid gap-x-7 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
          {tours.map((tour) => {
            const title = tourTitle(tour, isEs);
            const location = tour.location?.split("-")[0]?.trim() || "San Carlos";
            const price = getTourPriceDisplay(tour, isEs);
            return (
              <article key={tour.slug} className="group">
                <button
                  type="button"
                  onClick={() => onSelectTour(tour.slug)}
                  className="block w-full text-left"
                >
                  <div className="relative aspect-[4/5] overflow-hidden rounded-[1.75rem] bg-stone-900 shadow-[0_26px_70px_rgba(30,24,16,0.16)] sm:aspect-[3/4]">
                    <Image
                      src={getTourImage(tour.slug)}
                      alt={title}
                      fill
                      sizes="(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/78 via-black/10 to-black/12" />

                    {tour.difficulty && (
                      <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-bold text-stone-900 backdrop-blur-sm">
                        <Zap size={11} className="text-emerald-600" />
                        {tour.difficulty}
                      </span>
                    )}

                    <span className="absolute bottom-4 left-4 max-w-[calc(100%-5.5rem)] rounded-2xl bg-white px-4 py-2.5 text-stone-900 shadow-lg">
                      <span className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
                        <span className="text-[11px] font-black uppercase tracking-wide text-stone-500">
                          {isEs ? "Desde" : "From"}
                        </span>
                        <span className="text-sm font-black">{price.primary}</span>
                        <span className="text-xs font-medium text-stone-500">
                          / {isEs ? "persona" : "person"}
                        </span>
                      </span>
                      {price.secondary && (
                        <span className="mt-0.5 block text-[11px] font-bold leading-none text-emerald-700">
                          {price.secondary}
                        </span>
                      )}
                    </span>

                    <span className="absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-400 text-emerald-950 shadow-lg transition-all duration-300 group-hover:-translate-y-0.5 group-hover:bg-white">
                      <ArrowUpRight size={17} />
                    </span>
                  </div>

                  <div className="mt-4 px-1">
                    <h3 className="font-display text-xl font-black tracking-tight text-stone-950 transition-colors group-hover:text-emerald-700 dark:text-stone-50 dark:group-hover:text-emerald-300">
                      {title}
                    </h3>
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-stone-500 dark:text-stone-400">
                      {tour.duration && (
                        <span className="inline-flex items-center gap-1.5">
                          <Clock3 size={14} />
                          {tour.duration}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin size={14} />
                        {location}
                      </span>
                    </div>
                    <span className="mt-4 inline-flex items-center gap-2 text-xs font-black uppercase tracking-wide text-emerald-800 dark:text-emerald-300">
                      {isEs ? "Reservar fechas" : "Reserve dates"}
                      <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </button>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
