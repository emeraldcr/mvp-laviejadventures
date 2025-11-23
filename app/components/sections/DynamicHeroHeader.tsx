"use client";

import { useState, useEffect, useCallback, useMemo, memo } from "react";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { HeroCarousel } from "./HeroCarousel";

// Types
interface NavLinkItem {
  href: string;
  label: string;
  variant?: "default" | "primary";
  external?: boolean; // NEW: external link support
}

// More global-brand style links
const NAV_LINKS: NavLinkItem[] = [
  { href: "https://laviejadventures.com/info", label: "Información", external: true },
  { href: "https://laviejadventures.com/tours", label: "Tours", external: true },
  { href: "https://laviejadventures.com/galeria", label: "Galería", external: true },
  { href: "#calendar", label: "Reserva", variant: "primary", external: false }, // Reservation stays internal
];

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

// Nav Link Component
const NavLink = memo<
  NavLinkItem & { onClick?: () => void; className?: string }
>(({ href, label, variant = "default", external, onClick, className = "" }) => {
  const baseStyles = "transition-colors duration-200";

  const variantStyles =
    variant === "primary"
      ? "px-5 py-2 border border-white rounded-full hover:bg-white hover:text-teal-900 font-semibold"
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

// Header Component
const Header = memo<{
  isScrolled: boolean;
  onMenuToggle: () => void;
  isMenuOpen: boolean;
}>(({ isScrolled, onMenuToggle, isMenuOpen }) => {
  const logoSize = isScrolled ? LOGO_SIZE.scrolled : LOGO_SIZE.default;
  const textSize = isScrolled ? TEXT_SIZE.scrolled : TEXT_SIZE.default;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 backdrop-blur-xl transition-all duration-300 ${
        isScrolled ? "bg-teal-800/90 shadow-lg" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 md:px-8">
        {/* Logo */}
        <Link href="/">
          <div className="flex items-center space-x-3 cursor-pointer">
            <Image
              src="/logo2.jpg"
              alt="La Vieja Adventures Logo"
              width={logoSize}
              height={logoSize}
              className="rounded-md object-cover transition-all duration-300"
              priority
            />
            <span
              className={`font-black tracking-tight text-white transition-all duration-300 ${textSize}`}
            >
              La Vieja Adventures
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-10 font-medium text-white">
          {NAV_LINKS.map((link) => (
            <NavLink key={link.href} {...link} />
          ))}
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="text-white md:hidden"
          onClick={onMenuToggle}
          aria-label="Toggle menu"
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? <X size={32} /> : <Menu size={32} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`flex flex-col bg-teal-900/95 px-6 py-8 text-white transition-all duration-300 md:hidden ${
          isMenuOpen ? "max-h-96 opacity-100 space-y-6" : "max-h-0 opacity-0 overflow-hidden"
        }`}
        aria-hidden={!isMenuOpen}
      >
        {NAV_LINKS.map((link) => (
          <NavLink
            key={link.href}
            {...link}
            className="text-lg font-semibold"
            onClick={onMenuToggle}
          />
        ))}
      </div>
    </header>
  );
});
Header.displayName = "Header";

// Main Component
export default function DynamicHeroHeader() {
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

  // Prevent scroll when mobile menu is open
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
      <HeroCarousel />
    </>
  );
}
