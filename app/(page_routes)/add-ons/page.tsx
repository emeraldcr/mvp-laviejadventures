"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import AddOnsExperience from "@/app/components/reservation/AddOnsExperience";

export default function AddOnsPage() {
  const { lang, toggle } = useLanguage();

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-zinc-950/85 backdrop-blur-2xl">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 md:px-8">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logo2.jpg"
              alt="La Vieja Adventures Logo"
              width={40}
              height={40}
              className="rounded-md object-cover shadow-md shadow-black/30"
              priority
            />
            <span className="hidden text-sm font-black tracking-tight text-white sm:inline md:text-base">
              La Vieja Adventures
            </span>
          </Link>

          <nav className="flex items-center gap-2 text-xs font-semibold text-zinc-200 md:gap-4 md:text-sm">
            <Link href="/tours" className="transition-colors hover:text-white">
              {lang === "es" ? "Tours" : "Tours"}
            </Link>
            <Link href="/reservar" className="rounded-full border border-emerald-300/40 bg-emerald-400/10 px-3 py-1 text-emerald-200 transition hover:bg-emerald-400/20">
              {lang === "es" ? "Reservar" : "Reserve"}
            </Link>
            <button
              type="button"
              onClick={toggle}
              className="min-w-10 rounded-full border border-zinc-500/80 bg-white/10 px-3 py-1 text-center font-bold text-white transition hover:border-emerald-200 hover:bg-emerald-400/20"
              aria-label={lang === "es" ? "Switch to English" : "Cambiar a Espanol"}
            >
              {lang === "es" ? "EN" : "ES"}
            </button>
          </nav>
        </div>
      </header>

      <section className="border-b border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.22),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(20,184,166,0.16),transparent_28%)]">
        <div className="mx-auto grid min-h-[360px] w-full max-w-7xl gap-8 px-4 py-10 md:px-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(320px,0.42fr)] lg:items-end lg:py-14">
          <div>
            <Link
              href="/reservar"
              className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-emerald-200 transition hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
              {lang === "es" ? "Volver a reservar" : "Back to booking"}
            </Link>
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-emerald-300">
              {lang === "es" ? "Extras de reserva" : "Reservation add-ons"}
            </p>
            <h1 className="mt-3 max-w-4xl text-4xl font-black leading-[0.98] tracking-tight text-white sm:text-5xl lg:text-6xl">
              {lang === "es" ? "Comida, hospedaje y transporte para cerrar el paseo redondo." : "Food, lodging, and transport to complete the trip."}
            </h1>
            <p className="mt-5 max-w-2xl text-base font-medium leading-relaxed text-zinc-300 sm:text-lg">
              {lang === "es"
                ? "Aquí puede revisar los extras disponibles antes de reservar. Los precios son base en USD y cualquier detalle especial se confirma antes de operar, pura vida y sin inventar disponibilidad."
                : "Review available add-ons before booking. Prices are base USD rates and special details are confirmed before operation."}
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-300/20 bg-emerald-400/10 p-5">
            <ShieldCheck className="h-7 w-7 text-emerald-200" aria-hidden />
            <h2 className="mt-4 text-xl font-black text-white">
              {lang === "es" ? "Seguridad primero" : "Safety first"}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-emerald-50/80">
              {lang === "es"
                ? "Transporte y hospedaje se coordinan según clima, camino, horario y disponibilidad real. Si el río viene crecido, buscamos alternativa segura."
                : "Transport and lodging are coordinated by weather, road conditions, schedule, and real availability. If river conditions rise, we choose a safer alternative."}
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-7xl px-4 py-8 md:px-8">
        <AddOnsExperience
          lang={lang}
          selectedAddons={[]}
          addonDetails={{}}
          showReserveLink
        />
      </div>
    </main>
  );
}
