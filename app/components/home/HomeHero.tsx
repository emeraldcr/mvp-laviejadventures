"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { ArrowRight, Check, ChevronDown, MapPin, Minus, Plus, Star } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import type { TourSummary } from "@/lib/types/index";
import { formatTourPrice, tourTitle } from "./home-utils";

const SLIDE_DURATION = 6500;

const HERO_SLIDES = [
  { src: "/image/IMG_4671.jpg", es: "Cañón Ciudad Esmeralda", en: "Ciudad Esmeralda Canyon" },
  { src: "/image/IMG_6812.jpg", es: "Cascada El Zafiro", en: "El Zafiro Waterfall" },
  { src: "/image/IMG_4257.jpg", es: "Pozas cristalinas", en: "Crystal pools" },
  { src: "/image/IMG_6810.jpg", es: "Río La Vieja", en: "La Vieja River" },
];

function BookingBar({ tours }: { tours: TourSummary[] }) {
  const { lang } = useLanguage();
  const isEs = lang === "es";
  const [slug, setSlug] = useState("");
  const [people, setPeople] = useState(2);

  const resolvedSlug = slug || tours[0]?.slug || "";
  const selectedTour = tours.find((t) => t.slug === resolvedSlug) ?? tours[0];

  const handleBook = () => {
    if (!resolvedSlug) return;
    window.location.href = `/reservar?tour=${encodeURIComponent(resolvedSlug)}&pax=${people}`;
  };

  return (
    <div className="w-full max-w-3xl rounded-3xl bg-white p-2 shadow-[0_24px_80px_rgba(0,0,0,0.45)] sm:rounded-full">
      <div className="flex flex-col sm:flex-row sm:items-center">
        {/* Tour */}
        <div className="min-w-0 flex-1 px-5 py-3">
          <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-400">
            {isEs ? "Experiencia" : "Experience"}
          </label>
          <div className="relative">
            <select
              value={resolvedSlug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full cursor-pointer appearance-none truncate bg-transparent pr-6 text-sm font-bold text-stone-900 focus:outline-none"
            >
              {tours.map((tour) => (
                <option key={tour.slug} value={tour.slug}>
                  {tourTitle(tour, isEs)} — {isEs ? "desde" : "from"} {formatTourPrice(tour, isEs)}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 text-stone-400"
            />
          </div>
        </div>

        <span className="mx-4 h-px bg-stone-200 sm:mx-0 sm:h-10 sm:w-px" />

        {/* People */}
        <div className="px-5 py-3 sm:w-48">
          <span className="block text-[10px] font-bold uppercase tracking-widest text-stone-400">
            {isEs ? "Personas" : "Guests"}
          </span>
          <div className="mt-0.5 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setPeople((p) => Math.max(1, p - 1))}
              aria-label={isEs ? "Menos personas" : "Fewer guests"}
              className="flex h-7 w-7 items-center justify-center rounded-full border border-stone-300 text-stone-600 transition hover:border-stone-500 hover:text-stone-900"
            >
              <Minus size={13} />
            </button>
            <span className="min-w-[1.5rem] text-center text-sm font-bold tabular-nums text-stone-900">
              {people}
            </span>
            <button
              type="button"
              onClick={() => setPeople((p) => Math.min(30, p + 1))}
              aria-label={isEs ? "Más personas" : "More guests"}
              className="flex h-7 w-7 items-center justify-center rounded-full border border-stone-300 text-stone-600 transition hover:border-stone-500 hover:text-stone-900"
            >
              <Plus size={13} />
            </button>
          </div>
        </div>

        {/* CTA */}
        <button
          type="button"
          onClick={handleBook}
          className="group m-2 flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-8 py-4 text-sm font-bold text-white transition-all hover:bg-emerald-500 sm:m-1.5 sm:rounded-full"
        >
          {isEs ? "Reservar" : "Book now"}
          <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
        </button>
      </div>

      {selectedTour?.duration && (
        <p className="px-5 pb-2 text-[11px] text-stone-400 sm:hidden">
          {selectedTour.duration}
          {selectedTour.difficulty ? ` · ${selectedTour.difficulty}` : ""}
        </p>
      )}
    </div>
  );
}

export default function HomeHero({ tours }: { tours: TourSummary[] }) {
  const { lang } = useLanguage();
  const isEs = lang === "es";
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => setCurrent((c) => (c + 1) % HERO_SLIDES.length), []);

  useEffect(() => {
    const id = setInterval(next, SLIDE_DURATION);
    return () => clearInterval(id);
  }, [next]);

  const trustItems = isEs
    ? ["Confirmación inmediata", "Cancelación gratis 24h", "Guías locales certificados"]
    : ["Instant confirmation", "Free 24h cancellation", "Certified local guides"];

  return (
    <section className="relative flex min-h-[100svh] flex-col justify-end overflow-hidden bg-stone-950">
      {/* Slides */}
      <div className="absolute inset-0">
        {HERO_SLIDES.map((slide, index) => (
          <div
            key={slide.src}
            className={`absolute inset-0 transition-opacity duration-[1400ms] ease-in-out ${
              index === current ? "opacity-100" : "opacity-0"
            }`}
          >
            <Image
              src={slide.src}
              alt={isEs ? slide.es : slide.en}
              fill
              priority={index === 0}
              sizes="100vw"
              className={`object-cover ${index === current ? "animate-[lva-kenburns_9s_ease-out_forwards]" : ""}`}
            />
          </div>
        ))}
        {/* Editorial gradient: readable text, photo still breathes */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/45 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative mx-auto w-full max-w-7xl px-4 pb-16 pt-32 sm:px-6 md:pb-20 lg:px-8">
        {/* Rating pill */}
        <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-md ring-1 ring-white/20">
          <span className="flex items-center gap-0.5 text-amber-400">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={12} className="fill-current" />
            ))}
          </span>
          <span className="text-xs font-semibold text-white/90">
            4.9 · {isEs ? "+500 aventureros felices" : "+500 happy adventurers"}
          </span>
        </div>

        <h1 className="font-display max-w-3xl text-balance text-[clamp(2.75rem,7vw,5.5rem)] font-bold leading-[0.95] tracking-tight text-white">
          {isEs ? (
            <>
              El cañón esmeralda{" "}
              <span className="text-emerald-300">te está esperando.</span>
            </>
          ) : (
            <>
              The emerald canyon <span className="text-emerald-300">is waiting for you.</span>
            </>
          )}
        </h1>

        <p className="mt-5 max-w-xl text-base leading-relaxed text-white/80 md:text-lg">
          {isEs
            ? "Canyoning, pozas cristalinas y cascadas escondidas en San Carlos, Costa Rica. Grupos pequeños, guías locales y reserva en línea en dos minutos."
            : "Canyoning, crystal pools, and hidden waterfalls in San Carlos, Costa Rica. Small groups, local guides, and online booking in two minutes."}
        </p>

        {/* Booking bar */}
        <div className="mt-8">
          <BookingBar tours={tours} />
        </div>

        {/* Trust row */}
        <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2">
          {trustItems.map((item) => (
            <span key={item} className="flex items-center gap-1.5 text-xs font-medium text-white/70">
              <Check size={13} className="text-emerald-300" />
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* Slide meta: location caption + dots */}
      <div className="absolute bottom-6 right-4 z-10 hidden flex-col items-end gap-3 sm:right-8 md:flex">
        <span className="flex items-center gap-1.5 rounded-full bg-black/35 px-3.5 py-1.5 text-[11px] font-semibold text-white/85 backdrop-blur-md">
          <MapPin size={11} className="text-emerald-300" />
          {isEs ? HERO_SLIDES[current].es : HERO_SLIDES[current].en}
        </span>
        <div className="flex items-center gap-2">
          {HERO_SLIDES.map((slide, index) => (
            <button
              key={slide.src}
              type="button"
              onClick={() => setCurrent(index)}
              aria-label={`${isEs ? "Ir a imagen" : "Go to image"} ${index + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === current ? "w-7 bg-emerald-300" : "w-1.5 bg-white/40 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
