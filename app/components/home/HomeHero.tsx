"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, Check, ChevronDown, MapPin, Minus, Plus, ShieldCheck, Star } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import type { TourSummary } from "@/lib/types/index";
import { WHATSAPP_HREF, formatTourPrice, tourTitle } from "./home-utils";

const SLIDE_DURATION = 6500;

const HERO_SLIDES = [
  { src: "/image/IMG_4671.jpg", es: "Cañón Ciudad Esmeralda", en: "Ciudad Esmeralda Canyon" },
  { src: "/image/IMG_6812.jpg", es: "Cascada El Zafiro", en: "El Zafiro Waterfall" },
  { src: "/image/IMG_4257.jpg", es: "Pozas cristalinas", en: "Crystal pools" },
  { src: "/image/IMG_6810.jpg", es: "Río La Vieja", en: "La Vieja River" },
];

function BookingCard({ tours }: { tours: TourSummary[] }) {
  const { lang } = useLanguage();
  const isEs = lang === "es";
  const [slug, setSlug] = useState("");
  const [people, setPeople] = useState(2);
  const tourMenuRef = useRef<HTMLDetailsElement>(null);

  const resolvedSlug = slug || tours[0]?.slug || "";
  const selectedTour = tours.find((t) => t.slug === resolvedSlug) ?? tours[0];

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!tourMenuRef.current?.contains(event.target as Node)) {
        tourMenuRef.current?.removeAttribute("open");
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") tourMenuRef.current?.removeAttribute("open");
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleBook = () => {
    if (!resolvedSlug) return;
    window.location.href = `/reservar?tour=${encodeURIComponent(resolvedSlug)}&pax=${people}`;
  };

  return (
    <aside className="w-full max-w-[520px] rounded-[2.4rem] border border-white/16 bg-black/28 p-5 shadow-[0_34px_110px_rgba(0,0,0,0.46)] backdrop-blur-2xl">
      <div className="rounded-[1.85rem] border border-white/10 bg-white/[0.08] p-7">
        <div className="mb-7 flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-emerald-200/80">
              {isEs ? "Reserva rápida" : "Quick booking"}
            </p>
            <h2 className="mt-3 font-display text-3xl font-black leading-none text-white">
              {isEs ? "Armá tu salida" : "Plan your tour"}
            </h2>
          </div>
          <span className="rounded-full border border-emerald-300/25 bg-emerald-300/12 px-4 py-2 text-[10px] font-black uppercase tracking-wide text-emerald-200">
            {isEs ? "Online" : "Online"}
          </span>
        </div>

        <div className="space-y-6">
          <div className="relative">
            <span className="block text-[10px] font-bold uppercase tracking-widest text-emerald-200/80">
              {isEs ? "Experiencia" : "Experience"}
            </span>
          <details ref={tourMenuRef} className="group/tour">
            <summary
              className="mt-3 flex min-h-20 w-full cursor-pointer list-none items-center justify-between gap-4 rounded-[1.35rem] border border-white/12 bg-white/[0.08] px-5 py-4 text-left outline-none transition hover:border-emerald-300/45 hover:bg-white/[0.11] group-open/tour:border-emerald-300/70 group-open/tour:bg-emerald-300/10 group-open/tour:shadow-[0_0_0_4px_rgba(52,211,153,0.10)] [&::-webkit-details-marker]:hidden"
            >
              <span className="min-w-0">
                <span className="block truncate text-base font-black text-white">
                  {selectedTour ? tourTitle(selectedTour, isEs) : isEs ? "Elegí un tour" : "Choose a tour"}
                </span>
                {selectedTour && (
                  <span className="mt-1 block text-xs font-bold uppercase tracking-wide text-emerald-200/75">
                    {isEs ? "Desde" : "From"} {formatTourPrice(selectedTour, isEs)}
                    {selectedTour.duration ? ` · ${selectedTour.duration}` : ""}
                  </span>
                )}
              </span>
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/12 bg-black/18 text-white/65 transition group-open/tour:rotate-180 group-open/tour:border-emerald-300/40 group-open/tour:text-emerald-200">
                <ChevronDown size={15} />
              </span>
            </summary>

            <div className="absolute left-0 right-0 top-[calc(100%+0.75rem)] z-30 overflow-hidden rounded-[1.35rem] border border-emerald-300/24 bg-[#101713]/96 p-2 shadow-[0_26px_70px_rgba(0,0,0,0.52)] backdrop-blur-2xl">
              <div
                role="listbox"
                aria-label={isEs ? "Seleccionar experiencia" : "Select experience"}
                className="max-h-96 overflow-y-auto pr-1 [scrollbar-color:rgba(110,231,183,0.45)_rgba(255,255,255,0.08)] [scrollbar-width:thin]"
              >
                {tours.map((tour) => {
                  const isSelected = tour.slug === resolvedSlug;
                  return (
                    <button
                      key={tour.slug}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => {
                        setSlug(tour.slug);
                        tourMenuRef.current?.removeAttribute("open");
                      }}
                      className={[
                        "group flex min-h-20 w-full items-center justify-between gap-4 rounded-2xl px-4 py-4 text-left transition",
                        isSelected
                          ? "bg-emerald-300 text-emerald-950"
                          : "text-white hover:bg-white/[0.08]",
                      ].join(" ")}
                      >
                        <span className="min-w-0">
                        <span className="block truncate text-base font-black">
                          {tourTitle(tour, isEs)}
                        </span>
                        <span
                          className={[
                            "mt-1 block text-[11px] font-bold uppercase tracking-wide",
                            isSelected ? "text-emerald-950/70" : "text-white/45 group-hover:text-emerald-200/80",
                          ].join(" ")}
                        >
                          {tour.duration || (isEs ? "Experiencia local" : "Local experience")}
                        </span>
                      </span>
                      <span
                        className={[
                          "shrink-0 rounded-full px-3 py-1.5 text-xs font-black",
                          isSelected
                            ? "bg-emerald-950/10 text-emerald-950"
                            : "bg-white/[0.08] text-emerald-200",
                        ].join(" ")}
                      >
                        {formatTourPrice(tour, isEs)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </details>
          </div>

          <div>
            <span className="block text-[10px] font-bold uppercase tracking-widest text-emerald-200/80">
            {isEs ? "Personas" : "Guests"}
            </span>
            <div className="mt-3 flex h-20 items-center justify-between rounded-[1.35rem] border border-white/12 bg-white/[0.08] px-4">
            <button
              type="button"
              onClick={() => setPeople((p) => Math.max(1, p - 1))}
              aria-label={isEs ? "Menos personas" : "Fewer guests"}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 text-white/75 transition hover:border-emerald-300/50 hover:bg-emerald-300/10 hover:text-white"
            >
              <Minus size={16} />
            </button>
            <span className="min-w-[2rem] text-center text-3xl font-black tabular-nums text-white">
              {people}
            </span>
            <button
              type="button"
              onClick={() => setPeople((p) => Math.min(30, p + 1))}
              aria-label={isEs ? "Más personas" : "More guests"}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 text-white/75 transition hover:border-emerald-300/50 hover:bg-emerald-300/10 hover:text-white"
            >
              <Plus size={16} />
            </button>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleBook}
          className="group mt-7 flex h-16 w-full items-center justify-center gap-2 rounded-[1.35rem] bg-emerald-400 px-8 text-sm font-black uppercase tracking-wide text-emerald-950 shadow-[0_22px_55px_rgba(16,185,129,0.26)] transition-all hover:-translate-y-0.5 hover:bg-white"
        >
          {isEs ? "Ver fechas" : "See dates"}
          <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
        </button>

        {selectedTour?.duration && (
          <p className="mt-5 text-center text-sm font-semibold text-white/55">
            {selectedTour.duration}
            {selectedTour.difficulty ? ` - ${selectedTour.difficulty}` : ""}
          </p>
        )}
      </div>
    </aside>
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
    ? ["Seguridad primero", "Grupos pequeños", "Guías locales", "Río validado antes de salir"]
    : ["Safety first", "Small groups", "Local guides", "River checked before departure"];

  return (
    <section className="relative flex min-h-[92svh] flex-col overflow-hidden bg-stone-950">
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/50" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_48%,rgba(16,185,129,0.24),transparent_28%),linear-gradient(90deg,rgba(0,0,0,0.72),rgba(0,0,0,0.24)_48%,rgba(0,0,0,0.04))]" />
      </div>

      <div className="relative mx-auto flex w-full max-w-[1520px] flex-1 items-center px-4 pb-10 pt-24 sm:px-6 md:pb-12 md:pt-28 lg:px-8">
        <div className="grid w-full items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(430px,520px)] xl:gap-16">
        <div>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 backdrop-blur-md">
            <span className="flex items-center gap-0.5 text-amber-400">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={12} className="fill-current" />
              ))}
            </span>
            <span className="text-xs font-semibold text-white/90">
              4.9 - {isEs ? "+500 aventureros felices" : "+500 happy adventurers"}
            </span>
          </div>

          <h1 className="font-display max-w-5xl text-balance text-[clamp(3rem,6.5vw,6.6rem)] font-black leading-[0.9] tracking-tight text-white">
            {isEs ? (
              <>
                El cañón esmeralda <span className="text-emerald-300">te está esperando.</span>
              </>
            ) : (
              <>
                The emerald canyon <span className="text-emerald-300">is waiting for you.</span>
              </>
            )}
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/82 md:text-xl">
            {isEs
              ? "Canyoning, pozas cristalinas y cascadas escondidas en San Carlos. Tours de grupos pequeños, guías locales y reserva clara antes de bajar al río."
              : "Canyoning, crystal pools, and hidden waterfalls in San Carlos. Small-group tours, local guides, and clear booking before entering the river."}
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link
              href="/reservar"
              className="group inline-flex min-h-14 items-center gap-2 rounded-full bg-emerald-400 px-7 py-4 text-sm font-black uppercase tracking-wide text-emerald-950 shadow-[0_20px_55px_rgba(52,211,153,0.28)] transition-all hover:-translate-y-0.5 hover:bg-white"
            >
              {isEs ? "Reservar aventura" : "Book adventure"}
              <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <a
              href={WHATSAPP_HREF}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-14 items-center gap-2 rounded-full border border-white/25 bg-white/8 px-6 py-4 text-sm font-bold text-white backdrop-blur-md transition-all hover:border-white/50 hover:bg-white/14"
            >
              <ShieldCheck size={17} className="text-emerald-300" />
              {isEs ? "Hablar con un guía" : "Talk to a guide"}
            </a>
          </div>

          <div className="mt-5 hidden flex-wrap items-center gap-x-5 gap-y-2 sm:flex">
            {trustItems.map((item) => (
              <span key={item} className="flex items-center gap-1.5 text-xs font-medium text-white/70">
                <Check size={13} className="text-emerald-300" />
                {item}
              </span>
            ))}
          </div>
        </div>
        <div className="hidden justify-self-end lg:block">
          <BookingCard tours={tours} />
        </div>
        </div>
      </div>

      <div className="absolute bottom-7 right-4 z-10 hidden flex-col items-end gap-3 sm:right-8 md:flex">
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

      <div className="absolute bottom-7 left-1/2 z-10 hidden -translate-x-1/2 items-center gap-2 rounded-full border border-white/12 bg-black/20 px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-white/60 backdrop-blur-md lg:flex">
        <CalendarDays size={13} className="text-emerald-300" />
        {isEs ? "Cupos limitados por día" : "Limited daily spots"}
      </div>
    </section>
  );
}
