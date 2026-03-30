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
import { useInterval } from "@/app/hooks/useInterval";
import { useLanguage } from "@/app/context/LanguageContext";
import { translations } from "@/lib/translations";
import { useSession, signOut } from "next-auth/react";
import { useHeroSlogan } from "@/app/hooks/useHeroSlogan";

// ─── Types ────────────────────────────────────────────────────────────────────
interface NavLinkItem {
  href: string;
  label: string;
  variant?: "default" | "primary";
  external?: boolean;
}

interface NavGroup {
  label: string;
  description?: string;
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
  const pathname = usePathname();
  const activeCount = item.links.filter((link) => pathname === link.href).length;

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
        className={[
          "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-all duration-300",
          open || activeCount > 0
            ? "border-emerald-300/50 bg-white/18 text-white shadow-[0_14px_32px_rgba(6,95,70,0.22)]"
            : "border-white/15 bg-white/7 text-white/90 hover:bg-white/14",
        ].join(" ")}
        aria-expanded={open}
      >
        {item.label}
        <span className="rounded-full border border-white/10 bg-black/20 px-2 py-0.5 text-[10px] uppercase tracking-[0.22em] text-white/55">
          {item.links.length}
        </span>
        <ChevronDown size={14} className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 min-w-[22rem] pt-3">
          <div className="overflow-hidden rounded-[28px] border border-white/15 bg-[linear-gradient(145deg,rgba(7,89,79,0.88),rgba(2,6,23,0.94))] shadow-[0_30px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
            <div className="border-b border-white/10 bg-white/6 px-4 py-3">
              <p className="text-[11px] font-black uppercase tracking-[0.28em] text-emerald-200/85">{item.label}</p>
              <p className="mt-1 max-w-xs text-sm leading-6 text-white/68">
                {item.description ?? "Encuentra rÃ¡pido la secciÃ³n correcta y sigue explorando sin perderte."}
              </p>
            </div>
            <div className="p-2">
            {item.links.map((link) => (
              <NavLink
                key={link.href}
                {...link}
                className={[
                  "group block rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-200",
                  pathname === link.href
                    ? "bg-white/14 text-emerald-100 ring-1 ring-inset ring-emerald-300/30"
                    : "text-white/90 hover:bg-white/10 hover:text-white",
                ].join(" ")}
                onClick={() => setOpen(false)}
              />
            ))}
          </div>
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
  const pathname = usePathname();

  return (
    <div className="overflow-hidden rounded-[24px] border border-white/12 bg-white/6 backdrop-blur-xl">
      <button
        type="button"
        className="flex w-full items-center justify-between px-4 py-4 text-left"
        onClick={onToggle}
        aria-expanded={open}
      >
        <div>
          <p className="text-base font-semibold text-white">{item.label}</p>
          <p className="mt-1 text-xs uppercase tracking-[0.18em] text-white/45">
            {item.description ?? "Abre para ver opciones"}
          </p>
        </div>
        <ChevronDown size={16} className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="space-y-1 border-t border-white/10 bg-black/10 px-2 pb-3 pt-3">
          {item.links.map((link) => (
            <NavLink
              key={link.href}
              {...link}
              className={[
                "block rounded-2xl px-3 py-3 text-base font-medium transition-all duration-200",
                pathname === link.href
                  ? "bg-white/14 text-emerald-100 ring-1 ring-inset ring-emerald-300/25"
                  : "text-white/88 hover:bg-white/10 hover:text-white",
              ].join(" ")}
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

    const operationsLinks: NavLinkItem[] = [
      { href: "/bitacora-mantenimiento", label: lang === "es" ? "Bitácora de Mantenimiento" : "Maintenance Log" },
      { href: "/capacitacion-y-certificaciones", label: lang === "es" ? "Capacitación y Certificaciones" : "Training & Certifications" },
      { href: "/educacion-ambiental", label: lang === "es" ? "Educación Ambiental" : "Environmental Education" },
      { href: "/practicas-sostenibles", label: lang === "es" ? "Prácticas Sostenibles" : "Sustainable Practices" },
      { href: "/programas-comunidad", label: lang === "es" ? "Programas Comunidad" : "Community Programs" },
      { href: "/conservacion-recursos", label: lang === "es" ? "Conservación Recursos" : "Resource Conservation" },
      { href: "/plan-mercadeo", label: lang === "es" ? "Plan de Mercadeo" : "Marketing Plan" },
      { href: "/servicio-al-cliente", label: lang === "es" ? "Servicio al Cliente" : "Customer Service" },
      { href: "/capacitacion-continua", label: lang === "es" ? "Capacitación Continua" : "Ongoing Training" },
      { href: "/reglamento-operaciones", label: lang === "es" ? "Reglamento Operaciones" : "Operations Regulations" },
    ];

    const navGroups: NavGroup[] = [
      {
        label: lang === "es" ? "Explorar" : "Explore",
        description:
          lang === "es"
            ? "Todo lo importante para descubrir tours, informaciÃ³n y contenido clave."
            : "Everything essential to discover tours, info, and key content.",
        links: navLinks,
      },
      {
        label: lang === "es" ? "Operaciones" : "Operations",
        description:
          lang === "es"
            ? "Documentos y procesos internos organizados para encontrar cada tema mÃ¡s rÃ¡pido."
            : "Docs and internal processes organized so each topic is easier to find.",
        links: operationsLinks,
      },
    ];

    return (
      <header
        className={[
          "fixed inset-x-0 top-0 z-50",
          "transition-all duration-500",
          isScrolled
            ? "px-2 pt-2 md:px-4"
            : "px-3 pt-3 md:px-5",
        ].join(" ")}
      >
        <div
          className={[
            "relative mx-auto flex max-w-7xl items-center justify-between overflow-hidden rounded-[28px] border px-4 md:px-6",
            "bg-[linear-gradient(135deg,rgba(255,255,255,0.16),rgba(255,255,255,0.06))] backdrop-blur-[22px]",
            "shadow-[0_24px_70px_rgba(2,8,23,0.34)]",
            isScrolled
              ? "h-[4.9rem] border-white/16 bg-[linear-gradient(135deg,rgba(8,47,73,0.7),rgba(15,118,110,0.22),rgba(2,6,23,0.72))]"
              : "h-[5.4rem] border-white/14 bg-[linear-gradient(135deg,rgba(8,47,73,0.5),rgba(16,185,129,0.14),rgba(2,6,23,0.58))]",
          ].join(" ")}
        >
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-x-0 top-0 h-px bg-white/35" />
            <div className="absolute -left-10 top-0 h-24 w-24 rounded-full bg-emerald-300/14 blur-2xl" />
            <div className="absolute right-8 top-1 h-20 w-28 rounded-full bg-cyan-300/12 blur-2xl" />
          </div>
          <Link href="/">
            <div className="relative z-10 flex items-center gap-3 cursor-pointer">
              <Image
                src="/logo2.jpg"
                alt="La Vieja Adventures Logo"
                width={logoSize}
                height={logoSize}
                className="rounded-2xl object-cover transition-all duration-300 shadow-[0_10px_30px_rgba(0,0,0,0.3)] ring-1 ring-white/20"
                priority
              />
              <div className="flex flex-col">
                <span className="text-[10px] font-semibold uppercase tracking-[0.42em] text-emerald-100/70">
                  Costa Rica Canyon Experience
                </span>
                <span className={`lva-wordmark ${textSize} transition-all duration-300`}>
                  La Vieja Adventures
                </span>
              </div>
            </div>
          </Link>

          <nav className="relative z-10 hidden items-center gap-3 font-medium text-white md:flex">
            {navGroups.map((group) => (
              <DesktopNavGroup key={group.label} item={group} />
            ))}
            <NavLink href="/#booking" label={tr.reserve} variant="primary" className="ml-1" />
            <LangToggle onClick={toggle} currentLang={lang} />
            <AuthNav />
          </nav>

          <button
            className="relative z-10 rounded-full border border-white/15 bg-white/10 p-2 text-white backdrop-blur-xl md:hidden"
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
            "mx-2 mt-3 overflow-hidden rounded-[28px] border border-white/12 backdrop-blur-2xl shadow-[0_18px_40px_rgba(0,0,0,0.48)]",
            "bg-[linear-gradient(145deg,rgba(8,47,73,0.8),rgba(15,118,110,0.24),rgba(2,6,23,0.88))]",
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
  const { slogan, loading: sloganLoading } = useHeroSlogan();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const parallaxImageRef = useRef<HTMLDivElement>(null);
  const parallaxOverlayRef = useRef<HTMLDivElement>(null);
  const parallaxMistRef = useRef<HTMLDivElement>(null);
  const parallaxOrbRef = useRef<HTMLDivElement>(null);

  // Auto-advance
  useInterval(() => {
    if (!paused && carouselImages.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % carouselImages.length);
    }
  }, SLIDE_DURATION);

  // Parallax on scroll
  useEffect(() => {
    if (typeof window === "undefined") return;
    const IMG_SPEED = -0.18;
    const OVERLAY_SPEED = -0.34;
    const MIST_SPEED = -0.1;
    const ORB_SPEED = -0.42;
    let ticking = false;
    const update = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const sy = window.scrollY;
          if (parallaxImageRef.current)
            parallaxImageRef.current.style.transform = `translate3d(0,${sy * IMG_SPEED}px,0) scale(1.08)`;
          if (parallaxOverlayRef.current)
            parallaxOverlayRef.current.style.transform = `translate3d(0,${sy * OVERLAY_SPEED}px,0)`;
          if (parallaxMistRef.current)
            parallaxMistRef.current.style.transform = `translate3d(0,${sy * MIST_SPEED}px,0) scale(1.04)`;
          if (parallaxOrbRef.current)
            parallaxOrbRef.current.style.transform = `translate3d(0,${sy * ORB_SPEED}px,0) rotate(${sy * 0.02}deg)`;
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
        <div
          ref={parallaxMistRef}
          className="absolute inset-x-0 bottom-[-6%] top-[18%] bg-[radial-gradient(circle_at_20%_20%,rgba(45,212,191,0.20),transparent_30%),radial-gradient(circle_at_80%_30%,rgba(186,230,253,0.16),transparent_24%),radial-gradient(circle_at_50%_100%,rgba(255,255,255,0.10),transparent_34%)] blur-2xl"
        />
        <div
          ref={parallaxOrbRef}
          className="absolute left-[8%] top-[16%] h-44 w-44 rounded-full bg-[radial-gradient(circle,rgba(110,231,183,0.22),rgba(16,185,129,0.02)_62%,transparent_70%)] blur-xl"
        />
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

            {/* Subtitle — AI-generated slogan, unique on every load */}
            <div className="mb-10 max-w-2xl min-h-[2.5rem] flex items-center justify-center">
              {sloganLoading ? (
                <div className="flex flex-col items-center gap-2 w-full max-w-md">
                  <div className="h-4 w-3/4 rounded-full bg-white/10 animate-pulse" />
                  <div className="h-4 w-1/2 rounded-full bg-white/10 animate-pulse" />
                </div>
              ) : (
                <p
                  className="text-base sm:text-xl md:text-2xl font-light text-white/80 leading-relaxed text-center transition-opacity duration-700"
                  style={{ opacity: slogan ? 1 : 0 }}
                >
                  {slogan
                    ? lang === "es"
                      ? slogan.es
                      : slogan.en
                    : `${tr.subtitle} ${tr.subtitleBold}.`}
                </p>
              )}
            </div>

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
