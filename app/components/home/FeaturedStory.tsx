"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, Clock3, Sparkles } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import type { TourSummary } from "@/lib/types/index";
import { BOOKING_HREF, TOURS_HREF, primaryBookingLabel } from "./home-utils";
import GoogleRating from "@/app/components/GoogleRating";
import { localizeHref } from "@/lib/i18n";

type Props = {
  tours: TourSummary[];
};

export default function FeaturedStory({ tours }: Props) {
  const { lang } = useLanguage();
  const isEs = lang === "es";

  if (tours.length === 0) return null;
  const featuredTour = tours[0];

  const inclusions = isEs
    ? [
        "Sendero, río y cañón en una sola salida",
        "Cascada El Zafiro y pozas de agua turquesa",
        "Guía local bilingüe y charla de seguridad clara",
        "Ruta que se ajusta al clima y al nivel del río",
      ]
    : [
        "Trail, river, and canyon in a single outing",
        "El Zafiro Waterfall and turquoise pools",
        "Local bilingual guide and a clear safety briefing",
        "Route adjusts to the weather and river level",
      ];

  return (
    <section className="lva-home-section--paper py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div className="relative">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2.5rem]">
              <Image
                src="/image/IMG_4671.webp"
                alt={isEs ? "Cañón de Ciudad Esmeralda en Costa Rica" : "Ciudad Esmeralda Canyon in Costa Rica"}
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            </div>

            <span className="absolute left-6 top-6 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-4 py-2 text-xs font-bold text-stone-900 shadow-lg backdrop-blur-sm">
              <Sparkles size={13} className="text-amber-500" />
              {isEs ? "La de la casa" : "Our house favorite"}
            </span>

            <div className="absolute -bottom-6 right-4 w-56 rounded-2xl bg-white p-4 shadow-[0_20px_60px_rgba(0,0,0,0.15)] dark:bg-stone-900 dark:shadow-[0_20px_60px_rgba(0,0,0,0.5)] dark:ring-1 dark:ring-white/10 sm:right-8 sm:w-64">
              <GoogleRating locale={lang} />
            </div>
          </div>

          <div>
            <p className="lva-home-kicker mb-3">
              {isEs ? "San Carlos · Juan Castro Blanco" : "San Carlos · Juan Castro Blanco"}
            </p>
            <h2 className="font-display text-balance text-4xl font-bold leading-[1.02] tracking-tight text-stone-900 dark:text-stone-50 md:text-5xl">
              {isEs ? "Del sendero a la Cascada El Zafiro" : "From the trail to El Zafiro Waterfall"}
            </h2>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-stone-600 dark:text-stone-300 md:text-lg">
              {isEs
                ? "Es la salida que más nos piden: barro en las botas, agua hasta las rodillas y el cañón abriéndose hasta la cascada. No es un paseo de fotos: exige buena condición física. Y si el clima no acompaña, ajustamos la ruta o le reprogramamos la reserva."
                : "It's the day people ask for most: mud on your boots, water to your knees, and the canyon opening up to the falls. Not a photo stroll — it takes real fitness. And if the weather doesn't cooperate, we adjust the route or rebook you."}
            </p>

            <ul className="mt-7 grid gap-3 sm:grid-cols-2">
              {inclusions.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-stone-700 dark:text-stone-200">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40">
                    <Check size={12} className="text-emerald-700 dark:text-emerald-300" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-wrap items-center gap-5">
              <div>
                <span className="block text-xs font-medium uppercase tracking-widest text-stone-400 dark:text-stone-500">
                  {isEs ? "Recorrido" : "Route"}
                </span>
                <span className="font-display text-3xl font-bold text-stone-900 dark:text-stone-50">
                  {isEs ? "3,5 km" : "3.5 km"}
                </span>
                <span className="ml-1.5 text-sm text-stone-500 dark:text-stone-400">
                  {isEs ? "de sendero, río y cañón" : "of trail, river and canyon"}
                </span>
              </div>
              <span className="lva-home-meta inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-stone-50 px-3.5 py-2 font-semibold dark:border-stone-800 dark:bg-stone-900">
                <Clock3 size={13} />
                {featuredTour.duration || (isEs ? "Duración por confirmar" : "Duration to confirm")}
              </span>
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href={localizeHref(BOOKING_HREF, lang)}
                className="group inline-flex items-center gap-2 rounded-full bg-[#00796B] px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/25 transition-all hover:-translate-y-0.5 hover:bg-[#00695C]"
              >
                {primaryBookingLabel(isEs)}
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href={localizeHref(TOURS_HREF, lang)}
                className="group inline-flex items-center gap-2 rounded-full border-2 border-emerald-600 px-7 py-3.5 text-sm font-black text-emerald-800 transition-all hover:-translate-y-0.5 hover:bg-emerald-50 dark:border-emerald-400 dark:text-emerald-300 dark:hover:bg-emerald-950/40"
              >
                {isEs ? "Explorar otros tours" : "Explore other tours"}
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
