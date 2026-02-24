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
import { Menu, X, ChevronDown } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import CalendarSection from "./CalendarSection";
import { useInterval } from "../../hooks/useInterval";
import { useLanguage } from "@/app/context/LanguageContext";
import { translations } from "@/lib/translations";

// Types
interface NavLinkItem {
  href: string;
  label: string;
  variant?: "default" | "primary";
  external?: boolean;
}

const SCROLL_THRESHOLD = 80;
const LOGO_SIZE = { default: 64, scrolled: 42 };
const TEXT_SIZE = { default: "text-2xl", scrolled: "text-xl" };

// Scroll listener
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

// NavLink Component
const NavLink = memo<
  NavLinkItem & { onClick?: () => void; className?: string }
>(({ href, label, variant = "default", external, onClick, className = "" }) => {
  const baseStyles = "transition-colors duration-200";

  const variantStyles =
    variant === "primary"
      ? [
        "px-5 py-2 rounded-full font-semibold",
        "border border-white/40 bg-white/10 backdrop-blur-md",
        "shadow-sm shadow-black/20",
        "hover:bg-white hover:text-teal-900 hover:border-white",
      ].join(" ")
      : "hover:text-teal-200";

  const linkProps = external
    ? { target: "_blank", rel: "noopener noreferrer" }
    : {};

  return (
    <Link
      href={href}
      {...linkProps}
      className={`${baseStyles} ${variantStyles} ${className}`}
      onClick={onClick}
    >
      {label}
    </Link>
  );
});
NavLink.displayName = "NavLink";

// Language Toggle Button
const LangToggle = memo<{ onClick: () => void; currentLang: string }>(
  ({ onClick, currentLang }) => (
    <button
      type="button"
      onClick={onClick}
      aria-label={currentLang === "es" ? "Switch to English" : "Cambiar a Español"}
      className="px-3 py-1.5 rounded-full border border-white/40 bg-white/10 backdrop-blur-md text-white text-sm font-bold hover:bg-white hover:text-teal-900 hover:border-white transition-colors duration-200 shadow-sm shadow-black/20 min-w-[40px] text-center"
    >
      {currentLang === "es" ? "EN" : "ES"}
    </button>
  )
);
LangToggle.displayName = "LangToggle";

// Header Component
const Header = memo<{
  isScrolled: boolean;
  onMenuToggle: () => void;
  isMenuOpen: boolean;
}>(({ isScrolled, onMenuToggle, isMenuOpen }) => {
  const logoSize = isScrolled ? LOGO_SIZE.scrolled : LOGO_SIZE.default;
  const textSize = isScrolled ? TEXT_SIZE.scrolled : TEXT_SIZE.default;
  const { lang, toggle } = useLanguage();
  const tr = translations[lang].nav;

  const navLinks: NavLinkItem[] = [
    { href: "/info", label: tr.info, external: false },
    { href: "/tours", label: tr.tours, external: false },
    { href: "/galeria", label: tr.gallery, external: false },
    { href: "/#calendar", label: tr.reserve, variant: "primary", external: false },
    { href: "/tiempo", label: tr.time, external: false },
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
            <span
              className={`font-black tracking-tight text-white transition-all duration-300 ${textSize}`}
            >
              La Vieja Adventures
            </span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center space-x-10 font-medium text-white">
          {navLinks.map((link) => (
            <NavLink key={link.href} {...link} />
          ))}
          <LangToggle onClick={toggle} currentLang={lang} />
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
          isMenuOpen
            ? "max-h-96 opacity-100 space-y-6"
            : "max-h-0 opacity-0 overflow-hidden",
        ].join(" ")}
        aria-hidden={!isMenuOpen}
      >
        {navLinks.map((link) => (
          <NavLink
            key={link.href}
            {...link}
            className="text-lg font-semibold"
            onClick={onMenuToggle}
          />
        ))}
        <div className="pt-2">
          <LangToggle onClick={toggle} currentLang={lang} />
        </div>
      </div>
    </header>
  );
});
Header.displayName = "Header";

// HeroCarousel Component
interface HeroCarouselProps {
  overlay?: ReactNode;
  height?: string; // Allow custom height (e.g., "50vh", "300px")
}

export const HeroCarousel: React.FC<HeroCarouselProps> = ({ overlay, height = "50vh" }) => {
  const {
    data: carouselImages = [],
    error,
    isLoading,
  } = useSWR<string[]>("/api/images", fetcher);

  const { lang } = useLanguage();
  const tr = translations[lang].hero;

  const [currentIndex, setCurrentIndex] = useState(0);

  const parallaxImageRef = useRef<HTMLDivElement>(null);
  const parallaxOverlayRef = useRef<HTMLDivElement>(null);

  useInterval(() => {
    if (carouselImages.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % carouselImages.length);
    }
  }, 5000);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const IMG_SPEED = -0.15;
    const OVERLAY_SPEED = -0.3;

    const handleScroll = () => {
      const scrollY = window.scrollY;

      if (parallaxImageRef.current) {
        parallaxImageRef.current.style.transform = `translate3d(0, ${scrollY * IMG_SPEED}px, 0)`;
      }
      if (parallaxOverlayRef.current) {
        parallaxOverlayRef.current.style.transform = `translate3d(0, ${scrollY * OVERLAY_SPEED}px, 0)`;
      }
    };

    let ticking = false;
    const update = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  if (error) return <div className="text-red-500 p-8">Error loading images: {error.message}</div>;
  if (isLoading || carouselImages.length === 0)
    return <div className="h-[50vh] flex items-center justify-center">Loading...</div>;

  return (
    <section className="relative w-full" style={{ height }}>
      <div ref={parallaxImageRef} className="absolute inset-0 will-change-transform z-0">
        {carouselImages.map((src, index) => (
          <Image
            key={index}
            src={src}
            alt={`Carousel image ${index + 1}`}
            fill
            className={`object-cover transition-opacity duration-1000 ease-in-out ${index === currentIndex ? "opacity-100" : "opacity-0"
              }`}
            priority={index < 3}
            sizes="(max-width: 768px) 100vw, 1280px"
          />
        ))}
      </div>

      <div className="absolute inset-0 z-10 pointer-events-none">
        <div className="w-full h-1/2 absolute top-0 bg-gradient-to-b from-black/60 to-transparent"></div>
        <div className="w-full h-1/3 absolute bottom-0 bg-gradient-to-t from-black/40 to-transparent"></div>
      </div>

      <div
        ref={parallaxOverlayRef}
        className="relative w-full h-full flex flex-col justify-center items-center text-center z-20 px-4 md:px-8 will-change-transform"
      >
        {overlay ? (
          overlay
        ) : (
          <>
            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black mb-6 text-white drop-shadow-2xl">
              {tr.title}
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-light text-white max-w-3xl drop-shadow-xl">
              {tr.subtitle}{" "}
              <span className="font-semibold">{tr.subtitleBold}</span>.
            </p>
          </>
        )}

        <a
          href="#calendar"
          className="absolute bottom-12 animate-bounce p-3 rounded-full bg-white/20 hover:bg-white/40 transition"
          aria-label="Scroll down to main content"
        >
          <ChevronDown size={32} className="text-white" />
        </a>
      </div>
    </section>
  );
};

// Main DynamicHeroHeader Component
interface DynamicHeroHeaderProps {
  children?: ReactNode;
}

export default function DynamicHeroHeader({ children }: DynamicHeroHeaderProps) {
  const scrollY = useScrollY();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isScrolled = useMemo(() => scrollY > SCROLL_THRESHOLD, [scrollY]);

  const toggleMenu = useCallback(() => {
    setIsMenuOpen((prev) => !prev);
  }, []);

  const pathname = usePathname();
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  return (
    <>
      <Header
        isScrolled={isScrolled}
        onMenuToggle={toggleMenu}
        isMenuOpen={isMenuOpen}
      />

      <section className="relative h-[50vh] min-h-[300px] bg-transparent overflow-hidden">
        <HeroCarousel height="100%" overlay={null} />

        {children && (
          <div className="relative z-20 mx-auto -mt-10 max-w-6xl px-3 sm:px-4 pb-12">
            <div
              className={[
                "rounded-3xl p-5 sm:p-7 lg:p-8",
                "border border-white/20 bg-white/10 dark:bg-zinc-900/40",
                "backdrop-blur-2xl",
                "shadow-[0_20px_80px_rgba(15,23,42,0.75)]",
              ].join(" ")}
            >
              <div className="grid gap-8 lg:gap-10 lg:grid-cols-[1.6fr_minmax(0,1fr)] items-start">
                {children}
              </div>
            </div>
          </div>
        )}
      </section>
    </>
  );
}
