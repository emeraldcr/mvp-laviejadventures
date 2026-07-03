"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Clock3, MapPin, Zap } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import { getTourImage } from "@/lib/tour-display";
import type { TourSummary } from "@/lib/types/index";
import { formatTourPrice, tourTitle } from "./home-utils";

type Props = {
  tours: TourSummary[];
  onSelectTour: (slug: string) => void;
};

export default function ToursShowcase({ tours, onSelectTour }: Props) {
  const { lang } = useLanguage();
  const isEs = lang === "es";

  const stats = [
    { value: "4.9★", label: isEs ? "Valoración promedio" : "Average rating" },
    { value: "+500", label: isEs ? "Aventureros al año" : "Adventurers per year" },
    { value: "100%", label: isEs ? "Guías locales" : "Local guides" },
    { value: "24h", label: isEs ? "Cancelación gratuita" : "Free cancellation" },
  ];

  return (
    <section id="tours" className="bg-[#FAF9F6] py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Trust stats */}
        <div className="grid grid-cols-2 gap-y-8 border-y border-stone-200 py-8 md:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="font-display text-3xl font-bold tracking-tight text-stone-900 md:text-4xl">
                {stat.value}
              </p>
              <p className="mt-1 text-xs font-medium uppercase tracking-widest text-stone-500">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Heading */}
        <div className="mt-20 flex flex-wrap items-end justify-between gap-6 md:mt-24">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-emerald-700">
              {isEs ? "Experiencias" : "Experiences"}
            </p>
            <h2 className="font-display max-w-xl text-balance text-4xl font-bold leading-[1.02] tracking-tight text-stone-900 md:text-5xl">
              {isEs ? "Elegí tu próxima aventura" : "Choose your next adventure"}
            </h2>
          </div>
          <Link
            href="/tours"
            className="group inline-flex items-center gap-2 text-sm font-bold text-stone-900 transition-colors hover:text-emerald-700"
          >
            {isEs ? "Ver todos los tours" : "See all tours"}
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-300 transition-all group-hover:border-emerald-600 group-hover:bg-emerald-600 group-hover:text-white">
              <ArrowRight size={15} />
            </span>
          </Link>
        </div>

        {/* Cards */}
        <div className="mt-10 grid gap-x-8 gap-y-12 sm:grid-cols-2 xl:grid-cols-3">
          {tours.map((tour) => {
            const title = tourTitle(tour, isEs);
            const location = tour.location?.split("-")[0]?.trim() || "San Carlos";
            return (
              <article key={tour.slug} className="group">
                <button
                  type="button"
                  onClick={() => onSelectTour(tour.slug)}
                  className="block w-full text-left"
                >
                  <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-stone-200 sm:aspect-[3/4]">
                    <Image
                      src={getTourImage(tour.slug)}
                      alt={title}
                      fill
                      sizes="(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />

                    {tour.difficulty && (
                      <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-bold text-stone-900 backdrop-blur-sm">
                        <Zap size={11} className="text-emerald-600" />
                        {tour.difficulty}
                      </span>
                    )}

                    <span className="absolute bottom-4 left-4 rounded-full bg-white px-4 py-2 text-sm font-bold text-stone-900 shadow-lg">
                      {isEs ? "Desde" : "From"} {formatTourPrice(tour, isEs)}
                      <span className="ml-1 text-xs font-medium text-stone-500">
                        / {isEs ? "persona" : "person"}
                      </span>
                    </span>

                    <span className="absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-white opacity-0 shadow-lg transition-all duration-300 group-hover:opacity-100">
                      <ArrowUpRight size={17} />
                    </span>
                  </div>

                  <div className="mt-4 px-1">
                    <h3 className="font-display text-xl font-bold tracking-tight text-stone-900 transition-colors group-hover:text-emerald-700">
                      {title}
                    </h3>
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-stone-500">
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
