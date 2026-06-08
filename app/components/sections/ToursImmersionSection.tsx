"use client";

import React, { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import { useReservationData } from "@/lib/hooks/useReservationData";
import TourSelectionCards from "@/app/components/tours/TourSelectionCards";
import { principalContent } from "@/lib/constants/principal";

type Props = {
  onSelectTour: (slug: string) => void;
  selectedTourSlug?: string | null;
};

export default function ToursImmersionSection({
  onSelectTour,
  selectedTourSlug,
}: Props) {
  const { lang } = useLanguage();
  const { tours } = useReservationData();
  const copy = principalContent[lang].tours;

  const carouselRef = useRef<HTMLDivElement | null>(null);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);

  const updateCarouselState = () => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    const maxScrollLeft = carousel.scrollWidth - carousel.clientWidth;
    const currentScrollLeft = carousel.scrollLeft;

    setCanScrollLeft(currentScrollLeft > 8);
    setCanScrollRight(currentScrollLeft < maxScrollLeft - 8);

    const progress =
      maxScrollLeft > 0 ? (currentScrollLeft / maxScrollLeft) * 100 : 0;

    setScrollProgress(Math.min(100, Math.max(0, progress)));

    const firstCard = carousel.querySelector<HTMLElement>("[data-carousel-card]");
    if (!firstCard) return;

    const cardWidth = firstCard.offsetWidth;
    const gap = 20;
    const index = Math.round(currentScrollLeft / (cardWidth + gap));

    setActiveIndex(Math.min(Math.max(index, 0), tours.length - 1));
  };

  const scrollCarousel = (direction: "left" | "right") => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    const firstCard = carousel.querySelector<HTMLElement>("[data-carousel-card]");
    const cardWidth = firstCard?.offsetWidth ?? carousel.clientWidth * 0.85;
    const gap = 20;

    carousel.scrollBy({
      left: direction === "left" ? -(cardWidth + gap) : cardWidth + gap,
      behavior: "smooth",
    });
  };

  const scrollToIndex = (index: number) => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    const firstCard = carousel.querySelector<HTMLElement>("[data-carousel-card]");
    const cardWidth = firstCard?.offsetWidth ?? carousel.clientWidth * 0.85;
    const gap = 20;

    carousel.scrollTo({
      left: index * (cardWidth + gap),
      behavior: "smooth",
    });
  };

  useEffect(() => {
    updateCarouselState();

    const carousel = carouselRef.current;
    if (!carousel) return;

    const handleScroll = () => updateCarouselState();
    const handleResize = () => updateCarouselState();

    carousel.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize);

    return () => {
      carousel.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, [tours.length]);

  return (
    <section
      id="tours"
      className="relative overflow-hidden bg-black pb-12 pt-6 md:pb-16 md:pt-8"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.14),transparent_55%)]" />

      <div className="container relative mx-auto px-4 md:px-8">
        <div className="mx-auto mb-7 max-w-3xl text-center md:mb-10">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.32em] text-cyan-300 md:text-[11px]">
            {copy.eyebrow}
          </p>

          <h2 className="text-3xl font-black leading-tight text-white md:text-5xl">
            {copy.title}
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-white/55 md:text-base">
            Explora nuestras experiencias y desliza para elegir tu próxima
            aventura.
          </p>
        </div>

        <div className="relative">
          <button
            type="button"
            aria-label="Ver experiencias anteriores"
            onClick={() => scrollCarousel("left")}
            disabled={!canScrollLeft}
            className="
              absolute left-2 top-1/2 z-30 hidden h-12 w-12 -translate-y-1/2
              items-center justify-center rounded-full border border-white/15
              bg-black/75 text-white shadow-2xl backdrop-blur-md transition
              hover:border-cyan-300 hover:bg-cyan-300 hover:text-black
              disabled:pointer-events-none disabled:opacity-25
              lg:flex xl:-left-2
            "
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          <div className="pointer-events-none absolute bottom-5 left-0 top-0 z-20 hidden w-20 bg-gradient-to-r from-black via-black/80 to-transparent lg:block" />
          <div className="pointer-events-none absolute bottom-5 right-0 top-0 z-20 hidden w-20 bg-gradient-to-l from-black via-black/80 to-transparent lg:block" />

          <div
            ref={carouselRef}
            className="
              overflow-x-auto scroll-smooth pb-5
              [-ms-overflow-style:none] [scrollbar-width:none]
              [&::-webkit-scrollbar]:hidden

              [&>div]:!flex
              [&>div]:!grid-cols-none
              [&>div]:!gap-5
              [&>div]:!overflow-visible
              [&>div]:!pr-4
              [&>div]:!snap-x
              [&>div]:!snap-mandatory

              [&>div>*]:!min-w-[84vw]
              [&>div>*]:!max-w-[84vw]
              [&>div>*]:!shrink-0
              [&>div>*]:!snap-center

              sm:[&>div>*]:!min-w-[420px]
              sm:[&>div>*]:!max-w-[420px]

              md:[&>div>*]:!min-w-[455px]
              md:[&>div>*]:!max-w-[455px]

              lg:[&>div>*]:!min-w-[465px]
              lg:[&>div>*]:!max-w-[465px]

              xl:[&>div>*]:!min-w-[31.8%]
              xl:[&>div>*]:!max-w-[31.8%]

              2xl:[&>div>*]:!min-w-[31.9%]
              2xl:[&>div>*]:!max-w-[31.9%]
            "
          >
            <div className="contents">
              {/*
                Este wrapper invisible permite asignar data-carousel-card
                a cada card sin modificar TourSelectionCards directamente.
                Si TourSelectionCards ya renderiza todas las cards dentro
                de su propio grid, puedes usar la versión alternativa abajo.
              */}
            </div>

            <TourSelectionCards
              tours={tours}
              onSelectTour={onSelectTour}
              selectedTourSlug={selectedTourSlug}
            />
          </div>

          <button
            type="button"
            aria-label="Ver más experiencias"
            onClick={() => scrollCarousel("right")}
            disabled={!canScrollRight}
            className="
              absolute right-2 top-1/2 z-30 hidden h-12 w-12 -translate-y-1/2
              items-center justify-center rounded-full border border-white/15
              bg-black/75 text-white shadow-2xl backdrop-blur-md transition
              hover:border-cyan-300 hover:bg-cyan-300 hover:text-black
              disabled:pointer-events-none disabled:opacity-25
              lg:flex xl:-right-2
            "
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>

        <div className="mt-1 flex items-center justify-center gap-3 md:mt-2">
          <div className="h-1.5 w-28 overflow-hidden rounded-full bg-white/10 md:w-40">
            <div
              className="h-full rounded-full bg-cyan-300 transition-all duration-300"
              style={{ width: `${scrollProgress}%` }}
            />
          </div>

          <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/35 md:hidden">
            Desliza
          </span>
        </div>

        <div className="mt-5 flex justify-center gap-2">
          {tours.map((tour, index) => (
            <button
              key={tour.slug ?? index}
              type="button"
              aria-label={`Ir a experiencia ${index + 1}`}
              onClick={() => scrollToIndex(index)}
              className={`
                h-2 rounded-full transition-all duration-300
                ${
                  activeIndex === index
                    ? "w-7 bg-cyan-300"
                    : "w-2 bg-white/20 hover:bg-white/40"
                }
              `}
            />
          ))}
        </div>
      </div>
    </section>
  );
}