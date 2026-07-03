"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Globe, Menu, MessageCircle, X } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import { WHATSAPP_HREF } from "./home-utils";

export default function HomeNav() {
  const { lang, toggle } = useLanguage();
  const isEs = lang === "es";
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const links = [
    { href: "/tours", label: "Tours" },
    { href: "/galeria", label: isEs ? "Galería" : "Gallery" },
    { href: "/info", label: "Info" },
    { href: "/tiempo", label: isEs ? "Clima" : "Weather" },
  ];

  const onDark = !scrolled;

  return (
    <>
      <header
        className={[
          "fixed inset-x-0 top-0 z-50 transition-all duration-300",
          scrolled
            ? "border-b border-stone-200/70 bg-white/85 shadow-[0_1px_24px_rgba(0,0,0,0.06)] backdrop-blur-xl"
            : "bg-gradient-to-b from-black/55 via-black/20 to-transparent",
        ].join(" ")}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 md:h-[4.5rem] lg:px-8">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src="/logo2.jpg"
              alt="La Vieja Adventures"
              width={40}
              height={40}
              priority
              className="h-9 w-9 rounded-full object-cover ring-2 ring-white/40 md:h-10 md:w-10"
            />
            <span
              className={[
                "font-display text-lg font-bold tracking-tight transition-colors md:text-xl",
                onDark ? "text-white" : "text-stone-900",
              ].join(" ")}
            >
              La Vieja <span className={onDark ? "text-emerald-300" : "text-emerald-700"}>Adventures</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 md:flex">
            {links.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={[
                    "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                    onDark
                      ? active
                        ? "bg-white/15 text-white"
                        : "text-white/85 hover:bg-white/10 hover:text-white"
                      : active
                        ? "bg-stone-100 text-stone-900"
                        : "text-stone-600 hover:bg-stone-100 hover:text-stone-900",
                  ].join(" ")}
                >
                  {link.label}
                </Link>
              );
            })}

            <span className={`mx-2 h-5 w-px ${onDark ? "bg-white/25" : "bg-stone-300"}`} />

            <button
              type="button"
              onClick={toggle}
              aria-label={isEs ? "Switch to English" : "Cambiar a Español"}
              className={[
                "inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-bold transition-colors",
                onDark ? "text-white/85 hover:bg-white/10 hover:text-white" : "text-stone-600 hover:bg-stone-100 hover:text-stone-900",
              ].join(" ")}
            >
              <Globe size={15} />
              {isEs ? "EN" : "ES"}
            </button>

            <a
              href={WHATSAPP_HREF}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className={[
                "inline-flex h-9 w-9 items-center justify-center rounded-full transition-colors",
                onDark ? "text-white/85 hover:bg-white/10 hover:text-white" : "text-stone-600 hover:bg-stone-100 hover:text-stone-900",
              ].join(" ")}
            >
              <MessageCircle size={18} />
            </a>

            <Link
              href="/reservar"
              className="ml-1 inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/25 transition-all hover:-translate-y-0.5 hover:bg-emerald-500"
            >
              {isEs ? "Reservar" : "Book now"}
              <ArrowRight size={15} />
            </Link>
          </nav>

          {/* Mobile controls */}
          <div className="flex items-center gap-1.5 md:hidden">
            <button
              type="button"
              onClick={toggle}
              aria-label={isEs ? "Switch to English" : "Cambiar a Español"}
              className={[
                "inline-flex items-center gap-1 rounded-full px-2.5 py-2 text-xs font-bold",
                onDark ? "text-white" : "text-stone-700",
              ].join(" ")}
            >
              <Globe size={14} />
              {isEs ? "EN" : "ES"}
            </button>
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label={isEs ? "Abrir menú" : "Open menu"}
              className={[
                "inline-flex h-10 w-10 items-center justify-center rounded-full",
                onDark ? "text-white" : "text-stone-900",
              ].join(" ")}
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile full-screen menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-[60] flex flex-col bg-white md:hidden">
          <div className="flex h-16 items-center justify-between px-4">
            <span className="font-display text-lg font-bold text-stone-900">
              La Vieja <span className="text-emerald-700">Adventures</span>
            </span>
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              aria-label={isEs ? "Cerrar menú" : "Close menu"}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-stone-900 hover:bg-stone-100"
            >
              <X size={24} />
            </button>
          </div>

          <nav className="flex flex-1 flex-col justify-center gap-2 px-8">
            {[{ href: "/", label: isEs ? "Inicio" : "Home" }, ...links].map((link, i) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="font-display border-b border-stone-100 py-4 text-3xl font-bold tracking-tight text-stone-900 transition-colors hover:text-emerald-700"
                style={{ transitionDelay: `${i * 30}ms` }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="space-y-3 px-8 pb-10">
            <Link
              href="/reservar"
              onClick={() => setMenuOpen(false)}
              className="flex items-center justify-center gap-2 rounded-full bg-emerald-600 py-4 text-base font-bold text-white shadow-lg shadow-emerald-600/25"
            >
              {isEs ? "Reservar mi aventura" : "Book my adventure"}
              <ArrowRight size={17} />
            </Link>
            <a
              href={WHATSAPP_HREF}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-full border border-stone-300 py-4 text-base font-bold text-stone-800"
            >
              <MessageCircle size={17} className="text-emerald-600" />
              WhatsApp
            </a>
          </div>
        </div>
      )}
    </>
  );
}
