"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { localizeHref } from "@/lib/i18n";
import {
  ArrowRight,
  MapPin,
  MessageCircle,
} from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import { BOOKING_HREF, localizedHomeWhatsAppHref, primaryBookingLabel } from "./home-utils";

export default function HomeHero() {
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
    let cancel = () => {};
    if ("requestIdleCallback" in window) {
      const idle = window.requestIdleCallback(enable, { timeout: 1800 });
      cancel = () => window.cancelIdleCallback(idle);
    } else {
      const timeout = globalThis.setTimeout(enable, 1200);
      cancel = () => globalThis.clearTimeout(timeout);
    }
    preference.addEventListener("change", enable);
    return () => {
      preference.removeEventListener("change", enable);
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

      <div className="relative mx-auto flex min-h-[100svh] w-full max-w-[1600px] flex-col px-4 pb-5 pt-28 sm:px-7 md:pt-32 lg:px-10">
        <div className="flex items-center justify-between gap-4">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/25 px-4 py-2 text-[10px] font-extrabold uppercase tracking-[0.2em] backdrop-blur-md sm:text-xs">
            <MapPin size={13} className="text-[#00C4B0]" />
            {isEs ? "San Carlos · Costa Rica" : "San Carlos · Costa Rica"}
          </span>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center pb-28 pt-12 text-center sm:pb-32">
          <p className="mb-4 flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.32em] text-white/80 sm:text-xs">
            <span className="h-px w-8 bg-[#00C4B0]" />
            {isEs ? "Cañón del Río La Vieja" : "La Vieja River Canyon"}
            <span className="h-px w-8 bg-[#00C4B0]" />
          </p>

          <h1 className="max-w-full font-display text-[clamp(2.65rem,10.1vw,10.5rem)] font-black uppercase leading-[1.04] tracking-[-0.035em] drop-shadow-[0_8px_30px_rgba(0,0,0,.42)] md:leading-[0.9] md:tracking-[-0.055em]">
            {isEs ? "CIUDAD" : "EMERALD"}
            <span className="mt-2 block text-[#00C4B0]">
              {isEs ? "ESMERALDA" : "CITY"}
            </span>
          </h1>

          <p className="mt-7 max-w-xl text-balance text-sm font-semibold leading-relaxed text-white/85 sm:text-base md:text-lg">
            {isEs
              ? "El cañón insignia de La Vieja Adventures: sendero, río y las pozas turquesa de la Cascada El Zafiro, con guía local bilingüe y grupos pequeños. Si el clima cambia, ajustamos la ruta o le reprogramamos sin costo."
              : "La Vieja Adventures' signature canyon: trail, river, and the turquoise pools of El Zafiro Waterfall, with a local bilingual guide and small groups. If the weather turns, we adjust the route or rebook you at no cost."}
          </p>

          <div className="mt-7 flex flex-col items-center gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
            <Link
              href={localizeHref(BOOKING_HREF, lang)}
              className="group inline-flex min-h-14 items-center justify-center gap-3 rounded-full bg-[#00C4B0] px-7 text-xs font-black uppercase tracking-[0.12em] text-[#17211f] shadow-[0_18px_50px_rgba(0,196,176,.28)] transition hover:-translate-y-0.5 hover:bg-white"
            >
              {primaryBookingLabel(isEs)}
              <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-14 items-center justify-center gap-3 rounded-full border border-white/30 bg-black/22 px-7 text-xs font-black uppercase tracking-[0.12em] text-white backdrop-blur-md transition hover:border-white/60 hover:bg-white/12"
            >
              <MessageCircle size={17} />
              {isEs ? "Hablar con un guía" : "Talk to a guide"}
            </a>
          </div>

        </div>
      </div>
      <button type="button" onClick={toggleVideo} aria-pressed={paused} aria-label={isEs ? (paused ? "Reproducir video de fondo" : "Pausar video de fondo") : (paused ? "Play background video" : "Pause background video")} className="absolute bottom-4 right-4 z-10 inline-flex min-h-11 items-center gap-2 rounded-full border border-white/40 bg-black/70 px-4 py-2 text-sm font-semibold text-white sm:bottom-36">
        {paused ? <Play size={16} aria-hidden /> : <Pause size={16} aria-hidden />}{isEs ? (paused ? "Reproducir" : "Pausar video") : (paused ? "Play video" : "Pause video")}
      </button>
    </section>
  );
}
