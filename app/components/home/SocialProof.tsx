"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";
import GoogleRating from "@/app/components/GoogleRating";
import { useLanguage } from "@/lib/LanguageContext";
import { formatGoogleReviewsDate, GOOGLE_REVIEWS } from "@/lib/site-config";

const GALLERY_ROW_A = [
  "/image/IMG_6810.webp", "/image/IMG_4671.webp", "/image/IMG_4257.webp",
  "/image/IMG_6813.webp", "/image/IMG_3698.webp", "/image/IMG_4943.webp",
  "/image/IMG_4522.webp", "/image/IMG_4200.webp",
];

const GALLERY_ROW_B = [
  "/image/IMG_6812.webp", "/image/IMG_3705.webp", "/image/IMG_4917.webp",
  "/image/IMG_4672.webp", "/image/IMG_6809.webp", "/image/IMG_4523.webp",
  "/image/IMG_3751.webp", "/image/IMG_4514.webp",
];

export default function SocialProof() {
  const { lang } = useLanguage();
  const isEs = lang === "es";
  const updatedAt = formatGoogleReviewsDate(lang);

  return (
    <section className="overflow-hidden bg-[#FAF9F6] py-20 dark:bg-[#0b0a09] md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-emerald-700 dark:text-emerald-300">
            {isEs ? "Reseñas públicas" : "Public reviews"}
          </p>
          <h2 className="font-display mx-auto max-w-2xl text-balance text-4xl font-bold leading-[1.02] tracking-tight text-stone-900 dark:text-stone-50 md:text-5xl">
            {isEs ? "Lo que puede comprobar en Google" : "What you can verify on Google"}
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-stone-600 dark:text-stone-300">
            {isEs
              ? "No publicamos citas atribuidas sin autorización ni fuente. Consulte las reseñas originales directamente en el perfil público de La Vieja Adventures."
              : "We do not publish attributed quotes without permission or a verifiable source. Read the original reviews directly on La Vieja Adventures' public profile."}
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-[1.1fr_.9fr]">
          <article className="rounded-3xl border border-stone-200 bg-white p-8 shadow-[0_10px_40px_rgba(0,0,0,0.04)] dark:border-stone-800 dark:bg-white/[0.03]">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-300">
              {isEs ? "Resumen del listado" : "Listing summary"}
            </p>
            <h3 className="mt-3 font-display text-2xl font-bold text-stone-900 dark:text-stone-50">
              {isEs ? "Reseñas reales, en su fuente" : "Real reviews, at their source"}
            </h3>
            <div className="mt-6">
              <GoogleRating locale={lang} />
            </div>
            <p className="mt-5 text-sm leading-relaxed text-stone-600 dark:text-stone-300">
              {isEs
                ? "La calificación y el conteo corresponden al resumen del listado de Google. El contenido completo, los nombres y las fechas de cada reseña se consultan allí."
                : "The rating and count come from the Google listing summary. Full review text, names, and dates remain available there."}
            </p>
            <p className="mt-4 text-xs font-semibold text-stone-500 dark:text-stone-400">
              {isEs ? `Dato actualizado: ${updatedAt}.` : `Updated: ${updatedAt}.`}
            </p>
          </article>

          <a
            href={GOOGLE_REVIEWS.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex min-h-56 flex-col justify-between rounded-3xl bg-[#2e2a25] p-8 text-white shadow-[0_10px_40px_rgba(0,0,0,0.12)] transition hover:-translate-y-1 hover:bg-[#403a33]"
          >
            <div>
              <ExternalLink className="text-[#70eee1]" size={24} aria-hidden="true" />
              <h3 className="mt-6 font-display text-2xl font-bold">
                {isEs ? "Leer las reseñas completas" : "Read the full reviews"}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-white/70">
                {isEs ? "Abrir el perfil de La Vieja Adventures en Google y revisar la fuente original." : "Open La Vieja Adventures on Google and review the original source."}
              </p>
            </div>
            <span className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-[#70eee1]">
              {isEs ? "Ver en Google" : "View on Google"}
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </span>
          </a>
        </div>
      </div>

      {/* Gallery marquee */}
      <div className="mt-20 md:mt-28">
        <div className="mb-8 text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-50 md:text-4xl">
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
            className="group inline-flex items-center gap-2 rounded-full border border-stone-300 px-7 py-3.5 text-sm font-bold text-stone-800 transition-colors hover:border-emerald-600 hover:text-emerald-700 dark:border-stone-600 dark:text-stone-200 dark:hover:border-emerald-400 dark:hover:text-emerald-300"
          >
            {isEs ? "Ver galería completa" : "See full gallery"}
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
