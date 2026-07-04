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

export default function ReservarPage() {
  const { lang, toggle } = useLanguage();
  const { tours } = useReservationData();
  const [urlTourSlug, setUrlTourSlug] = useState("");
  const [selectedTourSlug, setSelectedTourSlug] = useState("");
  const [hasReadUrl, setHasReadUrl] = useState(false);
  const isEs = lang === "es";
  const hasTourFromUrl = urlTourSlug.length > 0;

  const activeTour = useMemo(
    () => selectedTourSlug ? tours.find((tour) => tour.slug === selectedTourSlug) ?? null : tours[0] ?? null,
    [selectedTourSlug, tours],
  );
  const bookingTourSlug = selectedTourSlug || activeTour?.slug || null;
  const displayTourTitle = activeTour
    ? (isEs ? activeTour.titleEs : activeTour.titleEn)
    : selectedTourSlug.replace(/-/g, " ");

  useEffect(() => {
    const tourFromUrl = new URLSearchParams(window.location.search).get("tour")?.trim() ?? "";
    if (tourFromUrl) {
      setUrlTourSlug(tourFromUrl);
      setSelectedTourSlug(tourFromUrl);
    }
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
    window.history.replaceState({}, "", `${url.pathname}${url.search}`);
  }, [selectedTourSlug]);

  useEffect(() => {
    if (!hasTourFromUrl) return;
    const frameId = window.requestAnimationFrame(() => {
      document.getElementById("booking")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    return () => window.cancelAnimationFrame(frameId);
  }, [hasTourFromUrl]);

  return (
    <CalendarProvider selectedTourSlug={bookingTourSlug}>
      <main className="min-h-screen bg-[#030807] text-white">
        <header className="sticky top-0 z-40 border-b border-emerald-100/15 bg-emerald-950/86 shadow-[0_14px_44px_rgba(0,0,0,0.44)] backdrop-blur-2xl">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">
            <Link href="/" className="flex min-w-0 items-center gap-3">
              <Image
                src="/logo2.jpg"
                alt="La Vieja Adventures"
                width={42}
                height={42}
                className="rounded-lg border border-emerald-100/20 object-cover"
                priority
              />
              <span className="truncate text-sm font-black md:text-base">La Vieja Adventures</span>
            </Link>
            <nav className="flex items-center gap-2">
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-3 py-2 text-xs font-black uppercase tracking-wider text-white/80 transition hover:border-emerald-200/50 hover:text-white"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{isEs ? "Inicio" : "Home"}</span>
              </Link>
              <button
                type="button"
                onClick={toggle}
                className="rounded-full border border-white/15 bg-white/8 px-3 py-2 text-xs font-black text-white transition hover:border-emerald-200/50"
                aria-label={isEs ? "Switch to English" : "Cambiar a Espanol"}
              >
                {isEs ? "EN" : "ES"}
              </button>
            </nav>
          </div>
        </header>

        <section className="relative overflow-hidden border-b border-white/10">
          {(activeTour || selectedTourSlug) && (
            <Image
              src={getTourImage(activeTour?.slug ?? selectedTourSlug)}
              alt={displayTourTitle}
              fill
              sizes="100vw"
              className="object-cover opacity-30"
              priority
            />
          )}
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(3,8,7,0.96),rgba(3,8,7,0.80)_48%,rgba(3,8,7,0.42)),linear-gradient(180deg,rgba(3,8,7,0.65),rgba(3,8,7,0.96))]" />
          <div className="relative mx-auto flex max-w-7xl flex-col gap-3 px-4 py-5 md:flex-row md:items-center md:justify-between md:px-8 md:py-6">
            <h1 className="text-balance text-2xl font-black leading-tight md:text-3xl">
              {hasTourFromUrl
                ? isEs ? "Elegí la fecha y reservamos." : "Pick your date and book."
                : isEs ? "Reservá tu aventura." : "Book your adventure."}
            </h1>

            <div className="w-full rounded-[16px] border border-emerald-100/20 bg-gradient-to-br from-black/75 via-emerald-950/40 to-black/60 p-3 shadow-[0_24px_70px_rgba(0,0,0,0.35)] backdrop-blur-xl md:max-w-sm">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.24em] text-emerald-200">
                  {hasTourFromUrl ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Compass className="h-3.5 w-3.5" />}
                  <span>{isEs ? "Tour seleccionado" : "Selected tour"}</span>
                </div>

                {hasTourFromUrl ? (
                  <div className="flex items-center justify-between gap-3 rounded-2xl border border-emerald-200/20 bg-emerald-300/10 px-3 py-3 shadow-sm shadow-emerald-950/10">
                    <p className="text-sm font-semibold text-white">{displayTourTitle}</p>
                    <Link href="/reservar" className="shrink-0 rounded-full bg-white/5 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-emerald-200 transition hover:bg-white/10 hover:text-white">
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
                    className="w-full rounded-2xl border border-white/15 bg-zinc-950/80 px-3 py-3 text-sm font-semibold text-white outline-none ring-1 ring-transparent transition duration-200 focus:border-emerald-300/70 focus:ring-emerald-200/15"
                  >
                    {tours.map((tour) => (
                      <option key={tour.slug} value={tour.slug} className="bg-zinc-950 text-white">
                        {isEs ? tour.titleEs : tour.titleEn}
                      </option>
                    ))}
                  </select>
                )}

                <p className="text-xs text-zinc-300">{isEs ? "Siguiente paso: elegí tu fecha en el calendario abajo." : "Next step: pick your date in the calendar below."}</p>
              </div>
            </div>
          </div>
        </section>

        <BookingSection selectedTourSlug={bookingTourSlug} />
        <MobileBottomNav />
      </main>
    </CalendarProvider>
  );
}
