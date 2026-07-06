"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ExternalLink, MapPin, MessageCircle, Plus } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import {
  LA_VIEJA_GOOGLE_MAPS_EMBED_URL,
  LA_VIEJA_GOOGLE_MAPS_URL,
  LA_VIEJA_LOCATION_LABEL,
} from "@/lib/constants/location";
import { principalContent } from "@/lib/constants/principal";
import type { TourSummary } from "@/lib/types/index";
import { WHATSAPP_HREF, formatTourPrice } from "./home-utils";

function FaqSection() {
  const { lang } = useLanguage();
  const isEs = lang === "es";
  const copy = principalContent[lang].conversion;
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="bg-white py-20 dark:bg-[#0b0a09] md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-20">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-emerald-700 dark:text-emerald-300">FAQ</p>
            <h2 className="font-display text-balance text-4xl font-bold leading-[1.02] tracking-tight text-stone-900 dark:text-stone-50 md:text-5xl">
              {copy.title}
            </h2>
            {copy.subtitle && (
              <p className="mt-4 max-w-md text-base leading-relaxed text-stone-600 dark:text-stone-300">{copy.subtitle}</p>
            )}
            <a
              href={WHATSAPP_HREF}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-7 inline-flex items-center gap-2 rounded-full border border-stone-300 px-6 py-3 text-sm font-bold text-stone-800 transition-colors hover:border-emerald-600 hover:text-emerald-700 dark:border-stone-600 dark:text-stone-200 dark:hover:border-emerald-400 dark:hover:text-emerald-300"
            >
              <MessageCircle size={16} />
              {isEs ? "¿Otra pregunta? Escribinos" : "Another question? Message us"}
            </a>
          </div>

          <div className="divide-y divide-stone-200 border-y border-stone-200 dark:divide-stone-800 dark:border-stone-800">
            {copy.faqs.map((faq, index) => {
              const isOpen = open === index;
              return (
                <div key={faq.question}>
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : index)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-4 py-5 text-left"
                  >
                    <span className="text-base font-bold text-stone-900 dark:text-stone-100 md:text-lg">{faq.question}</span>
                    <span
                      className={[
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-all duration-300",
                        isOpen
                          ? "rotate-45 border-emerald-600 bg-emerald-600 text-white"
                          : "border-stone-300 text-stone-500 dark:border-stone-600 dark:text-stone-400",
                      ].join(" ")}
                    >
                      <Plus size={15} />
                    </span>
                  </button>
                  {isOpen && (
                    <p className="pb-6 pr-12 text-sm leading-relaxed text-stone-600 dark:text-stone-300 md:text-base">
                      {faq.answer.replaceAll("**", "")}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  const { lang } = useLanguage();
  const isEs = lang === "es";

  return (
    <section className="bg-white px-4 pb-20 dark:bg-[#0b0a09] sm:px-6 md:pb-28 lg:px-8">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2.5rem]">
        <Image
          src="/ads/IMG_5668.jpg"
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/95 via-emerald-950/80 to-emerald-900/40" />

        <div className="relative px-8 py-16 md:px-16 md:py-24">
          <h2 className="font-display max-w-2xl text-balance text-4xl font-bold leading-[1.0] tracking-tight text-white md:text-6xl">
            {isEs ? "La naturaleza te espera. ¿Cuál experiencia elegís?" : "Nature is waiting. Which experience will you choose?"}
          </h2>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-white/75 md:text-lg">
            {isEs
              ? "Cupos limitados por día en cada tour — cañón, pozas, aves, volcanes y más — para cuidar el bosque y darte una experiencia sin multitudes."
              : "Limited daily spots on every tour — canyon, pools, birds, volcanoes, and more — to protect the forest and keep the experience crowd-free."}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/reservar"
              className="group inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-sm font-bold text-emerald-900 shadow-xl transition-all hover:-translate-y-0.5"
            >
              {isEs ? "Explorar experiencias" : "Explore experiences"}
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <a
              href={WHATSAPP_HREF}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white/40 px-8 py-4 text-sm font-bold text-white backdrop-blur-sm transition-colors hover:border-white hover:bg-white/10"
            >
              <MessageCircle size={16} />
              WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function HomeFooter() {
  const { lang } = useLanguage();
  const isEs = lang === "es";
  const year = new Date().getFullYear();

  const exploreLinks = [
    { href: "/tours", label: "Tours" },
    { href: "/galeria", label: isEs ? "Galería" : "Gallery" },
    { href: "/info", label: isEs ? "Información" : "Information" },
    { href: "/tiempo", label: isEs ? "Clima" : "Weather" },
    { href: "/reservar", label: isEs ? "Reservar" : "Book" },
  ];

  return (
    <footer className="bg-stone-950 text-stone-400">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)_minmax(0,0.9fr)_minmax(260px,1.1fr)]">
          <div>
            <div className="flex items-center gap-2.5">
              <Image
                src="/logo2.jpg"
                alt="La Vieja Adventures"
                width={44}
                height={44}
                className="h-11 w-11 rounded-full object-cover"
              />
              <span className="font-display text-xl font-bold tracking-tight text-white">
                La Vieja <span className="text-emerald-400">Adventures</span>
              </span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed">
              {isEs
                ? "Turismo de naturaleza local en San Carlos y Juan Castro Blanco: aves, volcanes dormidos, Ciudad Esmeralda y bosque vivo, operado por gente de la zona."
                : "Local nature tourism in San Carlos and Juan Castro Blanco: birds, dormant volcanoes, Ciudad Esmeralda, and living forest, run by locals."}
            </p>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-white">
              {isEs ? "Explorar" : "Explore"}
            </h3>
            <ul className="mt-4 space-y-2.5">
              {exploreLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm transition-colors hover:text-emerald-300">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-white">
              {isEs ? "Contacto" : "Contact"}
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <a
                  href={WHATSAPP_HREF}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 transition-colors hover:text-emerald-300"
                >
                  <MessageCircle size={15} className="text-emerald-400" />
                  +506 6233 2535
                </a>
              </li>
              <li className="inline-flex items-center gap-2">
                <MapPin size={15} className="text-emerald-400" />
                {LA_VIEJA_LOCATION_LABEL}
              </li>
            </ul>
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="text-xs font-bold uppercase tracking-widest text-white">
                {isEs ? "Como llegar" : "How to get here"}
              </h3>
              <a
                href={LA_VIEJA_GOOGLE_MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-300 transition-colors hover:text-emerald-200"
              >
                {isEs ? "Abrir" : "Open"}
                <ExternalLink size={13} />
              </a>
            </div>
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
              <iframe
                title="La Vieja Adventures en Google Maps"
                src={LA_VIEJA_GOOGLE_MAPS_EMBED_URL}
                loading="lazy"
                className="h-56 w-full"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-7 text-xs sm:flex-row">
          <p>© {year} La Vieja Adventures. {isEs ? "Todos los derechos reservados." : "All rights reserved."}</p>
          <p className="text-stone-500">Pura vida 🌿</p>
        </div>
      </div>
    </footer>
  );
}

function MobileStickyCta({ tours }: { tours: TourSummary[] }) {
  const { lang } = useLanguage();
  const isEs = lang === "es";
  const main = tours[0];

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-stone-200 bg-white/95 px-4 py-3 backdrop-blur-xl dark:border-stone-800 dark:bg-stone-950/95 md:hidden" style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom, 0px))" }}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-widest text-stone-400 dark:text-stone-500">
            {isEs ? "Desde" : "From"}
          </p>
          <p className="font-display text-lg font-bold leading-none text-stone-900 dark:text-stone-50">
            {formatTourPrice(main, isEs)}
            <span className="ml-1 text-xs font-medium text-stone-500 dark:text-stone-400">/ {isEs ? "persona" : "person"}</span>
          </p>
        </div>
        <Link
          href="/reservar"
          className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/25"
        >
          {isEs ? "Reservar ahora" : "Book now"}
          <ArrowRight size={15} />
        </Link>
      </div>
    </div>
  );
}

export default function HomeFaqFooter({ tours }: { tours: TourSummary[] }) {
  return (
    <>
      <FaqSection />
      <FinalCta />
      <HomeFooter />
      <MobileStickyCta tours={tours} />
    </>
  );
}
