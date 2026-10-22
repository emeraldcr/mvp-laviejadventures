"use client";

import { localizeHref } from "@/lib/i18n";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import { BOOKING_HREF, localizedHomeWhatsAppHref, primaryBookingLabel } from "./home-utils";
import PageFooter from "@/app/components/sections/PageFooter";
import { BOOKING_ASSURANCE_EN, BOOKING_ASSURANCE_ES } from "@/lib/tour-policy";

function FinalCta() {
  const { lang } = useLanguage();
  const isEs = lang === "es";

  return (
    <section className="lva-home-section--paper px-4 pb-20 sm:px-6 md:pb-28 lg:px-8">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[var(--lva-radius-panel)]">
        <Image
          src="/image/IMG_6812.webp"
          alt={isEs ? "Cascada El Zafiro en Ciudad Esmeralda" : "El Zafiro Waterfall at Ciudad Esmeralda"}
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/95 via-emerald-950/80 to-emerald-900/40" />

        <div className="relative px-8 py-16 md:px-16 md:py-24">
          <h2 className="font-display max-w-2xl text-balance text-4xl font-bold leading-[1.0] tracking-tight text-white md:text-6xl">
            {isEs ? "Reserve su lugar en Ciudad Esmeralda" : "Reserve your spot on Ciudad Esmeralda"}
          </h2>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-white/75 md:text-lg">
            {isEs
              ? `Trabajamos con grupos pequeños a propósito: protege el bosque y el cañón se disfruta mejor sin multitudes. ${BOOKING_ASSURANCE_ES}`
              : `We keep groups small on purpose: it protects the forest and the canyon feels better without a crowd. ${BOOKING_ASSURANCE_EN}`}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={localizeHref(BOOKING_HREF, lang)}
              className="group inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-sm font-bold text-emerald-900 shadow-xl transition-all hover:-translate-y-0.5"
            >
              {primaryBookingLabel(isEs)}
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <a
              href={localizedHomeWhatsAppHref(isEs)}
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

export default function HomeFaqFooter() {
  return (
    <>
      <FinalCta />
      <PageFooter />
    </>
  );
}
