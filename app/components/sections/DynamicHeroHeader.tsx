"use client";

import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  memo,
  type ReactNode,
} from "react";
import Image from "next/image";
import {
  ArrowRight,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  MapPin,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import Link from "next/link";
import useSWR from "swr";
import { fetcher } from "@/lib/helpers/fetcher";
import { useInterval } from "@/lib/hooks/useInterval";
import { useLanguage } from "@/lib/LanguageContext";
import { principalContent } from "@/lib/constants/principal";
import { MobileBottomNav, SiteHeader } from "@/app/components/navigation/SiteNavigation";
import { useReservationData } from "@/lib/hooks/useReservationData";
import { getTourImage } from "@/lib/tour-display";
import type { TourSummary } from "@/lib/types/index";

// ─── Constants ────────────────────────────────────────────────────────────────
const SCROLL_THRESHOLD = 60;
const SLIDE_DURATION = 5000;
const GALLERY_STRIP = [
  "/image/IMG_6810.jpg", "/image/IMG_6812.jpg", "/image/IMG_4671.jpg",
  "/image/IMG_4257.jpg", "/image/IMG_6813.jpg", "/image/IMG_4197.jpg",
  "/image/IMG_3698.jpg", "/image/IMG_4943.jpg", "/image/IMG_5585.jpg",
  "/image/IMG_4522.jpg", "/image/IMG_6814.jpg", "/image/IMG_4200.jpg",
  "/image/IMG_3705.jpg", "/image/IMG_4917.jpg", "/image/IMG_4672.jpg",
  "/image/IMG_6809.jpg", "/image/IMG_6806.jpg", "/image/IMG_6811.jpg",
  "/image/IMG_4523.jpg", "/image/IMG_4210.jpg", "/image/IMG_3751.jpg",
  "/image/IMG_2439.jpg", "/image/IMG_2443.jpg", "/image/IMG_4514.jpg",
  "/image/IMG_6805.jpg", "/image/IMG_4376.jpg", "/image/IMG_4389.jpg",
  "/image/IMG_4575.jpg", "/image/IMG_3920.jpg", "/image/IMG_5592.jpg",
];

// ─── Scroll hook ──────────────────────────────────────────────────────────────
const useScrollY = () => {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    let rafId: number;
    const handleScroll = () => {
      rafId = requestAnimationFrame(() => setScrollY(window.scrollY));
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);
  return scrollY;
};

// ─── HeroBookingWidget ────────────────────────────────────────────────────────
const HeroBookingWidget = memo<{ onSelectTour?: (slug: string) => void }>(
  ({ onSelectTour }) => {
    const { lang } = useLanguage();
    const { tours } = useReservationData();
    const [selectedSlug, setSelectedSlug] = useState(tours[0]?.slug ?? "");
    const [people, setPeople] = useState(2);

    const resolvedSelectedSlug = selectedSlug || tours[0]?.slug || "";
    const selectedTour = tours.find((t) => t.slug === resolvedSelectedSlug) ?? tours[0];
    const minPrice = selectedTour?.packages?.[0]?.price ?? null;
    const isEs = lang === "es";

    const handleBook = () => {
      const slug = resolvedSelectedSlug || tours[0]?.slug;
      if (!slug) return;
      if (onSelectTour) {
        onSelectTour(slug);
      } else {
        window.location.href = `/reservar?tour=${encodeURIComponent(slug)}`;
      }
    };

    return (
      <div className="mt-8 w-full max-w-[44rem] sm:mt-10">
        <div className="overflow-hidden rounded-2xl border border-white/20 bg-black/50 shadow-[0_28px_80px_rgba(0,0,0,0.65)] backdrop-blur-2xl">
          <div className="flex flex-col divide-y divide-white/10 sm:flex-row sm:divide-x sm:divide-y-0">

            {/* Tour selector */}
            <div className="flex-1 min-w-0 px-5 py-4">
              <p className="mb-1 text-[9px] font-black uppercase tracking-[0.25em] text-teal-400/70">
                {isEs ? "Tour" : "Tour"}
              </p>
              <div className="relative">
                <select
                  value={resolvedSelectedSlug}
                  onChange={(e) => setSelectedSlug(e.target.value)}
                  className="w-full appearance-none bg-transparent pr-5 text-sm font-bold text-white focus:outline-none cursor-pointer"
                >
                  {tours.map((t) => (
                    <option key={t.slug} value={t.slug} className="bg-zinc-900 font-normal text-white">
                      {isEs ? t.titleEs : t.titleEn}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={13}
                  className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-white/40"
                />
              </div>
              {minPrice != null && (
                <p className="mt-0.5 text-[10px] text-white/40">
                  {isEs ? `Desde $${minPrice}` : `From $${minPrice}`}
                </p>
              )}
            </div>

            {/* Participants */}
            <div className="px-5 py-4 sm:min-w-[190px]">
              <p className="mb-1 text-[9px] font-black uppercase tracking-[0.25em] text-teal-400/70">
                {isEs ? "Participantes" : "People"}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPeople((p) => Math.max(1, p - 1))}
                  className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-white/20 text-sm font-bold text-white transition hover:border-white/50 hover:bg-white/10"
                >
                  −
                </button>
                <span className="min-w-[7rem] text-center text-sm font-bold text-white">
                  {people}{" "}
                  {isEs
                    ? people === 1 ? "persona" : "personas"
                    : people === 1 ? "person" : "people"}
                </span>
                <button
                  type="button"
                  onClick={() => setPeople((p) => Math.min(30, p + 1))}
                  className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-white/20 text-sm font-bold text-white transition hover:border-white/50 hover:bg-white/10"
                >
                  +
                </button>
              </div>
            </div>

            {/* Book button */}
            <button
              type="button"
              onClick={handleBook}
              className="group flex items-center justify-center gap-2 bg-teal-500 px-7 py-5 text-sm font-black text-white transition-all duration-200 hover:bg-teal-400 sm:min-w-[170px] sm:text-base"
            >
              <span>{isEs ? "Reservar Ahora" : "Book Now"}</span>
              <span className="inline-block transition-transform duration-150 group-hover:translate-x-1">→</span>
            </button>
          </div>
        </div>
      </div>
    );
  }
);
HeroBookingWidget.displayName = "HeroBookingWidget";

const getLowestPackagePrice = (tour?: TourSummary | null) => {
  const packagePrices = (tour?.packages ?? [])
    .map((option) => option.price)
    .filter((price): price is number => typeof price === "number" && price > 0);

  if (packagePrices.length > 0) return Math.min(...packagePrices);
  return typeof tour?.priceCRC === "number" ? tour.priceCRC : null;
};

const formatTourPrice = (tour: TourSummary | undefined, isEs: boolean) => {
  const price = getLowestPackagePrice(tour);
  if (price == null) return isEs ? "Consultar" : "Ask";
  if (price > 1000) {
    return new Intl.NumberFormat(isEs ? "es-CR" : "en-US", {
      style: "currency",
      currency: "CRC",
      maximumFractionDigits: 0,
    }).format(price);
  }
  return `$${price}`;
};

const getPriceLabel = (tour: TourSummary | undefined, isEs: boolean) => ({
  prefix: isEs ? "Desde" : "From",
  value: formatTourPrice(tour, isEs),
  suffix: isEs ? "por persona" : "per person",
});

const getTourTitle = (tour: TourSummary, isEs: boolean) => (isEs ? tour.titleEs : tour.titleEn);

// ─── HeroCarousel ─────────────────────────────────────────────────────────────
interface HeroCarouselProps {
  overlay?: ReactNode;
  height?: string;
  onSelectTour?: (slug: string) => void;
}

export const HeroCarousel: React.FC<HeroCarouselProps> = ({ overlay, height = "100%", onSelectTour }) => {
  const { data: carouselImages = [], error, isLoading } = useSWR<string[]>("/api/images", fetcher);
  const { lang } = useLanguage();
  const copy = principalContent[lang].hero;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const parallaxImageRef = useRef<HTMLDivElement>(null);
  const parallaxOverlayRef = useRef<HTMLDivElement>(null);

  useInterval(() => {
    if (!paused && carouselImages.length > 0)
      setCurrentIndex((prev) => (prev + 1) % carouselImages.length);
  }, SLIDE_DURATION);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const IMG_SPEED = -0.15;
    let ticking = false;
    const update = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const sy = window.scrollY;
          if (parallaxImageRef.current)
            parallaxImageRef.current.style.transform = `translate3d(0,${sy * IMG_SPEED}px,0)`;
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  const goTo = useCallback((idx: number) => setCurrentIndex(idx), []);
  const goPrev = useCallback(
    () => setCurrentIndex((p) => (p - 1 + carouselImages.length) % carouselImages.length),
    [carouselImages.length]
  );
  const goNext = useCallback(
    () => setCurrentIndex((p) => (p + 1) % carouselImages.length),
    [carouselImages.length]
  );

  if (error)
    return (
      <div className="flex items-center justify-center bg-zinc-950 text-red-400 text-sm" style={{ height }}>
        {copy.errorLoadingImages}
      </div>
    );

  if (isLoading || carouselImages.length === 0)
    return (
      <div className="flex items-center justify-center bg-zinc-950" style={{ height }}>
        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );

  return (
    <section
      className="relative w-full overflow-hidden select-none"
      style={{ height }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Images */}
      <div ref={parallaxImageRef} className="absolute inset-0 will-change-transform z-0">
        {carouselImages.map((src, index) => (
          <Image
            key={index}
            src={src}
            alt={`La Vieja Adventures ${index + 1}`}
            fill
            className={`object-cover transition-opacity duration-1000 ease-in-out ${
              index === currentIndex ? "opacity-100" : "opacity-0"
            }`}
            priority={index < 3}
            sizes="100vw"
          />
        ))}
      </div>

      {/* Gradient overlays */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/25 to-black/90" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20" />
        <div className="absolute inset-x-0 bottom-0 h-[46%] bg-gradient-to-t from-black/95 via-black/65 to-transparent" />
      </div>

      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 z-30 h-[3px] bg-white/10">
        <div
          key={`${currentIndex}-${paused ? "paused" : "playing"}`}
          className="h-full bg-gradient-to-r from-teal-500 to-teal-300"
          style={{
            animation: `lva-progress ${SLIDE_DURATION}ms linear forwards`,
            animationPlayState: paused ? "paused" : "running",
          }}
        />
      </div>

      {/* Prev / Next arrows — hidden on mobile to reduce clutter */}
      <button
        onClick={goPrev}
        className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 md:w-11 md:h-11 rounded-full bg-black/30 border border-white/15 backdrop-blur-sm hidden md:flex items-center justify-center text-white hover:bg-teal-500/30 hover:border-teal-400/50 transition-all duration-200"
        aria-label={copy.previousImageAria}
      >
        <ChevronLeft size={18} />
      </button>
      <button
        onClick={goNext}
        className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 md:w-11 md:h-11 rounded-full bg-black/30 border border-white/15 backdrop-blur-sm hidden md:flex items-center justify-center text-white hover:bg-teal-500/30 hover:border-teal-400/50 transition-all duration-200"
        aria-label={copy.nextImageAria}
      >
        <ChevronRight size={18} />
      </button>

      {/* Main text overlay */}
      <div
        ref={parallaxOverlayRef}
        className="relative z-20 flex h-full w-full items-center justify-center px-5 text-center pt-20 pb-44 sm:pt-28 sm:pb-48 md:pt-32 md:pb-44 md:px-8 will-change-transform"
      >
        <div className="mx-auto flex max-w-5xl flex-col items-center">
          {overlay || (
            <>
              {/* Social proof pill */}
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-300/30 bg-amber-500/[0.12] px-4 py-1.5 backdrop-blur-md sm:mb-5">
                <span className="text-amber-400 text-xs leading-none">★★★★★</span>
                <span className="text-[10px] font-bold text-white/90 sm:text-[11px]">{copy.socialProof}</span>
              </div>

              {/* Location badge */}
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/25 px-4 py-1.5 backdrop-blur-md sm:mb-5">
                <span className="h-1.5 w-1.5 rounded-full bg-teal-400 shadow-[0_0_16px_rgba(45,212,191,0.85)]" />
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/85 sm:text-[11px]">
                  {copy.locationBadge}
                </span>
              </div>

              {/* Title */}
              <h1 className="max-w-4xl text-balance font-black leading-[0.92] text-white drop-shadow-2xl text-[clamp(2.6rem,8vw,6.5rem)]">
                {copy.title}
              </h1>

              {/* Subtitle with price anchor */}
              <p className="mt-4 max-w-2xl text-balance font-semibold leading-snug text-white/90 drop-shadow-xl sm:mt-5 text-[clamp(1.05rem,2.5vw,1.45rem)]">
                {copy.subtitle}
              </p>

              {/* Booking widget */}
              <HeroBookingWidget onSelectTour={onSelectTour} />

              {/* Trust row */}
              <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5">
                {copy.trustItems.map((item, i) => (
                  <span key={i} className="flex items-center gap-1.5 text-[11px] font-medium text-white/55 sm:text-xs">
                    <span className="font-black text-teal-400">✓</span>
                    {item}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Bottom controls — shifted up on mobile to clear the bottom nav */}
      <div className="absolute inset-x-0 z-30 flex flex-col items-center gap-2.5 px-4 bottom-20 md:bottom-6">
        {/* Dot indicators */}
        <div className="flex max-w-[min(82vw,44rem)] items-center gap-1.5 overflow-hidden rounded-full border border-white/10 bg-black/28 px-3 py-1.5 shadow-[0_12px_30px_rgba(0,0,0,0.28)] backdrop-blur-md md:gap-2 md:py-2">
          {carouselImages.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goTo(idx)}
              className={`h-1.5 shrink-0 rounded-full transition-all duration-300 ${
                idx === currentIndex
                  ? "w-6 bg-teal-400 shadow-[0_0_12px_rgba(45,212,191,0.7)] md:w-8"
                  : "w-1.5 bg-white/36 hover:bg-white/65"
              }`}
              aria-label={copy.goToSlideAria.replace("{slide}", String(idx + 1))}
            />
          ))}
        </div>

        {/* Counter */}
        <span className="rounded-full bg-black/18 px-2 py-0.5 text-[10px] font-semibold tabular-nums tracking-widest text-white/50 backdrop-blur-sm">
          {String(currentIndex + 1).padStart(2, "0")} / {String(carouselImages.length).padStart(2, "0")}
        </span>

        {/* Scroll arrow — desktop only */}
        <a
          href="#tours"
          className="hidden md:flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white/70 shadow-[0_12px_32px_rgba(0,0,0,0.25)] backdrop-blur-md transition-colors hover:bg-white/18"
          aria-label={copy.scrollToToursAria}
        >
          <ChevronDown size={20} />
        </a>
      </div>

      <style jsx>{`
        @keyframes lva-progress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </section>
  );
};

// ─── DynamicHeroHeader ────────────────────────────────────────────────────────
const HeroCommandCenter: React.FC<Pick<HeroCarouselProps, "height" | "onSelectTour">> = ({
  height = "100%",
  onSelectTour,
}) => {
  const { lang } = useLanguage();
  const { tours } = useReservationData();
  const isEs = lang === "es";
  const [activeSlug, setActiveSlug] = useState(tours[0]?.slug ?? "");

  const activeTour = useMemo(
    () => tours.find((tour) => tour.slug === activeSlug) ?? tours[0],
    [activeSlug, tours]
  );

  const activeImage = getTourImage(activeTour?.slug);
  const handleBook = useCallback(
    (slug = activeTour?.slug) => {
      if (!slug) return;
      if (onSelectTour) {
        onSelectTour(slug);
      } else {
        window.location.href = `/reservar?tour=${encodeURIComponent(slug)}`;
      }
    },
    [activeTour?.slug, onSelectTour]
  );

  if (!activeTour) {
    return (
      <section className="flex w-full items-center justify-center bg-zinc-950 text-white" style={{ height }}>
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-teal-400 border-t-transparent" />
      </section>
    );
  }

  return (
    <section className="relative w-full overflow-visible bg-[#03080c] text-white md:overflow-hidden" style={{ height }}>
      <Image
        key={activeImage}
        src={activeImage}
        alt={getTourTitle(activeTour, isEs)}
        fill
        priority
        sizes="100vw"
        className="scale-105 object-cover opacity-50 transition-opacity duration-500"
      />
      <div className="absolute inset-0 bg-[linear-gradient(105deg,rgba(2,8,7,0.98),rgba(2,8,7,0.80)_43%,rgba(2,8,7,0.35)),linear-gradient(180deg,rgba(2,8,7,0.70),rgba(2,8,7,0.18)_42%,rgba(2,8,7,0.98))]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_68%_28%,rgba(16,185,129,0.28),transparent_34%),linear-gradient(rgba(94,234,212,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(94,234,212,0.04)_1px,transparent_1px)] bg-[size:auto,72px_72px,72px_72px]" />

      <div className="relative z-10 mx-auto min-h-screen max-w-[96rem] px-4 pb-28 pt-24 md:px-8 md:pb-8 md:pt-24 lg:grid lg:h-full lg:min-h-0 lg:grid-cols-[minmax(0,0.98fr)_minmax(430px,1.02fr)] lg:items-start lg:gap-7">

        {/* LEFT: Compact title + Tour catalog */}
        <div className="flex flex-col">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-100/25 bg-black/32 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.24em] text-teal-50 backdrop-blur-xl">
              <Sparkles size={13} className="text-amber-300" />
              {isEs ? "Tours reales · San Carlos" : "Real tours · San Carlos"}
            </div>
            <div className="hidden items-center gap-2 rounded-full border border-white/12 bg-black/28 px-3 py-1.5 text-[11px] font-semibold text-white/70 backdrop-blur-xl sm:flex">
              <ShieldCheck size={14} className="text-teal-200" />
              {isEs ? "Guías locales | Reserva inmediata" : "Local guides | Instant booking"}
            </div>
          </div>

          <h1 className="mb-2 max-w-3xl text-balance font-black leading-[0.9] text-white text-[clamp(2rem,12vw,3.45rem)] md:text-[clamp(2.25rem,3.6vw,3.45rem)]">
            {isEs ? "Baje al canon. Elija la aventura." : "Step into the canyon. Choose the adventure."}
          </h1>
          <p className="mb-3 max-w-2xl text-sm font-semibold leading-relaxed text-white/68 sm:text-base lg:mb-4">
            {isEs
              ? "Fotos grandes, agua esmeralda y rutas reales de San Carlos. Toque una experiencia y vea cual le hace ojitos, mae."
              : "Large photos, emerald water, and real San Carlos routes. Tap an experience and find the one that calls you."}
          </p>

          <div className="grid gap-2 pb-2 pr-1 [scrollbar-color:rgba(94,234,212,0.35)_rgba(15,23,42,0.5)] [scrollbar-width:thin] sm:grid-cols-2 lg:max-h-[42vh] lg:overflow-y-auto xl:max-h-none">
            {tours.map((tour, index) => {
              const active = tour.slug === activeTour.slug;
              const price = getPriceLabel(tour, isEs);
              return (
                <button
                  key={tour.slug}
                  type="button"
                  onClick={() => setActiveSlug(tour.slug)}
                  onDoubleClick={() => handleBook(tour.slug)}
                  className={[
                    "group grid min-h-[70px] w-full grid-cols-[50px_minmax(0,1fr)] items-center gap-2 rounded-[10px] border p-2 text-left shadow-[0_16px_42px_rgba(0,0,0,0.24)] transition-all duration-300 hover:-translate-y-0.5",
                    active
                      ? "border-emerald-100/70 bg-emerald-300/14 shadow-[0_0_34px_rgba(16,185,129,0.18)]"
                      : "border-white/10 bg-black/28 hover:border-emerald-200/45 hover:bg-white/[0.08]",
                  ].join(" ")}
                >
                  <span className="relative h-12 w-12 overflow-hidden rounded-[8px] border border-white/12 bg-black/30">
                    <Image
                      src={getTourImage(tour.slug)}
                      alt={getTourTitle(tour, isEs)}
                      fill
                      sizes="80px"
                      className="object-cover transition duration-300 group-hover:scale-105"
                    />
                    <span className="absolute left-1 top-1 rounded-full bg-black/65 px-1.5 py-0.5 text-[9px] font-black text-white/85">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-black leading-tight text-white">
                      {getTourTitle(tour, isEs)}
                    </span>
                    <span className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0 text-[10px] leading-tight text-white/55">
                      {tour.duration && (
                        <span className="inline-flex items-center gap-1">
                          <Clock3 size={11} />
                          {tour.duration}
                        </span>
                      )}
                      {tour.difficulty && (
                        <span className="inline-flex items-center gap-1">
                          <Zap size={11} />
                          {tour.difficulty}
                        </span>
                      )}
                      {tour.location && (
                        <span className="hidden items-center gap-1 truncate">
                          <MapPin size={11} />
                          {tour.location.split("-")[0].trim()}
                        </span>
                      )}
                    </span>
                    <span className="mt-0.5 inline-flex rounded-full border border-amber-200/20 bg-black/28 px-2 py-0.5 text-[10px] font-black text-amber-100">
                      {price.prefix} {price.value}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT: Selected tour detail card (desktop only) */}
        <div className="hidden lg:flex lg:flex-col lg:justify-start">
          <div className="flex max-h-[calc(100vh-7rem)] flex-col overflow-hidden rounded-[14px] border border-emerald-100/20 bg-black/50 shadow-[0_36px_100px_rgba(0,0,0,0.62)] backdrop-blur-2xl">
            <div className="relative h-[42vh] min-h-[300px] w-full overflow-hidden">
              <Image
                key={activeImage}
                src={activeImage}
                alt={getTourTitle(activeTour, isEs)}
                fill
                sizes="560px"
                className="object-cover transition-opacity duration-500"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.02),rgba(0,0,0,0.18)_42%,rgba(0,0,0,0.92)),radial-gradient(circle_at_58%_12%,rgba(52,211,153,0.24),transparent_38%)]" />
              {(isEs ? activeTour.tagEs : activeTour.tagEn) && (
                <span className="absolute left-4 top-4 inline-flex items-center rounded-full border border-amber-300/30 bg-amber-300/15 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-amber-200 backdrop-blur-sm">
                  {isEs ? activeTour.tagEs : activeTour.tagEn}
                </span>
              )}
              <div className="absolute bottom-0 left-0 right-0 px-6 pb-5">
                <h2 className="max-w-lg text-3xl font-black leading-[0.95] text-white drop-shadow-2xl xl:text-4xl">
                  {getTourTitle(activeTour, isEs)}
                </h2>
              </div>
            </div>

            <div className="flex flex-col gap-3 overflow-y-auto p-4 [scrollbar-width:thin] xl:p-5">
              <div className="grid grid-cols-3 gap-2">
                {[
                  { Icon: Clock3, label: isEs ? "Duración" : "Duration", value: activeTour.duration || "3-4h" },
                  { Icon: Zap, label: isEs ? "Nivel" : "Level", value: activeTour.difficulty || (isEs ? "Intermedio" : "Intermediate") },
                  { Icon: MapPin, label: isEs ? "Zona" : "Zone", value: activeTour.location?.split("-")[0]?.trim() || "San Carlos" },
                ].map(({ Icon, label, value }) => (
                  <div key={label} className="rounded-[8px] border border-white/10 bg-white/[0.055] p-2.5">
                    <Icon size={13} className="mb-1.5 text-teal-300" />
                    <p className="text-[9px] font-black uppercase tracking-wider text-white/40">{label}</p>
                    <p className="mt-0.5 truncate text-xs font-black text-white">{value}</p>
                  </div>
                ))}
              </div>

              <p className="line-clamp-3 text-sm font-medium leading-relaxed text-white/68 xl:text-base">
                {(isEs ? activeTour.descriptionEs : activeTour.descriptionEn) ||
                  (isEs
                    ? "Aventura guiada con naturaleza real, agua cristalina y rutas locales certificadas."
                    : "Guided adventure with real nature, crystal water and certified local routes.")}
              </p>

              {activeTour.inclusions && activeTour.inclusions.length > 0 && (
                <div>
                  <p className="mb-2 text-[10px] font-black uppercase tracking-wider text-teal-300">
                    {isEs ? "¿Qué incluye?" : "What's included?"}
                  </p>
                  <ul className="grid grid-cols-2 gap-1.5">
                    {activeTour.inclusions.slice(0, 4).map((inc) => (
                      <li key={inc} className="flex items-start gap-2 text-xs text-white/65">
                        <Check size={12} className="mt-0.5 shrink-0 text-teal-400" />
                        {inc}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {activeTour.packages && activeTour.packages.length > 0 && (
                <div>
                  <p className="mb-2 text-[10px] font-black uppercase tracking-wider text-teal-300">
                    {isEs ? "Opciones disponibles" : "Available options"}
                  </p>
                  <div className="grid gap-1.5 xl:grid-cols-3">
                    {activeTour.packages.slice(0, 3).map((pkg) => (
                      <div key={pkg.id ?? pkg.name} className="flex items-center justify-between gap-2 rounded-[8px] border border-white/10 bg-white/[0.04] px-3 py-2">
                        <p className="truncate text-xs font-semibold text-white/75">
                          {isEs ? (pkg.nameEs ?? pkg.name) : pkg.name}
                        </p>
                        <span className="shrink-0 text-xs font-black text-teal-300">${pkg.price}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t border-white/10 pt-4">
                <div className="mb-3 flex items-baseline justify-between">
                  <span className="text-xs text-white/45">{isEs ? "Precio desde" : "Starting from"}</span>
                  <div>
                    <span className="text-2xl font-black text-white">{getPriceLabel(activeTour, isEs).value}</span>
                    <span className="ml-1 text-xs text-white/40">{isEs ? "/ persona" : "/ person"}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleBook()}
                  className="emerald-wave-button group flex w-full items-center justify-center gap-2 rounded-[10px] bg-emerald-300 py-3.5 text-sm font-black uppercase tracking-[0.12em] text-emerald-950 shadow-[0_16px_40px_rgba(16,185,129,0.30)] transition-all hover:-translate-y-0.5 hover:bg-amber-200"
                >
                  {isEs ? "Reservar este tour" : "Book this tour"}
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </button>
                <p className="mt-2 flex items-center justify-center gap-1.5 text-[10px] text-white/35">
                  <ShieldCheck size={11} />
                  {isEs ? "Cancelación gratuita hasta 24h antes" : "Free cancellation up to 24h before"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile: compact CTA for selected tour */}
        <div className="mt-4 lg:hidden">
          <div className="overflow-hidden rounded-[10px] border border-white/15 bg-black/55 backdrop-blur-xl">
            <div className="grid grid-cols-[72px_minmax(0,1fr)]">
              <div className="relative min-h-[80px] overflow-hidden">
                <Image
                  src={activeImage}
                  alt={getTourTitle(activeTour, isEs)}
                  fill
                  sizes="72px"
                  className="object-cover"
                />
              </div>
              <div className="p-3">
                <p className="truncate text-sm font-black text-white">{getTourTitle(activeTour, isEs)}</p>
                <p className="text-[11px] text-white/50">
                  {activeTour.duration}
                  {activeTour.difficulty ? ` · ${activeTour.difficulty}` : ""}
                </p>
                {activeTour.inclusions && activeTour.inclusions.length > 0 && (
                  <ul className="mt-1.5 space-y-0.5">
                    {activeTour.inclusions.slice(0, 2).map((inc) => (
                      <li key={inc} className="flex items-start gap-1.5 text-[11px] text-white/55">
                        <Check size={10} className="mt-0.5 shrink-0 text-teal-400" />
                        <span className="truncate">{inc}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-white/10 px-4 py-3">
              <span className="text-sm font-black text-white">
                {getPriceLabel(activeTour, isEs).value}
                <span className="ml-1 text-xs font-normal text-white/40">{isEs ? "/ persona" : "/ person"}</span>
              </span>
              <button
                type="button"
                onClick={() => handleBook()}
                className="inline-flex items-center gap-1.5 rounded-[8px] bg-teal-400 px-4 py-2 text-sm font-black text-zinc-950 transition hover:bg-amber-300"
              >
                {isEs ? "Reservar" : "Book"}
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const MainMosaicHero: React.FC = () => {
  const { lang } = useLanguage();
  const isEs = lang === "es";

  return (
    <section className="relative min-h-[92svh] overflow-hidden bg-[#020807] text-white md:min-h-screen">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(16,185,129,0.16),transparent_42%),linear-gradient(180deg,#020807_0%,rgba(2,8,7,0.42)_36%,#020807_100%)]" />
      <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(90deg,rgba(110,231,183,0.05)_1px,transparent_1px),linear-gradient(0deg,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:92px_92px]" />

      <div className="relative h-[92svh] min-h-[680px] pt-24 md:h-screen md:min-h-[720px]">
        <div className="absolute inset-x-0 top-20 flex gap-2 px-3 md:top-24 md:gap-3 md:px-8" style={{ animation: "lva-main-marquee-left 72s linear infinite" }}>
          {[...GALLERY_STRIP, ...GALLERY_STRIP].map((src, index) => (
            <div
              key={`top-${src}-${index}`}
              className="relative h-36 w-48 shrink-0 overflow-hidden rounded-[10px] border border-white/5 bg-emerald-950/30 shadow-[0_18px_60px_rgba(0,0,0,0.35)] md:h-56 md:w-72"
            >
              <Image src={src} alt="" fill sizes="288px" className="object-cover opacity-62" priority={index < 8} />
            </div>
          ))}
        </div>

        <div className="absolute inset-x-0 top-[17rem] flex gap-2 px-3 md:top-[21rem] md:gap-3 md:px-8" style={{ animation: "lva-main-marquee-right 64s linear infinite" }}>
          {[...GALLERY_STRIP.slice(10), ...GALLERY_STRIP, ...GALLERY_STRIP.slice(0, 10)].map((src, index) => (
            <div
              key={`bottom-${src}-${index}`}
              className="relative h-40 w-56 shrink-0 overflow-hidden rounded-[10px] border border-white/5 bg-emerald-950/30 shadow-[0_18px_60px_rgba(0,0,0,0.35)] md:h-60 md:w-80"
            >
              <Image src={src} alt="" fill sizes="320px" className="object-cover opacity-55" priority={index < 6} />
            </div>
          ))}
        </div>

        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(2,8,7,0.86),rgba(2,8,7,0.22)_26%,rgba(2,8,7,0.28)_62%,#020807_100%),linear-gradient(90deg,#020807_0%,rgba(2,8,7,0.10)_20%,rgba(2,8,7,0.10)_80%,#020807_100%)]" />
        <div className="pointer-events-none absolute inset-x-0 top-[42%] h-48 -translate-y-1/2 bg-[radial-gradient(ellipse_at_center,rgba(2,8,7,0.62),transparent_70%)] blur-sm" />

        <div className="relative z-10 flex h-full items-center justify-center px-4 text-center">
          <div className="mx-auto max-w-6xl">
            <p className="mb-4 text-[11px] font-black uppercase tracking-[0.55em] text-emerald-300/90 md:text-sm">
              San Carlos · Costa Rica
            </p>
            <h1 className="text-balance text-[clamp(3rem,9vw,7.6rem)] font-black leading-[0.88] text-white drop-shadow-[0_12px_40px_rgba(0,0,0,0.75)]">
              {isEs ? "Donde el cañón se vuelve esmeralda." : "Where the canyon turns emerald."}
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base font-semibold leading-relaxed text-white/74 md:text-xl">
              {isEs
                ? "Aventura local, pozas cristalinas y paredes verdes del Rio La Vieja. Reserve con seguridad, sin enredos, pura vida."
                : "Local adventure, crystal pools, and green canyon walls on the La Vieja River. Book clearly and safely."}
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/reservar?tour=tour-ciudad-esmeralda"
                className="emerald-wave-button inline-flex min-h-14 items-center gap-3 rounded-full bg-emerald-400 px-8 py-4 text-sm font-black uppercase tracking-[0.22em] text-emerald-950 shadow-[0_18px_50px_rgba(16,185,129,0.42)] transition hover:-translate-y-0.5 hover:bg-amber-300"
              >
                {isEs ? "Reservar ahora" : "Book now"}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="#tours"
                className="inline-flex min-h-14 items-center gap-3 rounded-full border border-white/20 bg-black/35 px-7 py-4 text-sm font-black uppercase tracking-[0.18em] text-white backdrop-blur-xl transition hover:border-emerald-200/60 hover:bg-white/10"
              >
                {isEs ? "Ver tours" : "View tours"}
                <ChevronDown className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes lva-main-marquee-left {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @keyframes lva-main-marquee-right {
          from { transform: translateX(-50%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </section>
  );
};

interface DynamicHeroHeaderProps {
  children?: ReactNode;
  showHeroSlider?: boolean;
  onSelectTour?: (slug: string) => void;
}

export default function DynamicHeroHeader({ children, showHeroSlider = true, onSelectTour }: DynamicHeroHeaderProps) {
  const scrollY = useScrollY();
  const isScrolled = useMemo(() => scrollY > SCROLL_THRESHOLD, [scrollY]);

  return (
    <>
      <SiteHeader isScrolled={isScrolled} />
      {showHeroSlider && (
        <section className="relative overflow-hidden">
          <MainMosaicHero />
          {children}
        </section>
      )}
      <MobileBottomNav />
    </>
  );
}
