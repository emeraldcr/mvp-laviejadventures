"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Moon, Sun } from "lucide-react";
import { CalendarProvider } from "@/lib/CalendarContext";
import { useLanguage } from "@/lib/LanguageContext";
import { useTheme } from "@/lib/ThemeContext";
import { useReservationData } from "@/lib/hooks/useReservationData";
import BookingSection from "@/app/components/sections/BookingSection";

type UrlBookingParams = {
  tour: string;
  pax: number;
  date: string;
  package: string;
};

const DEFAULT_URL_PARAMS: UrlBookingParams = {
  tour: "",
  pax: 2,
  date: "",
  package: "",
};

const PACKAGE_QUERY_ALIASES: Record<string, string> = {
  "essential-package": "paquete-esencial",
  "lunch-package": "paquete-con-almuerzo",
  "private-package": "paquete-privado",
};

export default function ReservarPage() {
  const { lang, toggle } = useLanguage();
  const { theme, toggle: toggleTheme } = useTheme();
  const { tours } = useReservationData();
  const [urlParams, setUrlParams] = useState<UrlBookingParams>(DEFAULT_URL_PARAMS);
  const [selectedTourSlug, setSelectedTourSlug] = useState("");
  const [hasReadUrl, setHasReadUrl] = useState(false);
  const isDark = theme === "dark";
  const isEs = lang === "es";

  const activeTour = useMemo(
    () => (selectedTourSlug ? tours.find((tour) => tour.slug === selectedTourSlug) ?? null : tours[0] ?? null),
    [selectedTourSlug, tours],
  );
  const bookingTourSlug = selectedTourSlug || activeTour?.slug || null;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tourFromUrl = params.get("tour")?.trim() ?? "";
    const paxRaw = Number(params.get("pax") ?? params.get("tickets"));

    setUrlParams({
      tour: tourFromUrl,
      pax: Number.isFinite(paxRaw) && paxRaw >= 1 ? Math.min(20, Math.round(paxRaw)) : 2,
      date: params.get("date")?.trim() ?? "",
      package: (() => {
        const value = params.get("package")?.trim() ?? "";
        return PACKAGE_QUERY_ALIASES[value] ?? value;
      })(),
    });
    if (tourFromUrl) setSelectedTourSlug(tourFromUrl);
    setHasReadUrl(true);
  }, []);

  useEffect(() => {
    if (!hasReadUrl || selectedTourSlug || !tours[0]?.slug) return;
    setSelectedTourSlug(tours[0].slug);
  }, [hasReadUrl, selectedTourSlug, tours]);

  useEffect(() => {
    if (!selectedTourSlug) return;
    const url = new URL(window.location.href);
    url.searchParams.set("tour", selectedTourSlug);
    const next = `${url.pathname}${url.search}`;
    if (`${window.location.pathname}${window.location.search}` !== next) {
      window.history.replaceState({}, "", next);
    }
  }, [selectedTourSlug]);

  if (!hasReadUrl) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#FAF9F6] dark:bg-[#0b0a09]">
        <p className="text-sm font-bold text-stone-600 dark:text-stone-300">
          {isEs ? "Preparando su reserva…" : "Preparing your booking…"}
        </p>
      </main>
    );
  }

  return (
    <CalendarProvider
      selectedTourSlug={bookingTourSlug}
      initialTickets={urlParams.pax}
      initialDateIso={urlParams.date || null}
    >
      <main className="min-h-screen bg-[#FAF9F6] font-sans text-stone-900 dark:bg-[#0b0a09] dark:text-stone-100">
        <header className="sticky top-0 z-40 border-b border-stone-200/80 bg-white/90 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-stone-950/85">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">
            <Link href="/" className="flex min-w-0 items-center gap-3">
              <Image
                src="/logo2.jpg"
                alt="La Vieja Adventures"
                width={42}
                height={42}
                className="rounded-lg border border-stone-200 object-cover dark:border-white/15"
                priority
              />
              <span className="truncate text-sm font-black text-stone-900 dark:text-stone-50 md:text-base">
                La Vieja Adventures
              </span>
            </Link>

            <nav className="flex items-center gap-2">
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-full border border-stone-300 px-3 py-2 text-xs font-black uppercase tracking-wider text-stone-700 transition hover:border-emerald-500 hover:text-emerald-700 dark:border-white/15 dark:text-stone-200 dark:hover:border-emerald-300/60 dark:hover:text-emerald-300"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{isEs ? "Inicio" : "Home"}</span>
              </Link>
              <button
                type="button"
                onClick={toggleTheme}
                aria-label={isDark ? "Modo claro" : "Modo oscuro"}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-stone-300 text-stone-700 transition hover:border-emerald-500 hover:text-emerald-700 dark:border-white/15 dark:text-stone-200 dark:hover:border-emerald-300/60 dark:hover:text-emerald-300"
              >
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
              <button
                type="button"
                onClick={toggle}
                className="rounded-full border border-stone-300 px-3 py-2 text-xs font-black text-stone-800 transition hover:border-emerald-500 dark:border-white/15 dark:text-stone-200 dark:hover:border-emerald-300/60"
                aria-label={isEs ? "Switch to English" : "Cambiar a Español"}
              >
                {isEs ? "EN" : "ES"}
              </button>
            </nav>
          </div>
        </header>

        <BookingSection selectedTourSlug={bookingTourSlug} initialPackageId={urlParams.package} />
      </main>
    </CalendarProvider>
  );
}
