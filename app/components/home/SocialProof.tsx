"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";

const GALLERY_ROW_A = [
  "/image/IMG_6810.jpg", "/image/IMG_4671.jpg", "/image/IMG_4257.jpg",
  "/image/IMG_6813.jpg", "/image/IMG_3698.jpg", "/image/IMG_4943.jpg",
  "/image/IMG_4522.jpg", "/image/IMG_4200.jpg",
];

const GALLERY_ROW_B = [
  "/image/IMG_6812.jpg", "/image/IMG_3705.jpg", "/image/IMG_4917.jpg",
  "/image/IMG_4672.jpg", "/image/IMG_6809.jpg", "/image/IMG_4523.jpg",
  "/image/IMG_3751.jpg", "/image/IMG_4514.jpg",
];

// TODO: replace with real reviews (e.g. pulled from Google / TripAdvisor)
const TESTIMONIALS = [
  {
    name: "María F.",
    origin: { es: "San José, Costa Rica", en: "San José, Costa Rica" },
    es: "El color del agua no se puede describir. Los guías nos cuidaron en todo momento y las fotos que nos tomaron quedaron espectaculares.",
    en: "The color of the water can't be described. The guides looked after us the whole time and the photos they took turned out spectacular.",
  },
  {
    name: "Daniel R.",
    origin: { es: "Alajuela, Costa Rica", en: "Alajuela, Costa Rica" },
    es: "Fuimos en familia y hasta mi mamá de 60 años lo disfrutó. Todo muy bien organizado, desde la reserva en línea hasta el almuerzo típico.",
    en: "We went as a family and even my 60-year-old mom enjoyed it. Everything was well organized, from the online booking to the traditional lunch.",
  },
  {
    name: "Emily & Jake",
    origin: { es: "Texas, EE. UU.", en: "Texas, USA" },
    es: "La joya escondida de Costa Rica. Nada de multitudes: solo el cañón, el agua esmeralda y un equipo local increíble.",
    en: "Costa Rica's hidden gem. No crowds — just the canyon, the emerald water, and an amazing local crew.",
  },
];

export default function SocialProof() {
  const { lang } = useLanguage();
  const isEs = lang === "es";

  return (
    <section className="overflow-hidden bg-[#FAF9F6] py-20 md:py-28">
      {/* Testimonials */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-emerald-700">
            {isEs ? "Lo que dicen" : "What they say"}
          </p>
          <h2 className="font-display mx-auto max-w-2xl text-balance text-4xl font-bold leading-[1.02] tracking-tight text-stone-900 md:text-5xl">
            {isEs ? "Historias que salen del cañón" : "Stories that come out of the canyon"}
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <figure
              key={t.name}
              className="flex flex-col rounded-3xl border border-stone-200 bg-white p-8 shadow-[0_10px_40px_rgba(0,0,0,0.04)]"
            >
              <span className="flex gap-0.5 text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={14} className="fill-current" />
                ))}
              </span>
              <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-stone-600">
                “{isEs ? t.es : t.en}”
              </blockquote>
              <figcaption className="mt-5">
                <p className="text-sm font-bold text-stone-900">{t.name}</p>
                <p className="text-xs text-stone-500">{isEs ? t.origin.es : t.origin.en}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>

      {/* Gallery marquee */}
      <div className="mt-20 md:mt-28">
        <div className="mb-8 text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight text-stone-900 md:text-4xl">
            {isEs ? "Esto es lo que vas a vivir" : "This is what you'll experience"}
          </h2>
        </div>

        <div className="space-y-3">
          <div
            className="flex w-max gap-3"
            style={{ animation: "lva-marquee-left 60s linear infinite" }}
          >
            {[...GALLERY_ROW_A, ...GALLERY_ROW_A].map((src, i) => (
              <div
                key={`a-${src}-${i}`}
                className="relative h-44 w-64 shrink-0 overflow-hidden rounded-2xl md:h-56 md:w-80"
              >
                <Image src={src} alt="" fill sizes="320px" className="object-cover" />
              </div>
            ))}
          </div>
          <div
            className="flex w-max gap-3"
            style={{ animation: "lva-marquee-right 52s linear infinite" }}
          >
            {[...GALLERY_ROW_B, ...GALLERY_ROW_B].map((src, i) => (
              <div
                key={`b-${src}-${i}`}
                className="relative h-44 w-64 shrink-0 overflow-hidden rounded-2xl md:h-56 md:w-80"
              >
                <Image src={src} alt="" fill sizes="320px" className="object-cover" />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/galeria"
            className="group inline-flex items-center gap-2 rounded-full border border-stone-300 px-7 py-3.5 text-sm font-bold text-stone-800 transition-colors hover:border-emerald-600 hover:text-emerald-700"
          >
            {isEs ? "Ver galería completa" : "See full gallery"}
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
