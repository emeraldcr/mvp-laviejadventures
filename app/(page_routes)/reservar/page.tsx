"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, CheckCircle2, Compass, Moon, Sun } from "lucide-react";
import { CalendarProvider } from "@/lib/CalendarContext";
import { useLanguage } from "@/lib/LanguageContext";
import { useTheme } from "@/lib/ThemeContext";
import { useReservationData } from "@/lib/hooks/useReservationData";
import BookingSection from "@/app/components/sections/BookingSection";
import { getTourImage } from "@/lib/tour-display";
import { formatTourPrice } from "@/app/components/home/home-utils";

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

export default function ReservarPage() {
  const { lang, toggle } = useLanguage();
  const { theme, toggle: toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const { tours } = useReservationData();
  const [urlParams, setUrlParams] = useState<UrlBookingParams>(DEFAULT_URL_PARAMS);
  const [selectedTourSlug, setSelectedTourSlug] = useState("");
  const [hasReadUrl, setHasReadUrl] = useState(false);
  const isEs = lang === "es";
  const hasTourFromUrl = urlParams.tour.length > 0;

  const activeTour = useMemo(
    () => (selectedTourSlug ? tours.find((tour) => tour.slug === selectedTourSlug) ?? null : tours[0] ?? null),
    [selectedTourSlug, tours],
  );
  const bookingTourSlug = selectedTourSlug || activeTour?.slug || null;
  const displayTourTitle = activeTour
    ? isEs ? activeTour.titleEs : activeTour.titleEn
    : selectedTourSlug.replace(/-/g, " ");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tourFromUrl = params.get("tour")?.trim() ?? "";
    const paxRaw = Number(params.get("pax"));
    setUrlParams({
      tour: tourFromUrl,
      pax: Number.isFinite(paxRaw) && paxRaw >= 1 ? Math.min(20, Math.round(paxRaw)) : 2,
      date: params.get("date")?.trim() ?? "",
      package: params.get("package")?.trim() ?? "",
    });
    if (tourFromUrl) setSelectedTourSlug(tourFromUrl);
    setHasReadUrl(true);
  }, []);

  useEffect(() => {
    if (!hasReadUrl) return;
    if (!selectedTourSlug && tours[0]?.slug) {
      setSelectedTourSlug(tours[0].slug);
    }
  }, [hasReadUrl, selectedTourSlug, tours]);

  // Tour slug stays in the URL even before a date is picked; date/pax/package sync from ReservationDetails.
  useEffect(() => {
    if (!selectedTourSlug) return;
    const url = new URL(window.location.href);
    url.searchParams.set("tour", selectedTourSlug);
    const next = `${url.pathname}${url.search}`;
    if (`${window.location.pathname}${window.location.search}` !== next) {
      window.history.replaceState({}, "", next);
    }
  }, [selectedTourSlug]);

  useEffect(() => {
    if (!hasTourFromUrl) return;
    const frameId = window.requestAnimationFrame(() => {
      document.getElementById("booking")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    return () => window.cancelAnimationFrame(frameId);
  }, [hasTourFromUrl]);

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
              <span className="truncate text-sm font-black text-stone-900 dark:text-stone-50 md:text-base">La Vieja Adventures</span>
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
                title={isDark ? "Modo claro" : "Modo oscuro"}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-stone-300 text-stone-700 transition hover:border-emerald-500 hover:text-emerald-700 dark:border-white/15 dark:text-stone-200 dark:hover:border-emerald-300/60 dark:hover:text-emerald-300"
              >
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
              <button
                type="button"
                onClick={toggle}
                className="rounded-full border border-stone-300 px-3 py-2 text-xs font-black text-stone-800 transition hover:border-emerald-500 dark:border-white/15 dark:text-stone-200 dark:hover:border-emerald-300/60"
                aria-label={isEs ? "Switch to English" : "Cambiar a Espanol"}
              >
                {isEs ? "EN" : "ES"}
              </button>
            </nav>
          </div>
        </header>

        <section className="relative overflow-hidden border-b border-stone-200 bg-white dark:border-white/10 dark:bg-stone-950">
          {(activeTour || selectedTourSlug) && (
            <Image
              src={getTourImage(activeTour?.slug ?? selectedTourSlug)}
              alt={displayTourTitle}
              fill
              sizes="100vw"
              className="object-cover opacity-20 dark:opacity-30"
              priority
            />
          )}
          <div className="relative mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-8 md:py-8">
            <div>
              <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-300 md:mb-2 md:text-xs md:tracking-[0.25em]">
                {isEs ? "Reserva mágica" : "Magic booking"}
              </p>
              <h1 className="text-balance text-xl font-black leading-tight text-stone-950 dark:text-stone-50 sm:text-2xl md:text-3xl">
                {hasTourFromUrl
                  ? isEs ? "Confirmá. Nosotros armamos el resto." : "Confirm. We assemble the rest."
                  : isEs ? "Elegí tour. El resto se hace solo." : "Pick a tour. The rest does itself."}
              </h1>
              {activeTour && (
                <p className="mt-1 text-xs font-semibold text-stone-600 dark:text-stone-300 md:mt-2 md:text-sm">
                  {isEs ? "Desde" : "From"} {formatTourPrice(activeTour, isEs)} / {isEs ? "persona" : "person"}
                  {" · "}
                  {isEs ? "fecha + hora auto" : "date + time auto"}
                </p>
              )}
            </div>

            <div className="w-full rounded-xl border border-stone-200 bg-white p-2.5 shadow-sm dark:border-white/10 dark:bg-stone-900 md:max-w-md md:rounded-2xl md:p-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-300">
                    {hasTourFromUrl ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Compass className="h-3.5 w-3.5" />}
                    <span>{isEs ? "Tour" : "Tour"}</span>
                  </div>
                  {hasTourFromUrl && (
                    <Link
                      href="/reservar"
                      className="shrink-0 rounded-full border border-stone-300 px-2.5 py-1 text-[11px] font-bold text-stone-700 transition hover:border-emerald-500 dark:border-white/15 dark:text-stone-200 dark:hover:border-emerald-300/60"
                    >
                      {isEs ? "Ver todos" : "See all"}
                    </Link>
                  )}
                </div>

                {hasTourFromUrl ? (
                  <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-2 dark:border-emerald-800/50 dark:bg-emerald-950/30">
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg">
                      <Image
                        src={getTourImage(activeTour?.slug ?? selectedTourSlug)}
                        alt={displayTourTitle}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-stone-900 dark:text-stone-100">{displayTourTitle}</p>
                      {activeTour && (
                        <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                          {formatTourPrice(activeTour, isEs)} / {isEs ? "persona" : "person"}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="-mx-0.5 flex gap-2 overflow-x-auto pb-1 pt-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {tours.map((tour) => {
                      const selected = (activeTour?.slug ?? "") === tour.slug;
                      const title = isEs ? tour.titleEs : tour.titleEn;
                      return (
                        <button
                          key={tour.slug}
                          type="button"
                          onClick={() => {
                            setSelectedTourSlug(tour.slug);
                            document.getElementById("booking")?.scrollIntoView({ behavior: "smooth", block: "start" });
                          }}
                          className={`group relative w-[9.5rem] shrink-0 overflow-hidden rounded-xl border-2 text-left transition ${
                            selected
                              ? "border-emerald-500 shadow-md shadow-emerald-900/10"
                              : "border-stone-200 hover:border-emerald-400 dark:border-white/15 dark:hover:border-emerald-400/60"
                          }`}
                        >
                          <div className="relative h-16 w-full">
                            <Image
                              src={getTourImage(tour.slug)}
                              alt={title}
                              fill
                              sizes="152px"
                              className="object-cover transition group-hover:scale-105"
                            />
                            {selected && (
                              <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                              </span>
                            )}
                          </div>
                          <div className="space-y-0.5 bg-white p-2 dark:bg-stone-950">
                            <p className="line-clamp-2 text-[11px] font-black leading-snug text-stone-900 dark:text-stone-50">
                              {title}
                            </p>
                            <p className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                              {formatTourPrice(tour, isEs)}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                <p className="text-xs text-stone-500 dark:text-stone-400">
                  {isEs
                    ? "Paquete popular + fecha libre + hora — ya van puestos."
                    : "Popular package + open date + time — already set."}
                </p>
              </div>
            </div>
          </div>
        </section>

        <BookingSection selectedTourSlug={bookingTourSlug} initialPackageId={urlParams.package} />
      </main>
    </CalendarProvider>
  );
}
