"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, CheckCircle2, Compass } from "lucide-react";
import { CalendarProvider } from "@/lib/CalendarContext";
import { useLanguage } from "@/lib/LanguageContext";
import { useReservationData } from "@/lib/hooks/useReservationData";
import BookingSection from "@/app/components/sections/BookingSection";
import { MobileBottomNav } from "@/app/components/navigation/SiteNavigation";
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

  useEffect(() => {
    if (!selectedTourSlug) return;
    const url = new URL(window.location.href);
    url.searchParams.set("tour", selectedTourSlug);
    if (urlParams.pax > 1) url.searchParams.set("pax", String(urlParams.pax));
    if (urlParams.package) url.searchParams.set("package", urlParams.package);
    if (urlParams.date) url.searchParams.set("date", urlParams.date);
    window.history.replaceState({}, "", `${url.pathname}${url.search}`);
  }, [selectedTourSlug, urlParams.date, urlParams.package, urlParams.pax]);

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
      <main className="min-h-screen bg-[#FAF9F6] font-sans text-stone-900">
        <header className="sticky top-0 z-40 border-b border-stone-200/80 bg-white/90 shadow-sm backdrop-blur-xl">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">
            <Link href="/" className="flex min-w-0 items-center gap-3">
              <Image
                src="/logo2.jpg"
                alt="La Vieja Adventures"
                width={42}
                height={42}
                className="rounded-lg border border-stone-200 object-cover"
                priority
              />
              <span className="truncate text-sm font-black text-stone-900 md:text-base">La Vieja Adventures</span>
            </Link>
            <nav className="flex items-center gap-2">
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-full border border-stone-300 px-3 py-2 text-xs font-black uppercase tracking-wider text-stone-700 transition hover:border-emerald-500 hover:text-emerald-700"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{isEs ? "Inicio" : "Home"}</span>
              </Link>
              <button
                type="button"
                onClick={toggle}
                className="rounded-full border border-stone-300 px-3 py-2 text-xs font-black text-stone-800 transition hover:border-emerald-500"
                aria-label={isEs ? "Switch to English" : "Cambiar a Espanol"}
              >
                {isEs ? "EN" : "ES"}
              </button>
            </nav>
          </div>
        </header>

        <section className="relative overflow-hidden border-b border-stone-200 bg-white">
          {(activeTour || selectedTourSlug) && (
            <Image
              src={getTourImage(activeTour?.slug ?? selectedTourSlug)}
              alt={displayTourTitle}
              fill
              sizes="100vw"
              className="object-cover opacity-20"
              priority
            />
          )}
          <div className="relative mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 md:flex-row md:items-center md:justify-between md:px-8 md:py-8">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.25em] text-emerald-700">
                {isEs ? "Reserva en línea" : "Book online"}
              </p>
              <h1 className="text-balance text-2xl font-black leading-tight text-stone-950 md:text-3xl">
                {hasTourFromUrl
                  ? isEs ? "Elegí fecha, paquete y listo." : "Pick date, package, and go."
                  : isEs ? "Reservá tu aventura." : "Book your adventure."}
              </h1>
              {activeTour && (
                <p className="mt-2 text-sm font-semibold text-stone-600">
                  {isEs ? "Desde" : "From"} {formatTourPrice(activeTour, isEs)} / {isEs ? "persona" : "person"}
                </p>
              )}
            </div>

            <div className="w-full rounded-2xl border border-stone-200 bg-white p-3 shadow-sm md:max-w-sm">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-emerald-700">
                  {hasTourFromUrl ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Compass className="h-3.5 w-3.5" />}
                  <span>{isEs ? "Tour" : "Tour"}</span>
                </div>

                {hasTourFromUrl ? (
                  <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-3">
                    <p className="text-sm font-semibold text-stone-900">{displayTourTitle}</p>
                    <Link
                      href="/reservar"
                      className="shrink-0 rounded-full border border-stone-300 px-3 py-1.5 text-xs font-bold text-stone-700 transition hover:border-emerald-500"
                    >
                      {isEs ? "Cambiar" : "Change"}
                    </Link>
                  </div>
                ) : (
                  <select
                    value={activeTour?.slug ?? ""}
                    onChange={(event) => {
                      setSelectedTourSlug(event.target.value);
                      document.getElementById("booking")?.scrollIntoView({ behavior: "smooth", block: "start" });
                    }}
                    className="w-full rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm font-semibold text-stone-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  >
                    {tours.map((tour) => (
                      <option key={tour.slug} value={tour.slug}>
                        {isEs ? tour.titleEs : tour.titleEn}
                      </option>
                    ))}
                  </select>
                )}

                <p className="text-xs text-stone-500">
                  {isEs ? "Paso 1: elegí fecha en el calendario." : "Step 1: pick your date on the calendar."}
                </p>
              </div>
            </div>
          </div>
        </section>

        <BookingSection selectedTourSlug={bookingTourSlug} initialPackageId={urlParams.package} />
        <MobileBottomNav />
      </main>
    </CalendarProvider>
  );
}