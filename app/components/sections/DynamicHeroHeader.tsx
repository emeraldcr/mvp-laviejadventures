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
import { Menu, X, ChevronDown, ChevronLeft, ChevronRight, User, LayoutDashboard } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import useSWR from "swr";
import { fetcher } from "@/lib/helpers/fetcher";
import { useInterval } from "@/app/hooks/useInterval";
import { useLanguage } from "@/lib/LanguageContext";
import { translations } from "@/lib/translations";
import { principalContent } from "@/lib/constants/principal";

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
const SCROLL_THRESHOLD = 80;
const LOGO_SIZE = { default: 64, scrolled: 42 };
const TEXT_SIZE = { default: "text-2xl", scrolled: "text-xl" };
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

// ─── NavLink ──────────────────────────────────────────────────────────────────
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
      if (!groupRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
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
    <div
      ref={groupRef}
      className="relative"
      onMouseEnter={() => setOpen(true)}
    >
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

const MobileNavGroup = memo<{
  item: NavGroup;
  onNavigate: () => void;
  open: boolean;
  onToggle: () => void;
}>(({ item, onNavigate, open, onToggle }) => {

  return (
    <div className="rounded-2xl border border-emerald-100/[0.15] bg-white/[0.07] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]">
      <button
        type="button"
        className="flex w-full items-center justify-between px-4 py-3 text-left text-base font-semibold text-white"
        onClick={onToggle}
        aria-expanded={open}
      >
        {item.label}
        <ChevronDown size={16} className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="space-y-1 px-2 pb-3">
          {item.links.map((link) => (
            <NavLink
              key={link.href}
              {...link}
              className="block rounded-xl px-3 py-2 text-base font-medium hover:bg-white/10"
              onClick={onNavigate}
            />
          ))}
        </div>
      )}
    </div>
  );
});
MobileNavGroup.displayName = "MobileNavGroup";

// ─── LangToggle ───────────────────────────────────────────────────────────────
const LangToggle = memo<{ onClick: () => void; currentLang: string }>(({ onClick, currentLang }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={currentLang === "es" ? "Switch to English" : "Cambiar a Español"}
    className="emerald-wave-button min-w-[40px] rounded-full border border-emerald-100/35 bg-white/10 px-3 py-1.5 text-center text-sm font-bold text-white shadow-[0_8px_24px_rgba(6,78,59,0.22),inset_0_1px_0_rgba(255,255,255,0.2)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-100/70 hover:bg-emerald-100/20 hover:text-white"
  >
    {currentLang === "es" ? "EN" : "ES"}
  </button>
));
LangToggle.displayName = "LangToggle";


// ─── Header ───────────────────────────────────────────────────────────────────
const Header = memo<{ isScrolled: boolean; onMenuToggle: () => void; isMenuOpen: boolean }>(
  ({ isScrolled, onMenuToggle, isMenuOpen }) => {
    const logoSize = isScrolled ? LOGO_SIZE.scrolled : LOGO_SIZE.default;
    const textSize = isScrolled ? TEXT_SIZE.scrolled : TEXT_SIZE.default;
    const { lang, toggle } = useLanguage();
    const tr = translations[lang].nav;
    const copy = principalContent[lang].header;

    const navLinks: NavLinkItem[] = [
      { href: "/info", label: tr.info },
      
      { href: "/tours", label: tr.tours },
     
      { href: "/galeria", label: tr.gallery },
     
      { href: "/tiempo", label: copy.forecast },
     
    ];

    const [openMobileGroup, setOpenMobileGroup] = useState<string | null>(null);


    const navGroups: NavGroup[] = [
      {
        label: copy.exploreGroup,
        links: navLinks,
      },
    ];

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
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 md:px-8">
          <Link href="/" className="group/logo">
            <div className="flex cursor-pointer items-center gap-3">
              <span className="emerald-logo-shell relative grid place-items-center rounded-2xl border border-emerald-100/25 bg-white/10 p-1.5 shadow-[0_12px_34px_rgba(0,0,0,0.32),inset_0_1px_0_rgba(255,255,255,0.24)] backdrop-blur-xl transition-all duration-500 group-hover/logo:-translate-y-0.5 group-hover/logo:border-emerald-100/[0.55] group-hover/logo:bg-emerald-100/[0.16]">
                <Image
                  src="/logo2.jpg"
                  alt="La Vieja Adventures Logo"
                  width={logoSize}
                  height={logoSize}
                  className="rounded-xl object-cover transition-all duration-500 group-hover/logo:scale-[1.03]"
                  priority
                />
              </span>
              <span className={`brand-glow-text font-black tracking-tight text-white transition-all duration-300 ${textSize}`}>
                La Vieja Adventures
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-3 font-medium text-white">
            {navGroups.map((group) => (
              <DesktopNavGroup key={group.label} item={group} />
            ))}
            <NavLink href="/#booking" label={tr.reserve} variant="primary" className="ml-1" />
            <LangToggle onClick={toggle} currentLang={lang} />
          </nav>

          <button
            className="emerald-wave-button rounded-full border border-emerald-100/25 bg-white/10 p-2 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] backdrop-blur-xl transition-all duration-300 hover:bg-emerald-200/15 md:hidden"
            onClick={onMenuToggle}
            aria-label={copy.toggleMenuAria}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X size={32} /> : <Menu size={32} />}
          </button>
        </div>

        <div
          className={[
            "flex flex-col md:hidden text-white",
            "border-t border-emerald-100/15 bg-[linear-gradient(145deg,rgba(6,78,59,0.94),rgba(4,47,46,0.9)_55%,rgba(5,150,105,0.34))] shadow-[0_18px_40px_rgba(0,0,0,0.62)] backdrop-blur-2xl",
            "px-6 py-8 transition-all duration-300",
            isMenuOpen ? "max-h-[40rem] opacity-100 space-y-4" : "max-h-0 opacity-0 overflow-hidden",
          ].join(" ")}
          aria-hidden={!isMenuOpen}
        >
          {navGroups.map((group) => {
            const isGroupOpen = openMobileGroup === group.label;

            return (
              <MobileNavGroup
                key={group.label}
                item={group}
                open={isGroupOpen}
                onNavigate={onMenuToggle}
                onToggle={() => setOpenMobileGroup(isGroupOpen ? null : group.label)}
              />
            );
          })}
          <NavLink href="/#booking" label={tr.reserve} variant="primary" className="text-center" onClick={onMenuToggle} />
          <div className="pt-2">
            <LangToggle onClick={toggle} currentLang={lang} />
          </div>
        </div>
      </header>
    );
  }
);
Header.displayName = "Header";

// ─── HeroCarousel ─────────────────────────────────────────────────────────────
interface HeroCarouselProps {
  overlay?: ReactNode;
  height?: string;
}

export const HeroCarousel: React.FC<HeroCarouselProps> = ({ overlay, height = "100%" }) => {
  const { data: carouselImages = [], error, isLoading } = useSWR<string[]>("/api/images", fetcher);
  const { lang } = useLanguage();
  const copy = principalContent[lang].hero;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const parallaxImageRef = useRef<HTMLDivElement>(null);
  const parallaxOverlayRef = useRef<HTMLDivElement>(null);

  // Auto-advance
  useInterval(() => {
    if (!paused && carouselImages.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % carouselImages.length);
    }
  }, SLIDE_DURATION);

  // Parallax on scroll
  useEffect(() => {
    if (typeof window === "undefined") return;
    const IMG_SPEED = -0.15;
    const OVERLAY_SPEED = 0;
    let ticking = false;
    const update = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const sy = window.scrollY;
          if (parallaxImageRef.current)
            parallaxImageRef.current.style.transform = `translate3d(0,${sy * IMG_SPEED}px,0)`;
          if (parallaxOverlayRef.current)
            parallaxOverlayRef.current.style.transform = `translate3d(0,${sy * OVERLAY_SPEED}px,0)`;
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  const goTo = useCallback((idx: number) => {
    setCurrentIndex(idx);
  }, []);
  const goPrev = useCallback(() => {
    setCurrentIndex((p) => (p - 1 + carouselImages.length) % carouselImages.length);
  }, [carouselImages.length]);
  const goNext = useCallback(() => {
    setCurrentIndex((p) => (p + 1) % carouselImages.length);
  }, [carouselImages.length]);

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
      {/* ── Images ── */}
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

      {/* ── Cinematic gradient overlay ── */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/30 to-black/90" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/25 via-transparent to-black/25" />
        <div className="absolute inset-x-0 bottom-0 h-[46%] bg-gradient-to-t from-black/95 via-black/70 to-transparent" />
      </div>

      {/* ── Progress bar (top) ── */}
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

      {/* ── Prev / Next arrows ── */}
      <button
        onClick={goPrev}
        className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-black/30 border border-white/15 backdrop-blur-sm flex items-center justify-center text-white hover:bg-teal-500/30 hover:border-teal-400/50 transition-all duration-200"
        aria-label={copy.previousImageAria}
      >
        <ChevronLeft size={18} />
      </button>
      <button
        onClick={goNext}
        className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-black/30 border border-white/15 backdrop-blur-sm flex items-center justify-center text-white hover:bg-teal-500/30 hover:border-teal-400/50 transition-all duration-200"
        aria-label={copy.nextImageAria}
      >
        <ChevronRight size={18} />
      </button>

      {/* ── Main text overlay ── */}
      <div className="relative z-20 flex h-full w-full items-center justify-center px-4 pb-36 pt-28 text-center sm:pb-40 md:px-8 md:pb-44 md:pt-32">
        <div ref={parallaxOverlayRef} className="mx-auto flex max-w-6xl flex-col items-center will-change-transform">
          {overlay || (
            <>
              {/* Badge */}
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/20 px-4 py-1.5 backdrop-blur-md sm:mb-6">
                <span className="h-1.5 w-1.5 rounded-full bg-teal-400 shadow-[0_0_16px_rgba(45,212,191,0.85)]" />
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/85">
                  {copy.locationBadge}
                </span>
              </div>

              {/* Title */}
              <h1 className="max-w-6xl text-balance text-[clamp(2.75rem,7vw,5.5rem)] font-black leading-[0.98] text-white drop-shadow-2xl">
                {copy.title}
              </h1>

              <h2 className="mt-4 max-w-4xl text-balance text-[clamp(1.25rem,2.8vw,2.45rem)] font-bold leading-tight text-white/95 drop-shadow-xl">
                {copy.subtitle}
              </h2>

              <p className="mt-6 max-w-4xl text-balance text-base font-medium leading-relaxed text-white/82 drop-shadow-lg sm:text-lg md:text-xl">
                {copy.description}
              </p>

              {/* CTA */}
              <div className="mt-8 flex w-full max-w-2xl flex-col items-center justify-center gap-3 sm:mt-9 sm:flex-row sm:gap-4">
                <a
                  href="#tours"
                  className="group inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-full bg-teal-500 px-7 py-3 text-base font-bold text-white shadow-[0_18px_45px_rgba(20,184,166,0.34)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-teal-400 hover:shadow-[0_22px_60px_rgba(20,184,166,0.46)] sm:w-auto"
                >
                  <span>{copy.exploreCta}</span>
                  <span className="inline-block group-hover:translate-x-1 transition-transform duration-200">→</span>
                </a>

                <a
                  href="#booking"
                  className="inline-flex min-h-14 w-full items-center justify-center rounded-full border border-white/55 bg-black/20 px-7 py-3 text-base font-bold text-white shadow-[0_16px_40px_rgba(0,0,0,0.22)] backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-white/80 hover:bg-white/18 sm:w-auto"
                >
                  {copy.datesCta}
                </a>
              </div>
            </>
          )}
        </div>
      </div>

        {/* ── Bottom controls ── */}
      <div className="absolute inset-x-0 bottom-6 z-30 flex flex-col items-center gap-3 px-4 sm:bottom-7 md:bottom-8">
          {/* Dot indicators */}
        <div className="flex max-w-[min(82vw,44rem)] items-center gap-2 overflow-hidden rounded-full border border-white/10 bg-black/28 px-3 py-2 shadow-[0_12px_30px_rgba(0,0,0,0.28)] backdrop-blur-md">
            {carouselImages.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goTo(idx)}
              className={`h-2 shrink-0 rounded-full transition-all duration-300 ${
                  idx === currentIndex
                  ? "w-8 bg-teal-400 shadow-[0_0_16px_rgba(45,212,191,0.7)]"
                  : "w-2 bg-white/36 hover:bg-white/65"
                }`}
                aria-label={copy.goToSlideAria.replace("{slide}", String(idx + 1))}
              />
            ))}
          </div>

          {/* Counter */}
        <span className="rounded-full bg-black/18 px-2 py-0.5 text-[10px] font-semibold tabular-nums tracking-widest text-white/55 backdrop-blur-sm">
            {String(currentIndex + 1).padStart(2, "0")} / {String(carouselImages.length).padStart(2, "0")}
          </span>

          {/* Scroll indicator */}
          <a
            href="#tours"
          className="mt-0 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white/75 shadow-[0_12px_32px_rgba(0,0,0,0.25)] backdrop-blur-md transition-colors hover:bg-white/18"
            aria-label={copy.scrollToToursAria}
          >
          <ChevronDown size={22} />
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
}

export default function DynamicHeroHeader({ children, showHeroSlider = true }: DynamicHeroHeaderProps) {
  const scrollY = useScrollY();
  const pathname = usePathname() ?? "";
  const [menuState, setMenuState] = useState({ open: false, pathname });
  const isMenuOpen = menuState.open && menuState.pathname === pathname;
  const isScrolled = useMemo(() => scrollY > SCROLL_THRESHOLD, [scrollY]);
  const toggleMenu = useCallback(() => {
    setMenuState((prev) => ({
      open: !(prev.open && prev.pathname === pathname),
      pathname,
    }));
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isMenuOpen]);

  return (
    <>
      <Header isScrolled={isScrolled} onMenuToggle={toggleMenu} isMenuOpen={isMenuOpen} />
      {showHeroSlider && (
        <section className="relative h-screen min-h-[600px] overflow-hidden">
          <HeroCarousel height="100%" overlay={null} />
          {children}
        </section>
      )}
    </>
  );
}
