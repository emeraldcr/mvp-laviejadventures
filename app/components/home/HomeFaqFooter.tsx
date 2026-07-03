"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin, MessageCircle, Plus } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import { principalContent } from "@/lib/constants/principal";
import type { TourSummary } from "@/lib/types/index";
import { WHATSAPP_HREF, formatTourPrice } from "./home-utils";

function FaqSection() {
  const { lang } = useLanguage();
  const isEs = lang === "es";
  const copy = principalContent[lang].conversion;
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="bg-white py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-20">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-emerald-700">FAQ</p>
            <h2 className="font-display text-balance text-4xl font-bold leading-[1.02] tracking-tight text-stone-900 md:text-5xl">
              {copy.title}
            </h2>
            {copy.subtitle && (
              <p className="mt-4 max-w-md text-base leading-relaxed text-stone-600">{copy.subtitle}</p>
            )}
            <a
              href={WHATSAPP_HREF}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-7 inline-flex items-center gap-2 rounded-full border border-stone-300 px-6 py-3 text-sm font-bold text-stone-800 transition-colors hover:border-emerald-600 hover:text-emerald-700"
            >
              <MessageCircle size={16} />
              {isEs ? "¿Otra pregunta? Escribinos" : "Another question? Message us"}
            </a>
          </div>

          <div className="divide-y divide-stone-200 border-y border-stone-200">
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
                    <span className="text-base font-bold text-stone-900 md:text-lg">{faq.question}</span>
                    <span
                      className={[
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-all duration-300",
                        isOpen
                          ? "rotate-45 border-emerald-600 bg-emerald-600 text-white"
                          : "border-stone-300 text-stone-500",
                      ].join(" ")}
                    >
                      <Plus size={15} />
                    </span>
                  </button>
                  {isOpen && (
                    <p className="pb-6 pr-12 text-sm leading-relaxed text-stone-600 md:text-base">
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
    <section className="bg-white px-4 pb-20 sm:px-6 md:pb-28 lg:px-8">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2.5rem]">
        <Image
          src="/image/IMG_6810.jpg"
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/95 via-emerald-950/80 to-emerald-900/40" />

        <div className="relative px-8 py-16 md:px-16 md:py-24">
          <h2 className="font-display max-w-2xl text-balance text-4xl font-bold leading-[1.0] tracking-tight text-white md:text-6xl">
            {isEs ? "El río está esperando. ¿Y vos?" : "The river is waiting. Are you?"}
          </h2>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-white/75 md:text-lg">
            {isEs
              ? "Cupos limitados por día para cuidar el cañón y darte una experiencia sin multitudes."
              : "Limited spots per day to protect the canyon and give you a crowd-free experience."}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/reservar"
              className="group inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-sm font-bold text-emerald-900 shadow-xl transition-all hover:-translate-y-0.5"
            >
              {isEs ? "Reservar mi aventura" : "Book my adventure"}
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
        <div className="grid gap-12 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)]">
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
                ? "Turismo de aventura local en el Río La Vieja y Ciudad Esmeralda, San Carlos. Operado por gente de la zona que conoce y cuida el cañón."
                : "Local adventure tourism on the La Vieja River and Ciudad Esmeralda, San Carlos. Run by locals who know and protect the canyon."}
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
                {isEs ? "San Carlos, Alajuela, Costa Rica" : "San Carlos, Alajuela, Costa Rica"}
              </li>
            </ul>
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
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-stone-200 bg-white/95 px-4 py-3 backdrop-blur-xl md:hidden" style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom, 0px))" }}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-widest text-stone-400">
            {isEs ? "Desde" : "From"}
          </p>
          <p className="font-display text-lg font-bold leading-none text-stone-900">
            {formatTourPrice(main, isEs)}
            <span className="ml-1 text-xs font-medium text-stone-500">/ {isEs ? "persona" : "person"}</span>
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
