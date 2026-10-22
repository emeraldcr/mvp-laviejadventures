"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Image as ImageIcon, Pause, Play } from "lucide-react";
import { localizeHref, tourDifficulty, tourDuration } from "@/lib/i18n";
import {
  ArrowRight,
  MapPin,
  MessageCircle,
} from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import type { TourSummary } from "@/lib/types/index";
import { getTourPriceDisplay, BOOKING_HREF, localizedHomeWhatsAppHref, primaryBookingLabel } from "./home-utils";

export default function HomeHero({ tour }: { tour?: TourSummary }) {
  const { lang } = useLanguage();
  const isEs = lang === "es";
  const whatsappHref = localizedHomeWhatsAppHref(isEs);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [paused, setPaused] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(false);
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (preference.matches) return;
    const enable = () => setVideoEnabled(true);
    const handlePreferenceChange = (event: MediaQueryListEvent) => {
      if (!event.matches) enable();
    };
    let cancel = () => {};
    if ("requestIdleCallback" in window) {
      const idle = window.requestIdleCallback(enable, { timeout: 1800 });
      cancel = () => window.cancelIdleCallback(idle);
    } else {
      const timeout = globalThis.setTimeout(enable, 1200);
      cancel = () => globalThis.clearTimeout(timeout);
    }
    preference.addEventListener("change", handlePreferenceChange);
    return () => {
      preference.removeEventListener("change", handlePreferenceChange);
      cancel();
    };
  }, []);
  useEffect(() => {
    if (!videoEnabled) return;
    void videoRef.current?.play().catch(() => {});
  }, [videoEnabled]);
  const toggleVideo = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) void video.play().catch(() => {}); else video.pause();
  };

  return (
    <section className="relative min-h-[100svh] overflow-hidden bg-[#2E2A25] text-white">
      <Image src="/hero/ciudad-esmeralda-poster.webp" alt="" fill priority loading="eager" fetchPriority="high" sizes="100vw" className="object-cover" />
      {videoEnabled && (
        <video
          id="home-hero-video"
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover"
          muted
          loop
          playsInline
          preload="none"
          poster="/hero/ciudad-esmeralda-poster.webp"
          aria-hidden="true"
          onPlay={() => setPaused(false)}
          onPause={() => setPaused(true)}
        >
          <source src="/hero/ciudad-esmeralda-hero.mp4" type="video/mp4" />
        </video>
      )}

      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,12,11,.52)_0%,rgba(8,10,9,.12)_33%,rgba(7,9,8,.55)_72%,rgba(6,7,6,.96)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,transparent_10%,rgba(0,0,0,.22)_72%)]" />
      <div className="pointer-events-none absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-black/28 to-transparent" />

      <div className="relative mx-auto flex min-h-[100svh] w-full max-w-[1600px] flex-col px-4 pb-5 pt-20 sm:px-7 sm:pt-28 md:pt-32 lg:px-10 max-[700px]:pt-16">
        <div className="flex items-center justify-between gap-4">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/25 px-4 py-2 text-[10px] font-extrabold uppercase tracking-[0.2em] backdrop-blur-md sm:text-xs">
            <MapPin size={13} className="text-[#00C4B0]" />
            {isEs ? "San Carlos · Costa Rica" : "San Carlos · Costa Rica"}
          </span>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center pb-16 pt-6 text-center sm:pb-28 sm:pt-10 max-[700px]:justify-center max-[700px]:pb-12">
          <h1 className="max-w-full font-display text-[clamp(2.25rem,9vw,9rem)] font-black uppercase leading-[0.95] tracking-[-0.035em] drop-shadow-[0_8px_30px_rgba(0,0,0,.42)] md:leading-[0.9] md:tracking-[-0.055em]">
            {isEs ? "CIUDAD" : "EMERALD"}
            <span className="mt-2 block text-[#00C4B0]">
              {isEs ? "ESMERALDA" : "CITY"}
            </span>
          </h1>

          <p className="mt-5 max-w-lg text-balance text-sm font-semibold leading-relaxed text-white/85 sm:mt-6 sm:text-base md:text-lg">
            {isEs
              ? "Río, bosque y pozas turquesa en Ciudad Esmeralda, con un guía local que cuida cada paso."
              : "River, forest, and turquoise pools at Ciudad Esmeralda, with a local guide caring for every step."}
          </p>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.16em] sm:text-xs">
            <span className="rounded-full border border-amber-200/50 bg-amber-300/15 px-3 py-1.5 text-amber-100 backdrop-blur-sm">
              {isEs ? "Aventura intensa" : "Intense adventure"}
            </span>
            <span className="text-white/75">
              {isEs
                ? "También: pozas cristalinas, bosque nuboso, aves y experiencias premium"
                : "Also: crystal pools, cloud forest, birding, and premium escapes"}
            </span>
          </div>

          <div className="mt-6 flex w-full max-w-sm flex-col items-stretch gap-3 sm:mt-7 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:justify-center">
            <Link
              href={localizeHref(BOOKING_HREF, lang)}
              className="lva-home-button group inline-flex items-center justify-center gap-3 bg-[#00C4B0] text-xs uppercase tracking-[0.12em] text-[#17211f] shadow-[0_18px_50px_rgba(0,196,176,.28)] transition hover:-translate-y-0.5 hover:bg-white sm:px-7"
            >
              {primaryBookingLabel(isEs)}
              <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="lva-home-button inline-flex items-center justify-center gap-3 border border-white/30 bg-black/22 px-6 text-xs font-black uppercase tracking-[0.12em] text-white backdrop-blur-md transition hover:border-white/60 hover:bg-white/12 sm:px-7"
            >
              <MessageCircle size={17} />
              {isEs ? "Hablar con un guía" : "Talk to a guide"}
            </a>
          </div>
          <p className="mt-2 max-w-sm text-[11px] font-semibold leading-relaxed text-white/80 sm:text-xs">
            {isEs ? "Sin pago hasta confirmar disponibilidad." : "No payment until availability is confirmed."}
          </p>
          {tour && <p className="mt-3 max-w-xl text-xs font-bold leading-relaxed text-white/75 sm:text-sm">
            {tourDuration(tour.duration ?? "", lang)} · {tourDifficulty(tour.difficulty ?? "", lang)} · {isEs ? "desde" : "from"} {getTourPriceDisplay(tour, isEs).compact}/{isEs ? "persona" : "person"} · {isEs ? "cupos sujetos a confirmación" : "spaces subject to confirmation"}
          </p>}

          <Link
            href="#descubrir"
            className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full border border-white/35 bg-black/20 px-5 py-2 text-xs font-black uppercase tracking-[0.12em] text-white backdrop-blur-md transition hover:border-white/70 hover:bg-white/15"
          >
            {isEs ? "Elegí tu tipo de día" : "Choose your kind of day"}
          </Link>

        </div>
      </div>
      {videoEnabled ? (
        <button type="button" onClick={toggleVideo} aria-pressed={!paused} aria-label={isEs ? (paused ? "Reproducir video de fondo" : "Pausar video de fondo") : (paused ? "Play background video" : "Pause background video")} className="absolute bottom-20 right-3 z-10 inline-flex min-h-11 items-center gap-2 rounded-full border border-white/55 bg-black/80 px-4 py-2 text-sm font-semibold text-white shadow-lg sm:bottom-36 sm:right-4">
          {paused ? <Play size={16} aria-hidden /> : <Pause size={16} aria-hidden />}{isEs ? (paused ? "Reproducir" : "Pausar video") : (paused ? "Play video" : "Pause video")}
        </button>
      ) : (
        <div className="absolute bottom-20 right-3 z-10 inline-flex min-h-11 items-center gap-2 rounded-full border border-white/40 bg-black/80 px-4 py-2 text-sm font-semibold text-white backdrop-blur-md shadow-lg sm:bottom-36 sm:right-4" role="status">
          <ImageIcon size={16} aria-hidden />
          {isEs ? "Vista de portada" : "Poster view"}
        </div>
      )}
    </section>
  );
}
