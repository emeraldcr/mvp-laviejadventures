"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Globe, Menu, MessageCircle, Moon, Sun, X } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import { useTheme } from "@/lib/ThemeContext";
import { BOOKING_HREF, compactBookingLabel, localizedHomeWhatsAppHref, primaryBookingLabel } from "./home-utils";
import { localizeHref } from "@/lib/i18n";

export default function HomeNav({ solid = false }: { solid?: boolean }) {
  const { lang } = useLanguage();
  const { theme, toggle: toggleTheme } = useTheme();
  const isEs = lang === "es";
  const isDark = theme === "dark";
  const themeLabel = isEs ? (isDark ? "Modo claro" : "Modo oscuro") : (isDark ? "Light mode" : "Dark mode");
  const pathname = usePathname();
  const currentTour = pathname.match(/\/tour\/([^/]+)/)?.[1];
  const [currentSearch, setCurrentSearch] = useState("");
  const bookingQuery = new URLSearchParams(currentSearch);
  if (currentTour) bookingQuery.set("tour", decodeURIComponent(currentTour));
  const bookingHref = bookingQuery.toString() ? `/reservar?${bookingQuery.toString()}` : BOOKING_HREF;
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuDialogRef = useRef<HTMLDivElement>(null);
  const closeMenuButtonRef = useRef<HTMLButtonElement>(null);
  const wasMenuOpenRef = useRef(false);

  useEffect(() => {
    setCurrentSearch(window.location.search);
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useEffect(() => {
    if (!menuOpen) {
      if (wasMenuOpenRef.current) menuButtonRef.current?.focus();
      return;
    }

    wasMenuOpenRef.current = true;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const frame = window.requestAnimationFrame(() => closeMenuButtonRef.current?.focus());
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu();
        return;
      }
      if (event.key !== "Tab") return;

      const focusable = menuDialogRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      window.cancelAnimationFrame(frame);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeMenu, menuOpen]);

  const links = [
    { href: "/tours", label: "Tours" },
    { href: "/galeria", label: isEs ? "Galería" : "Gallery" },
    { href: "/info", label: "Info" },
    { href: "/tiempo", label: isEs ? "Clima" : "Weather" },
  ];

  const onDark = !scrolled && !solid;
  const currentQuery = currentSearch.replace(/^\?/, "");
  const languagePath = localizeHref(pathname, isEs ? "en" : "es");
  const languageHref = `${languagePath}${currentQuery ? `?${currentQuery}` : ""}`;

  return (
    <>
      <header
        data-overlay={onDark ? "true" : "false"}
        className={[
          "lva-site-nav fixed inset-x-0 top-0 z-50 transition-all duration-300",
          scrolled || solid
            ? "border-b border-[var(--lva-border)]"
            : "bg-transparent",
        ].join(" ")}
      >
        <div className="mx-auto flex h-16 max-w-[1520px] items-center justify-between px-4 sm:px-6 md:h-[5.5rem] lg:px-8">
          {/* Brand */}
          <Link
            href={localizeHref("/", lang)}
            className={[
              "flex items-center gap-2.5 rounded-full transition-all",
              onDark ? "bg-black/18 py-1.5 pl-1.5 pr-4 backdrop-blur-md" : "",
            ].join(" ")}
          >
            <Image
              src="/logo2.webp"
              alt="La Vieja Adventures"
              width={40}
              height={40}
              priority
              className="h-9 w-9 rounded-full object-cover ring-2 ring-white/40 md:h-11 md:w-11"
            />
            <span
              className={[
                "font-display hidden text-lg font-bold tracking-tight transition-colors min-[440px]:inline md:text-xl",
                "text-[var(--lva-ink)]",
              ].join(" ")}
            >
              La Vieja <span className="text-[var(--lva-accent)]">Adventures</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav
            className={[
              "lva-nav-surface hidden items-center gap-1 rounded-full p-1.5 md:flex",
            ].join(" ")}
          >
            {links.map((link) => {
              const active = pathname === localizeHref(link.href, lang);
              return (
                <Link
                  key={link.href}
                  href={localizeHref(link.href, lang)}
                  className={[
                    "lva-nav-link rounded-full px-4 py-2 text-sm font-bold",
                  ].join(" ")}
                  data-active={active ? "true" : "false"}
                >
                  {link.label}
                </Link>
              );
            })}

            <span className="mx-2 h-5 w-px bg-[var(--lva-border)]" />

            <button
              type="button"
              onClick={toggleTheme}
              aria-label={themeLabel}
              title={themeLabel}
              className={[
                "lva-nav-control inline-flex h-9 w-9 items-center justify-center rounded-full",
              ].join(" ")}
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            <Link
              href={languageHref}
              aria-label={isEs ? "Switch to English" : "Cambiar a Español"}
              className={[
                "lva-nav-control inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-bold",
              ].join(" ")}
            >
              <Globe size={15} />
              {isEs ? "EN" : "ES"}
            </Link>

            <a
              href={localizedHomeWhatsAppHref(isEs)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className={[
                "lva-nav-control inline-flex h-9 w-9 items-center justify-center rounded-full",
              ].join(" ")}
            >
              <MessageCircle size={18} />
            </a>

            <Link
              href={localizeHref(bookingHref, lang)}
              className="lva-nav-cta ml-1 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-black transition-all hover:-translate-y-0.5"
            >
              {compactBookingLabel(isEs)}
              <ArrowRight size={15} />
            </Link>
          </nav>

          {/* Mobile controls */}
          <div className="flex items-center gap-1.5 md:hidden">
            <Link href={localizeHref(bookingHref, lang)} className="lva-nav-cta inline-flex min-h-10 items-center rounded-full px-3 text-xs font-bold">{compactBookingLabel(isEs)}</Link>
            <button
              type="button"
              ref={menuButtonRef}
              onClick={() => setMenuOpen(true)}
              aria-label={isEs ? "Abrir menú" : "Open menu"}
              aria-expanded={menuOpen}
              aria-controls="home-mobile-menu"
              aria-haspopup="dialog"
              className={[
                "lva-nav-control inline-flex h-10 w-10 items-center justify-center rounded-full",
              ].join(" ")}
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile full-screen menu */}
      {menuOpen && (
        <div
          ref={menuDialogRef}
          id="home-mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-labelledby="home-mobile-menu-title"
          tabIndex={-1}
          className="lva-mobile-menu fixed inset-0 z-[60] flex flex-col md:hidden"
        >
          <div className="flex h-16 items-center justify-between px-4">
            <span id="home-mobile-menu-title" className="font-display text-lg font-bold">
              La Vieja <span className="text-[var(--lva-accent)]">Adventures</span>
            </span>
            <button
              type="button"
              ref={closeMenuButtonRef}
              onClick={closeMenu}
              aria-label={isEs ? "Cerrar menú" : "Close menu"}
              className="lva-nav-control inline-flex h-10 w-10 items-center justify-center rounded-full"
            >
              <X size={24} />
            </button>
          </div>

          <nav className="flex flex-1 flex-col justify-center gap-2 px-8">
            {[{ href: "/", label: isEs ? "Inicio" : "Home" }, ...links].map((link, i) => (
              <Link
                key={link.href}
                href={localizeHref(link.href, lang)}
                onClick={closeMenu}
                className="lva-nav-link font-display border-b border-[var(--lva-border)] py-4 text-3xl font-bold tracking-tight"
                style={{ transitionDelay: `${i * 30}ms` }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="space-y-3 px-8 pb-10">
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={toggleTheme}
                aria-label={themeLabel}
                className="lva-nav-control flex min-h-12 items-center justify-center gap-2 rounded-full border border-[var(--lva-border)] px-4 py-3 text-sm font-bold"
              >
                {isDark ? <Sun size={17} /> : <Moon size={17} />}
                {themeLabel}
              </button>
              <Link
                href={languageHref}
                onClick={closeMenu}
                aria-label={isEs ? "Switch to English" : "Cambiar a Español"}
                className="lva-nav-control flex min-h-12 items-center justify-center gap-2 rounded-full border border-[var(--lva-border)] px-4 py-3 text-sm font-bold"
              >
                <Globe size={17} />
                {isEs ? "English" : "Español"}
              </Link>
            </div>
            <Link
              href={localizeHref(bookingHref, lang)}
              onClick={closeMenu}
              className="lva-nav-cta flex items-center justify-center gap-2 rounded-full py-4 text-base font-black"
            >
              {primaryBookingLabel(isEs)}
              <ArrowRight size={17} />
            </Link>
            <a
              href={localizedHomeWhatsAppHref(isEs)}
              target="_blank"
              rel="noopener noreferrer"
              className="lva-nav-control flex items-center justify-center gap-2 rounded-full border border-[var(--lva-border)] py-4 text-base font-bold"
            >
              <MessageCircle size={17} className="text-emerald-600 dark:text-emerald-400" />
              WhatsApp
            </a>
          </div>
        </div>
      )}
    </>
  );
}
