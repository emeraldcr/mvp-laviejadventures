"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Clock3, MapPin, Zap } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import { translations } from "@/lib/translations";
import HomeNav from "@/app/components/home/HomeNav";
import SiteFooter from "@/app/components/sections/SiteFooter";
import { formatTourPrice, tourTitle } from "@/app/components/home/home-utils";
import { getTourImage } from "@/lib/tour-display";
import type { PublicTour } from "@/lib/tours/public-catalog";

export type TourData = PublicTour;

export function ToursClient({ tours }: { tours: PublicTour[] }) {
  const { lang } = useLanguage();
  const isEs = lang === "es";
  const tr = translations[lang].tours;

  const handleSelectTour = (slug: string) => {
    window.location.href = `/reservar?tour=${encodeURIComponent(slug)}`;
  };

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#FAF9F6] font-sans text-stone-900">
      <HomeNav />

      <section className="border-b border-stone-200 bg-white pt-28 pb-10 md:pt-32 md:pb-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-emerald-700">
            {tr.badge}
          </p>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-2xl">
              <h1 className="font-display text-balance text-4xl font-black leading-[0.98] tracking-tight text-stone-950 md:text-5xl">
                {tr.title}
              </h1>
              <p className="mt-4 text-base leading-relaxed text-stone-600 md:text-lg">
                {tr.description}
              </p>
            </div>
            <p className="text-sm font-semibold text-stone-500">
              {tours.length} {tr.experiences}
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-x-7 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
            {tours.map((tour) => {
              const title = tourTitle(tour, isEs);
              const location = tour.location?.split("-")[0]?.trim() || "San Carlos";
              const isFeatured = tour.isFeatured || tour.isMain;

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
                          <Zap size={11} className="text-emerald-600" />
                          {tour.difficulty}
                        </span>
                      )}
                    </div>

                    <span className="absolute bottom-4 left-4 rounded-full bg-white px-4 py-2 text-sm font-black text-stone-900 shadow-lg">
                      {tr.from} {formatTourPrice(tour, isEs)}
                      <span className="ml-1 text-xs font-medium text-stone-500">
                        / {tr.perPerson}
                      </span>
                    </span>
                  </div>

                  <div className="mt-4 px-1">
                    <h2 className="font-display text-xl font-black tracking-tight text-stone-950">
                      {title}
                    </h2>
                    {(tour.descriptionEs || tour.descriptionEn) && (
                      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-stone-500">
                        {isEs ? tour.descriptionEs : tour.descriptionEn}
                      </p>
                    )}
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-stone-500">
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

                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleSelectTour(tour.slug)}
                        className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-2.5 text-xs font-black uppercase tracking-wide text-white transition hover:bg-emerald-500"
                      >
                        {tr.reserve}
                        <ArrowRight size={14} />
                      </button>
                      <Link
                        href={`/tour/${encodeURIComponent(tour.slug)}`}
                        className="inline-flex items-center gap-1.5 rounded-full border border-stone-300 px-4 py-2.5 text-xs font-bold text-stone-700 transition hover:border-stone-400 hover:text-stone-900"
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

          {tours.length === 0 && (
            <div className="rounded-3xl border border-dashed border-stone-300 bg-white px-6 py-16 text-center text-stone-500">
              {isEs
                ? "No hay tours disponibles en este momento."
                : "No tours available at the moment."}
            </div>
          )}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}