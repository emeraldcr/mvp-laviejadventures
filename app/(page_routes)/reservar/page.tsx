"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, CalendarCheck, CheckCircle2, Compass, ShieldCheck } from "lucide-react";
import { CalendarProvider } from "@/lib/CalendarContext";
import { useLanguage } from "@/lib/LanguageContext";
import { useReservationData } from "@/lib/hooks/useReservationData";
import BookingSection from "@/app/components/sections/BookingSection";
import { getTourImage } from "@/lib/tour-display";

function getInitialTourSlug() {
  if (typeof window === "undefined") return "";
  return new URLSearchParams(window.location.search).get("tour")?.trim() ?? "";
}

export default function ReservarPage() {
  const { lang, toggle } = useLanguage();
  const { tours } = useReservationData();
  const [urlTourSlug] = useState(getInitialTourSlug);
  const [selectedTourSlug, setSelectedTourSlug] = useState(getInitialTourSlug);
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
    if (!selectedTourSlug && tours[0]?.slug) {
      setSelectedTourSlug(tours[0].slug);
    }
  }, [selectedTourSlug, tours]);

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
          <div className="relative mx-auto grid max-w-7xl gap-8 px-4 py-10 md:px-8 lg:grid-cols-[minmax(0,0.72fr)_minmax(360px,0.28fr)] lg:py-14">
            <div>
              <div className="mb-4 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200/25 bg-emerald-300/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.22em] text-emerald-100">
                  <CalendarCheck className="h-3.5 w-3.5" />
                  {isEs ? "Reserva dedicada" : "Dedicated booking"}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/35 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white/70">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-200" />
                  {isEs ? "Seguridad primero" : "Safety first"}
                </span>
              </div>
              <h1 className="max-w-3xl text-balance text-[clamp(2.3rem,6vw,5.5rem)] font-black leading-[0.92]">
                {hasTourFromUrl
                  ? isEs ? "Elegí la fecha y reservamos." : "Pick your date and book."
                  : isEs ? "Reservemos la aventura, paso a paso." : "Book your adventure, step by step."}
              </h1>
              <p className="mt-5 max-w-2xl text-base font-semibold leading-relaxed text-white/68 md:text-lg">
                {isEs
                  ? "Elegí el tour, revisá el calendario y completá los datos sin distracciones. Pura vida, mae: aquí vamos fino y seguro."
                  : "Choose your tour, check the calendar, and complete the details without distractions."}
              </p>
            </div>

            <div className="rounded-[10px] border border-emerald-100/20 bg-black/42 p-4 shadow-[0_24px_70px_rgba(0,0,0,0.45)] backdrop-blur-xl">
              <label className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-200">
                {hasTourFromUrl ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Compass className="h-3.5 w-3.5" />}
                {isEs ? "Tour seleccionado" : "Selected tour"}
              </label>
              {hasTourFromUrl ? (
                <div className="rounded-[8px] border border-emerald-200/25 bg-emerald-300/10 px-3 py-3">
                  <p className="text-sm font-black text-white">{displayTourTitle}</p>
                  <Link href="/reservar" className="mt-2 inline-flex text-xs font-bold text-emerald-200 underline underline-offset-4 hover:text-white">
                    {isEs ? "Cambiar tour" : "Change tour"}
                  </Link>
                </div>
              ) : (
                <select
                  value={activeTour?.slug ?? ""}
                  onChange={(event) => setSelectedTourSlug(event.target.value)}
                  className="w-full rounded-[8px] border border-white/15 bg-white/10 px-3 py-3 text-sm font-black text-white outline-none transition focus:border-emerald-200/60"
                >
                  {tours.map((tour) => (
                    <option key={tour.slug} value={tour.slug} className="bg-zinc-950 text-white">
                      {isEs ? tour.titleEs : tour.titleEn}
                    </option>
                  ))}
                </select>
              )}
              {activeTour?.descriptionEs && (
                <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-white/60">
                  {isEs ? activeTour.descriptionEs : activeTour.descriptionEn}
                </p>
              )}
            </div>
          </div>
        </section>

        <BookingSection selectedTourSlug={bookingTourSlug} />
      </main>
    </CalendarProvider>
  );
}
