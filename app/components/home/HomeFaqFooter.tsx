"use client";

import { localizeHref } from "@/lib/i18n";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ExternalLink, MapPin, MessageCircle } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import {
  LA_VIEJA_GOOGLE_MAPS_EMBED_URL,
  LA_VIEJA_GOOGLE_MAPS_URL,
  LA_VIEJA_LOCATION_LABEL,
} from "@/lib/constants/location";
import { BOOKING_HREF, WHATSAPP_HREF, primaryBookingLabel } from "./home-utils";

function FinalCta() {
  const { lang } = useLanguage();
  const isEs = lang === "es";

  return (
    <section className="bg-white px-4 pb-20 dark:bg-[#0b0a09] sm:px-6 md:pb-28 lg:px-8">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2.5rem]">
        <Image
          src="/image/IMG_6812.jpg"
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
              ? "Trabajamos con grupos pequeños a propósito: protege el bosque y el cañón se disfruta mejor sin multitudes. Si el clima o el río no acompañan, le avisamos y reprogramamos sin costo. Pago seguro y cancelación gratuita hasta 48 h antes."
              : "We keep groups small on purpose: it protects the forest and the canyon feels better without a crowd. If the weather or river don't cooperate, we let you know and rebook at no cost. Secure payment and free cancellation up to 48h before."}
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
    { href: BOOKING_HREF, label: isEs ? "Reservar" : "Book" },
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
                ? "Operador local de turismo de aventura en San Carlos, Costa Rica. Ciudad Esmeralda es nuestra salida insignia: sendero, río, cañón y pozas turquesa, con guías de la zona."
                : "A local adventure-tourism operator in San Carlos, Costa Rica. Ciudad Esmeralda is our signature outing: trail, river, canyon, and turquoise pools, with local guides."}
            </p>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-white">
              {isEs ? "Explorar" : "Explore"}
            </h3>
            <ul className="mt-4 space-y-2.5">
              {exploreLinks.map((link) => (
                <li key={link.href}>
                  <Link href={localizeHref(link.href, lang)} className="text-sm transition-colors hover:text-emerald-300">
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

export default function HomeFaqFooter() {
  return (
    <>
      <FinalCta />
      <HomeFooter />

    </>
  );
}
