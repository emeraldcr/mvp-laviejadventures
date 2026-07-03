"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Camera,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  Expand,
  Mountain,
  ShoppingBag,
  Waves,
  X,
} from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import { translations } from "@/lib/translations";
import { SiteHeader, MobileBottomNav } from "@/app/components/navigation/SiteNavigation";

type Props = {
  images: string[];
};

const INITIAL_VISIBLE = 18;
const LOAD_MORE_STEP = 18;

// Cycle of aspect ratios so the masonry columns get an editorial rhythm
const ASPECTS = ["aspect-[3/4]", "aspect-square", "aspect-[4/3]", "aspect-[3/4]", "aspect-[4/5]", "aspect-square"];

export function GaleriaContent({ images }: Props) {
  const { lang } = useLanguage();
  const tr = translations[lang].gallery;
  const isEs = lang === "es";

  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const touchStartX = useRef<number | null>(null);

  const closeLightbox = useCallback(() => setLightboxIndex(null), []);

  const showPrev = useCallback(() => {
    setLightboxIndex((current) =>
      current === null ? null : (current - 1 + images.length) % images.length
    );
  }, [images.length]);

  const showNext = useCallback(() => {
    setLightboxIndex((current) =>
      current === null ? null : (current + 1) % images.length
    );
  }, [images.length]);

  useEffect(() => {
    if (lightboxIndex === null) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeLightbox();
      if (event.key === "ArrowLeft") showPrev();
      if (event.key === "ArrowRight") showNext();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [lightboxIndex, closeLightbox, showPrev, showNext]);

  const handleTouchStart = (event: React.TouchEvent) => {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const deltaX = (event.changedTouches[0]?.clientX ?? touchStartX.current) - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(deltaX) < 40) return;
    if (deltaX > 0) showPrev();
    else showNext();
  };

  const visibleImages = images.slice(0, visibleCount);
  const remaining = images.length - visibleCount;

  return (
    <main className="min-h-screen bg-[#030807] pb-24 text-white md:pb-10">
      <SiteHeader isScrolled />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-white/10 pt-14 md:pt-20">
        {images[0] && (
          <Image
            src={images[0]}
            alt={tr.title}
            fill
            sizes="100vw"
            className="object-cover opacity-25"
            priority
          />
        )}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,8,7,0.75),rgba(3,8,7,0.55)_55%,rgba(3,8,7,0.97))]" />
        <div className="relative mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200/25 bg-emerald-300/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.22em] text-emerald-100">
            <Camera className="h-3.5 w-3.5" aria-hidden />
            {isEs ? "Momentos reales" : "Real moments"}
          </span>
          <h1 className="mt-4 max-w-2xl text-balance text-3xl font-black leading-tight md:text-5xl">
            {tr.title}
          </h1>
          <p className="mt-3 max-w-2xl text-sm font-semibold leading-relaxed text-white/70 md:text-base">
            {tr.description}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-wider">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/35 px-3 py-1.5 text-white/75">
              <Camera className="h-3.5 w-3.5 text-emerald-200" aria-hidden />
              {images.length} {isEs ? "fotos" : "photos"}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/35 px-3 py-1.5 text-white/75">
              <Mountain className="h-3.5 w-3.5 text-emerald-200" aria-hidden />
              {isEs ? "Cañón de 180 m" : "180 m canyon"}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/35 px-3 py-1.5 text-white/75">
              <Waves className="h-3.5 w-3.5 text-emerald-200" aria-hidden />
              {isEs ? "Río La Vieja" : "La Vieja River"}
            </span>
            <Link
              href="/reservar"
              className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/40 bg-emerald-400/15 px-3.5 py-1.5 font-black text-emerald-100 transition hover:bg-emerald-400/25 hover:text-white"
            >
              <CalendarCheck className="h-3.5 w-3.5" aria-hidden />
              {isEs ? "Reservar ahora" : "Book now"}
            </Link>
          </div>
        </div>
      </section>

      {/* Masonry grid */}
      <section className="mx-auto max-w-7xl px-3 py-6 md:px-8 md:py-10">
        <div className="columns-2 gap-3 sm:columns-3 md:gap-4 lg:columns-4">
          {visibleImages.map((src, index) => (
            <button
              key={src}
              type="button"
              onClick={() => setLightboxIndex(index)}
              className={`group relative mb-3 block w-full overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.03] outline-none transition-all focus-visible:ring-2 focus-visible:ring-emerald-300 md:mb-4 ${ASPECTS[index % ASPECTS.length]}`}
              aria-label={`${isEs ? "Ver foto" : "View photo"} ${index + 1} ${isEs ? "de" : "of"} ${images.length}`}
            >
              <Image
                src={src}
                alt={`La Vieja Adventures ${index + 1}`}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                loading={index < 6 ? "eager" : "lazy"}
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between px-3 pb-2.5 opacity-0 transition-all duration-300 group-hover:opacity-100">
                <span className="text-[11px] font-black uppercase tracking-wider text-white/90">
                  {index + 1} / {images.length}
                </span>
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur">
                  <Expand className="h-3.5 w-3.5" aria-hidden />
                </span>
              </div>
            </button>
          ))}
        </div>

        {remaining > 0 && (
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setVisibleCount((count) => count + LOAD_MORE_STEP)}
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-emerald-300/35 bg-emerald-400/10 px-6 py-2.5 text-sm font-black text-emerald-100 transition hover:-translate-y-0.5 hover:bg-emerald-400/20 hover:text-white"
            >
              {isEs ? `Ver más fotos (${remaining})` : `See more photos (${remaining})`}
            </button>
          </div>
        )}

        {/* CTA */}
        <div className="mt-10 rounded-3xl border border-emerald-500/20 bg-emerald-500/[0.07] px-5 py-7 text-center shadow-[0_20px_60px_rgba(0,0,0,0.35)] md:py-9">
          <h2 className="text-xl font-black md:text-2xl">
            {isEs ? "¿Querés vivirlo en persona?" : "Want to live it in person?"}
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm font-semibold text-white/65">
            {isEs
              ? "Elegí una fecha y te llevamos a Ciudad Esmeralda."
              : "Pick a date and we'll take you to Ciudad Esmeralda."}
          </p>
          <div className="mt-4 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/reservar"
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-emerald-500 px-7 py-2.5 font-black text-emerald-950 shadow-lg shadow-emerald-900/30 transition hover:-translate-y-0.5 hover:bg-emerald-400"
            >
              <CalendarCheck className="h-4 w-4" aria-hidden />
              {isEs ? "Reservar mi aventura" : "Book my adventure"}
            </Link>
            <Link
              href="/store"
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-emerald-300/35 bg-emerald-400/10 px-7 py-2.5 font-black text-emerald-100 transition hover:-translate-y-0.5 hover:bg-emerald-400/20 hover:text-white"
            >
              <ShoppingBag className="h-4 w-4" aria-hidden />
              {isEs ? "Equipate en la tienda" : "Gear up at the store"}
            </Link>
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/95 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={tr.title}
          onClick={closeLightbox}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className="relative h-[80vh] w-[94vw] max-w-6xl md:h-[86vh]"
            onClick={(event) => event.stopPropagation()}
          >
            <Image
              src={images[lightboxIndex]}
              alt={`La Vieja Adventures ${lightboxIndex + 1}`}
              fill
              sizes="94vw"
              className="object-contain"
              priority
            />
          </div>

          {/* Preload neighbors */}
          <div className="hidden">
            <Image src={images[(lightboxIndex + 1) % images.length]} alt="" width={16} height={16} />
            <Image src={images[(lightboxIndex - 1 + images.length) % images.length]} alt="" width={16} height={16} />
          </div>

          <button
            type="button"
            onClick={closeLightbox}
            className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur transition hover:bg-white/20 md:right-5 md:top-5"
            aria-label={isEs ? "Cerrar" : "Close"}
          >
            <X className="h-5 w-5" aria-hidden />
          </button>

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              showPrev();
            }}
            className="absolute left-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur transition hover:bg-white/20 md:left-5 md:h-12 md:w-12"
            aria-label={isEs ? "Foto anterior" : "Previous photo"}
          >
            <ChevronLeft className="h-6 w-6" aria-hidden />
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              showNext();
            }}
            className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur transition hover:bg-white/20 md:right-5 md:h-12 md:w-12"
            aria-label={isEs ? "Foto siguiente" : "Next photo"}
          >
            <ChevronRight className="h-6 w-6" aria-hidden />
          </button>

          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-3 rounded-full border border-white/15 bg-black/60 px-4 py-1.5 text-xs font-black tracking-wider text-white/85 backdrop-blur">
            <span>{lightboxIndex + 1} / {images.length}</span>
            <span className="hidden text-white/40 sm:inline">·</span>
            <span className="hidden font-semibold text-white/55 sm:inline">
              {isEs ? "Usá ← → o deslizá" : "Use ← → or swipe"}
            </span>
          </div>
        </div>
      )}

      <MobileBottomNav />
    </main>
  );
}
