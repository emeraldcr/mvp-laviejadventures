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
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Home,
  Compass,
  CalendarCheck,
  GalleryHorizontal,
  Info as InfoIcon,
  Globe,
} from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import useSWR from "swr";
import { fetcher } from "@/lib/helpers/fetcher";
import { useInterval } from "@/lib/hooks/useInterval";
import { useLanguage } from "@/lib/LanguageContext";
import { translations } from "@/lib/translations";
import { principalContent } from "@/lib/constants/principal";
import { useReservationData } from "@/lib/hooks/useReservationData";

// ─── Types ────────────────────────────────────────────────────────────────────
interface NavLinkItem {
  href: string;
  label: string;
  variant?: "default" | "primary";
  external?: boolean;
}

interface NavGroup {
  label: string;
  links: NavLinkItem[];
}

// ─── Constants ────────────────────────────────────────────────────────────────
const SCROLL_THRESHOLD = 60;
const SLIDE_DURATION = 5000;

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

// ─── NavLink (desktop only) ───────────────────────────────────────────────────
const NavLink = memo<NavLinkItem & { onClick?: () => void; className?: string }>(
  ({ href, label, variant = "default", external, onClick, className = "" }) => {
    const pathname = usePathname();
    const isAnchor = href.startsWith("/#");
    const isActive = !isAnchor && pathname === href;
    const base = "relative overflow-hidden transition-all duration-300";
    const style =
      variant === "primary"
        ? "emerald-wave-button px-5 py-2 rounded-full font-semibold border border-emerald-200/[0.45] bg-emerald-300/[0.15] text-white backdrop-blur-xl shadow-[0_8px_26px_rgba(6,78,59,0.28),inset_0_1px_0_rgba(255,255,255,0.28)] hover:-translate-y-0.5 hover:border-emerald-100/80 hover:bg-emerald-200/25 hover:text-white hover:shadow-[0_12px_34px_rgba(16,185,129,0.28),inset_0_1px_0_rgba(255,255,255,0.42)]"
        : `rounded-full px-3 py-1.5 hover:bg-emerald-300/10 hover:text-emerald-100 ${isActive ? "bg-emerald-300/10 text-emerald-100" : "text-white"}`;
    const linkProps = external ? { target: "_blank", rel: "noopener noreferrer" } : {};
    return (
      <Link href={href} {...linkProps} className={`${base} ${style} ${className}`} onClick={onClick}>
        {label}
      </Link>
    );
  }
);
NavLink.displayName = "NavLink";

const DesktopNavGroup = memo<{ item: NavGroup }>(({ item }) => {
  const [open, setOpen] = useState(false);
  const groupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: MouseEvent) => {
      if (!groupRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  return (
    <div ref={groupRef} className="relative" onMouseEnter={() => setOpen(true)}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="emerald-wave-button inline-flex items-center gap-1.5 rounded-full border border-emerald-100/20 bg-white/[0.08] px-3 py-1.5 text-sm font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-100/[0.45] hover:bg-emerald-300/[0.15] hover:text-emerald-50"
        aria-expanded={open}
      >
        {item.label}
        <ChevronDown size={14} className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-50 min-w-52 pt-2">
          <div className="rounded-2xl border border-emerald-100/20 bg-teal-950/[0.88] p-2 shadow-[0_24px_70px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-2xl">
            {item.links.map((link) => (
              <NavLink
                key={link.href}
                {...link}
                className="block rounded-xl px-3 py-2 text-sm font-medium hover:bg-white/10"
                onClick={() => setOpen(false)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
});
DesktopNavGroup.displayName = "DesktopNavGroup";

// ─── LangToggle ───────────────────────────────────────────────────────────────
const LangToggle = memo<{ onClick: () => void; currentLang: string; compact?: boolean }>(
  ({ onClick, currentLang, compact }) => (
    <button
      type="button"
      onClick={onClick}
      aria-label={currentLang === "es" ? "Switch to English" : "Cambiar a Español"}
      className={[
        "emerald-wave-button rounded-full border border-emerald-100/35 bg-white/10 font-bold text-white",
        "shadow-[0_8px_24px_rgba(6,78,59,0.22),inset_0_1px_0_rgba(255,255,255,0.2)] backdrop-blur-xl",
        "transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-100/70 hover:bg-emerald-100/20",
        compact
          ? "flex items-center gap-1 px-2.5 py-1.5 text-xs"
          : "min-w-[40px] px-3 py-1.5 text-center text-sm",
      ].join(" ")}
    >
      {compact && <Globe size={12} />}
      {currentLang === "es" ? "EN" : "ES"}
    </button>
  )
);
LangToggle.displayName = "LangToggle";

// ─── Mobile Bottom Tab Bar ────────────────────────────────────────────────────
const MobileBottomNav = memo(() => {
  const pathname = usePathname() ?? "";
  const { lang, toggle } = useLanguage();
  const tr = translations[lang].nav;

  const tabs = [
    { href: "/",        label: lang === "es" ? "Inicio" : "Home",  Icon: Home },
    { href: "/tours",   label: tr.tours,                            Icon: Compass },
    { href: "/#booking", label: lang === "es" ? "Reservar" : "Book", Icon: CalendarCheck, isPrimary: true },
    { href: "/galeria", label: tr.gallery,                          Icon: GalleryHorizontal },
    { href: "/info",    label: "Info",                              Icon: InfoIcon },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 md:hidden">
      {/* backdrop */}
      <div className="absolute inset-0 border-t border-emerald-100/20 bg-teal-950/95 shadow-[0_-6px_32px_rgba(0,0,0,0.55)] backdrop-blur-2xl" />

      <div
        className="relative flex h-16 items-stretch"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        {tabs.map(({ href, label, Icon, isPrimary }) => {
          const isActive =
            href === "/"
              ? pathname === "/"
              : href.startsWith("/#")
              ? false
              : pathname.startsWith(href);

          if (isPrimary) {
            return (
              <Link
                key={href}
                href={href}
                className="flex flex-1 flex-col items-center justify-end pb-2"
              >
                {/* lifted circle button */}
                <span className="mb-0.5 flex h-12 w-12 -translate-y-3 items-center justify-center rounded-full bg-teal-500 shadow-[0_4px_24px_rgba(20,184,166,0.6),0_0_0_4px_rgba(2,44,34,0.95)]">
                  <Icon size={22} className="text-white" strokeWidth={2.5} />
                </span>
                <span className="text-[10px] font-semibold leading-none text-teal-400 -mt-1">
                  {label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={href}
              href={href}
              className="flex flex-1 flex-col items-center justify-center gap-1 py-2"
            >
              <Icon
                size={22}
                strokeWidth={isActive ? 2.5 : 1.75}
                className={`transition-colors duration-150 ${
                  isActive ? "text-teal-400" : "text-white/40"
                }`}
              />
              <span
                className={`text-[10px] font-medium leading-none transition-colors duration-150 ${
                  isActive ? "text-teal-400" : "text-white/40"
                }`}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
});
MobileBottomNav.displayName = "MobileBottomNav";

// ─── HeroBookingWidget ────────────────────────────────────────────────────────
const HeroBookingWidget = memo<{ onSelectTour?: (slug: string) => void }>(
  ({ onSelectTour }) => {
    const { lang } = useLanguage();
    const { tours } = useReservationData();
    const [selectedSlug, setSelectedSlug] = useState(tours[0]?.slug ?? "");
    const [people, setPeople] = useState(2);

    useEffect(() => {
      if (tours.length > 0 && !selectedSlug) setSelectedSlug(tours[0].slug);
    }, [tours, selectedSlug]);

    const selectedTour = tours.find((t) => t.slug === selectedSlug) ?? tours[0];
    const minPrice = selectedTour?.packages?.[0]?.price ?? null;
    const isEs = lang === "es";

    const handleBook = () => {
      const slug = selectedSlug || tours[0]?.slug;
      if (!slug) return;
      if (onSelectTour) {
        onSelectTour(slug);
      } else {
        window.history.replaceState({}, "", `/?tour=${slug}#booking`);
        document.getElementById("booking")?.scrollIntoView({ behavior: "smooth", block: "start" });
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
                  value={selectedSlug}
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

// ─── Header ───────────────────────────────────────────────────────────────────
const Header = memo<{ isScrolled: boolean }>(({ isScrolled }) => {
  const { lang, toggle } = useLanguage();
  const tr = translations[lang].nav;
  const copy = principalContent[lang].header;

  const navLinks: NavLinkItem[] = [
    { href: "/info",    label: tr.info },
    { href: "/tours",   label: tr.tours },
    { href: "/galeria", label: tr.gallery },
    { href: "/tiempo",  label: copy.forecast },
  ];

  const navGroups: NavGroup[] = [{ label: copy.exploreGroup, links: navLinks }];

  return (
    <header
      className={[
        "fixed inset-x-0 top-0 z-50",
        "border-b border-emerald-100/15 backdrop-blur-2xl",
        "transition-all duration-300",
        isScrolled
          ? "bg-[linear-gradient(120deg,rgba(6,78,59,0.86),rgba(4,47,46,0.78)_48%,rgba(5,150,105,0.34))] shadow-[0_14px_48px_rgba(0,0,0,0.48),inset_0_1px_0_rgba(255,255,255,0.12)]"
          : "bg-[linear-gradient(120deg,rgba(6,78,59,0.48),rgba(4,47,46,0.34)_50%,rgba(16,185,129,0.18))] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]",
      ].join(" ")}
    >
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-emerald-200/45 to-transparent" />

      {/* ── Shared inner row ── */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 md:px-8 h-14 md:h-20">

        {/* Logo */}
        <Link href="/" className="group/logo flex items-center gap-2.5">
          <span className="emerald-logo-shell relative grid place-items-center rounded-xl md:rounded-2xl border border-emerald-100/25 bg-white/10 p-1 md:p-1.5 shadow-[0_12px_34px_rgba(0,0,0,0.32),inset_0_1px_0_rgba(255,255,255,0.24)] backdrop-blur-xl transition-all duration-500 group-hover/logo:-translate-y-0.5 group-hover/logo:border-emerald-100/[0.55] group-hover/logo:bg-emerald-100/[0.16]">
            <Image
              src="/logo2.jpg"
              alt="La Vieja Adventures"
              width={52}
              height={52}
              className="w-9 h-9 md:w-[52px] md:h-[52px] rounded-lg md:rounded-xl object-cover transition-all duration-500 group-hover/logo:scale-[1.03]"
              priority
            />
          </span>
          {/* Full name on desktop, short on mobile */}
          <span className="font-black tracking-tight text-white leading-tight">
            <span className="block text-lg md:hidden">La Vieja</span>
            <span className="hidden md:block text-2xl brand-glow-text">La Vieja Adventures</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-3 font-medium text-white">
          {navGroups.map((group) => (
            <DesktopNavGroup key={group.label} item={group} />
          ))}
          <NavLink href="/#booking" label={tr.reserve} variant="primary" className="ml-1" />
          <LangToggle onClick={toggle} currentLang={lang} />
        </nav>

        {/* Mobile: language toggle only (no hamburger — nav is at bottom) */}
        <div className="flex items-center gap-2 md:hidden">
          <LangToggle onClick={toggle} currentLang={lang} compact />
        </div>
      </div>
    </header>
  );
});
Header.displayName = "Header";

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
      <Header isScrolled={isScrolled} />
      {showHeroSlider && (
        <section className="relative h-screen min-h-[600px] overflow-hidden">
          <HeroCarousel height="100%" overlay={null} onSelectTour={onSelectTour} />
          {children}
        </section>
      )}
      <MobileBottomNav />
    </>
  );
}
