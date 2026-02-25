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
import { Menu, X, ChevronDown, ChevronLeft, ChevronRight, LogOut, User, LayoutDashboard } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { useInterval } from "../../hooks/useInterval";
import { useLanguage } from "@/app/context/LanguageContext";
import { translations } from "@/lib/translations";
import { useSession, signOut } from "next-auth/react";

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
    const base = "transition-colors duration-200";
    const style =
      variant === "primary"
        ? "px-5 py-2 rounded-full font-semibold border border-white/40 bg-white/10 backdrop-blur-md shadow-sm shadow-black/20 hover:bg-white hover:text-teal-900 hover:border-white"
        : `hover:text-teal-200 ${isActive ? "text-teal-200" : "text-white"}`;
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
        className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-sm font-semibold text-white hover:bg-white/15 transition-colors"
        aria-expanded={open}
      >
        {item.label}
        <ChevronDown size={14} className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 min-w-52 pt-2">
          <div className="rounded-2xl border border-white/10 bg-teal-950/95 p-2 shadow-2xl backdrop-blur-xl">
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
    <div className="rounded-2xl border border-white/10 bg-white/5">
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
    className="px-3 py-1.5 rounded-full border border-white/40 bg-white/10 backdrop-blur-md text-white text-sm font-bold hover:bg-white hover:text-teal-900 hover:border-white transition-colors duration-200 shadow-sm shadow-black/20 min-w-[40px] text-center"
  >
    {currentLang === "es" ? "EN" : "ES"}
  </button>
));
LangToggle.displayName = "LangToggle";

// ─── AuthNav ──────────────────────────────────────────────────────────────────
const AuthNav = memo<{ onMobileClose?: () => void; isMobile?: boolean }>(({ onMobileClose, isMobile }) => {
  const { data: session, status } = useSession();
  const { lang } = useLanguage();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  if (status === "loading") {
    return <div className="w-8 h-8 rounded-full bg-white/20 animate-pulse" />;
  }

  if (!session?.user) {
    return (
      <Link
        href="/platform"
        onClick={onMobileClose}
        className="px-5 py-2 rounded-full font-semibold border border-white/40 bg-white/10 backdrop-blur-md shadow-sm shadow-black/20 transition-all duration-200 text-white text-sm hover:-translate-y-0.5 hover:bg-white hover:text-teal-900 hover:border-white hover:shadow-md hover:shadow-black/30 active:translate-y-0 active:scale-[0.99] cursor-pointer"
      >
        {lang === "es" ? "Iniciar sesión" : "Log In"}
      </Link>
    );
  }

  const { name, image } = session.user;

  if (isMobile) {
    return (
      <div className="space-y-3 pt-2 border-t border-white/10">
        <div className="flex items-center gap-3">
          {image ? (
            <Image src={image} alt={name || "User"} width={36} height={36} className="rounded-full border border-white/30" referrerPolicy="no-referrer" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-teal-700 flex items-center justify-center">
              <User size={16} className="text-white" />
            </div>
          )}
          <span className="text-white font-medium text-sm truncate">{name}</span>
        </div>
        <Link href="/dashboard" onClick={onMobileClose} className="flex items-center gap-2 text-white/80 hover:text-white text-sm font-semibold">
          <LayoutDashboard size={15} /> Dashboard
        </Link>
        <button
          onClick={() => { signOut({ callbackUrl: "/" }); onMobileClose?.(); }}
          className="flex items-center gap-2 text-white/80 hover:text-white text-sm font-semibold"
        >
          <LogOut size={15} /> {lang === "es" ? "Cerrar sesión" : "Log Out"}
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setDropdownOpen((p) => !p)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/30 bg-white/10 backdrop-blur-md hover:bg-white/20 transition-colors duration-200"
        aria-label="User menu"
      >
        {image ? (
          <Image src={image} alt={name || "User"} width={28} height={28} className="rounded-full" referrerPolicy="no-referrer" />
        ) : (
          <div className="w-7 h-7 rounded-full bg-teal-700 flex items-center justify-center">
            <User size={14} className="text-white" />
          </div>
        )}
        <span className="text-white text-sm font-medium hidden lg:block max-w-[100px] truncate">{name?.split(" ")[0]}</span>
        <ChevronDown size={14} className={`text-white/70 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} />
      </button>

      {dropdownOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
          <div className="absolute right-0 top-full mt-2 z-50 w-52 rounded-2xl border border-white/10 bg-teal-950/95 backdrop-blur-xl shadow-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-white/10">
              <p className="text-white text-sm font-semibold truncate">{name}</p>
              <p className="text-white/50 text-xs truncate">{session.user.email}</p>
            </div>
            <Link
              href="/dashboard"
              onClick={() => setDropdownOpen(false)}
              className="flex items-center gap-2.5 px-4 py-3 text-sm text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            >
              <LayoutDashboard size={15} /> Dashboard
            </Link>
            <button
              onClick={() => { setDropdownOpen(false); signOut({ callbackUrl: "/" }); }}
              className="flex w-full items-center gap-2.5 px-4 py-3 text-sm text-white/80 hover:text-white hover:bg-white/10 transition-colors border-t border-white/10"
            >
              <LogOut size={15} /> {lang === "es" ? "Cerrar sesión" : "Log Out"}
            </button>
          </div>
        </>
      )}
    </div>
  );
});
AuthNav.displayName = "AuthNav";

// ─── Header ───────────────────────────────────────────────────────────────────
const Header = memo<{ isScrolled: boolean; onMenuToggle: () => void; isMenuOpen: boolean }>(
  ({ isScrolled, onMenuToggle, isMenuOpen }) => {
    const logoSize = isScrolled ? LOGO_SIZE.scrolled : LOGO_SIZE.default;
    const textSize = isScrolled ? TEXT_SIZE.scrolled : TEXT_SIZE.default;
    const { lang, toggle } = useLanguage();
    const tr = translations[lang].nav;

    const navLinks: NavLinkItem[] = [
      { href: "/info", label: tr.info },
      { href: "/docs", label: tr.docs },
      { href: "/tours", label: tr.tours },
      { href: "/galeria", label: tr.gallery },
      { href: "/wildo", label: tr.wildo },
      { href: "/tiempo", label: lang === "es" ? "Pronóstico" : "Forecast" },
      { href: "/ai", label: "AI" },
    ];

    const [openMobileGroup, setOpenMobileGroup] = useState<string | null>(null);


    const navGroups: NavGroup[] = [
      {
        label: lang === "es" ? "Explorar" : "Explore",
        links: navLinks,
      },
    ];

    return (
      <header
        className={[
          "fixed inset-x-0 top-0 z-50",
          "backdrop-blur-2xl border-b border-white/10",
          "transition-all duration-300",
          isScrolled
            ? "bg-teal-950/80 shadow-[0_10px_40px_rgba(0,0,0,0.6)]"
            : "bg-teal-950/40 shadow-none",
        ].join(" ")}
      >
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 md:px-8">
          <Link href="/">
            <div className="flex items-center space-x-3 cursor-pointer">
              <Image
                src="/logo2.jpg"
                alt="La Vieja Adventures Logo"
                width={logoSize}
                height={logoSize}
                className="rounded-md object-cover transition-all duration-300 shadow-md shadow-black/30"
                priority
              />
              <span className={`font-black tracking-tight text-white transition-all duration-300 ${textSize}`}>
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
            <AuthNav />
          </nav>

          <button
            className="text-white md:hidden"
            onClick={onMenuToggle}
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X size={32} /> : <Menu size={32} />}
          </button>
        </div>

        <div
          className={[
            "flex flex-col md:hidden text-white",
            "backdrop-blur-2xl bg-teal-950/80 border-t border-white/10 shadow-[0_18px_40px_rgba(0,0,0,0.75)]",
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
          <AuthNav isMobile onMobileClose={onMenuToggle} />
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
  const tr = translations[lang].hero;

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
    const OVERLAY_SPEED = -0.3;
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
        Error loading images
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
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/10 to-black/80" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20" />
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
        aria-label="Previous image"
      >
        <ChevronLeft size={18} />
      </button>
      <button
        onClick={goNext}
        className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-black/30 border border-white/15 backdrop-blur-sm flex items-center justify-center text-white hover:bg-teal-500/30 hover:border-teal-400/50 transition-all duration-200"
        aria-label="Next image"
      >
        <ChevronRight size={18} />
      </button>

      {/* ── Main text overlay ── */}
      <div
        ref={parallaxOverlayRef}
        className="relative w-full h-full flex flex-col justify-center items-center text-center z-20 px-4 md:px-8 will-change-transform"
      >
        {overlay || (
          <>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full border border-white/20 bg-white/8 backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
              <span className="text-[11px] font-bold text-white/75 uppercase tracking-[0.2em]">
                San Carlos · Costa Rica
              </span>
            </div>

            {/* Title */}
            <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-[7rem] font-black mb-5 text-white leading-[0.88] tracking-tight drop-shadow-2xl">
              {tr.title}
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-xl md:text-2xl font-light text-white/75 max-w-2xl mb-10 leading-relaxed">
              {tr.subtitle}{" "}
              <span className="font-semibold text-teal-300">{tr.subtitleBold}</span>.
            </p>

            {/* CTA */}
            <a
              href="#booking"
              className="group inline-flex items-center gap-3 px-8 py-4 rounded-full bg-teal-500 hover:bg-teal-400 text-white font-bold text-base shadow-[0_0_40px_rgba(20,184,166,0.4)] hover:shadow-[0_0_55px_rgba(20,184,166,0.6)] transition-all duration-300"
            >
              <span>{lang === "es" ? "Reservar ahora" : "Book now"}</span>
              <span className="inline-block group-hover:translate-x-1 transition-transform duration-200">→</span>
            </a>
          </>
        )}

        {/* ── Bottom controls ── */}
        <div className="absolute bottom-7 left-0 right-0 flex flex-col items-center gap-3 z-30">
          {/* Dot indicators */}
          <div className="flex items-center gap-2">
            {carouselImages.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goTo(idx)}
                className={`rounded-full transition-all duration-300 ${
                  idx === currentIndex
                    ? "w-7 h-2 bg-teal-400"
                    : "w-2 h-2 bg-white/30 hover:bg-white/55"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          {/* Counter */}
          <span className="text-[10px] font-medium text-white/35 tabular-nums tracking-widest">
            {String(currentIndex + 1).padStart(2, "0")} / {String(carouselImages.length).padStart(2, "0")}
          </span>

          {/* Scroll indicator */}
          <a
            href="#booking"
            className="mt-1 p-2 rounded-full bg-white/8 hover:bg-white/18 transition-colors animate-bounce"
            aria-label="Scroll to booking"
          >
            <ChevronDown size={22} className="text-white/60" />
          </a>
        </div>
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
