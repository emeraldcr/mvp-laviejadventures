"use client";

import { localizeHref } from "@/lib/i18n";

import Link from "next/link";
import { ArrowRight, CalendarDays, Clock3, MapPin, MessageCircle, ShieldCheck, Users } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import { BOOKING_HREF, localizedHomeWhatsAppHref, primaryBookingLabel } from "./home-utils";

export default function HomeConversionRail() {
  const { lang } = useLanguage();
  const isEs = lang === "es";
  const whatsappHref = localizedHomeWhatsAppHref(isEs);
  const logistics = isEs
    ? [
        { icon: MapPin, value: "San Carlos", label: "Sucre de Ciudad Quesada" },
        { icon: Users, value: "Grupos pequeños", label: "Guía local bilingüe" },
        { icon: Clock3, value: "3–4 horas", label: "Sendero, cañón y Cascada El Zafiro" },
      ]
    : [
        { icon: MapPin, value: "San Carlos", label: "Sucre de Ciudad Quesada" },
        { icon: Users, value: "Small groups", label: "Local bilingual guide" },
        { icon: Clock3, value: "3–4 hours", label: "Trail, canyon & El Zafiro Waterfall" },
      ];

  return (
      <section className="lva-home-section relative z-10 px-4 py-10 sm:px-6 md:py-14 lg:px-8">
        <div className="mx-auto grid max-w-7xl overflow-hidden rounded-[var(--lva-radius-panel)] border border-[var(--lva-border)] bg-[var(--lva-section-dark-bg)] text-white shadow-none lg:grid-cols-[1.15fr_.85fr]">
          <div className="p-7 sm:p-9 lg:p-12">
            <span className="lva-home-kicker inline-flex items-center gap-2 text-[var(--lva-section-dark-accent)]">
              <ShieldCheck size={14} />
              {isEs ? "Reserva en línea · precio claro" : "Online booking · clear pricing"}
            </span>
            <h2 className="mt-5 max-w-2xl font-display text-balance text-3xl font-black leading-[1.02] tracking-tight sm:text-4xl lg:text-5xl">
              {isEs ? "Encuentre su salida y reserve con claridad." : "Find your kind of adventure and book clearly."}
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/68 sm:text-base">
              {isEs
                ? "Después de comparar las experiencias, elija la fecha y el número de personas. Verá el precio final y la política aplicable antes de pagar. ¿Dudas? Nuestro equipo le ayuda por WhatsApp."
                : "After comparing the experiences, choose your date and group size. You will see the final price and applicable policy before paying. Questions? Our team can help on WhatsApp."}
            </p>
          </div>

          <div className="grid gap-px bg-white/10 sm:grid-cols-2 lg:grid-cols-1">
            <Link
              href={localizeHref(BOOKING_HREF, lang)}
              className="group flex min-h-28 items-center justify-between gap-5 bg-[var(--lva-accent-bright)] p-6 text-[var(--lva-accent-ink)] transition hover:bg-[var(--lva-section-dark-accent)] lg:px-8"
            >
              <span>
                <CalendarDays size={20} />
                <strong className="mt-3 block text-base font-black">{primaryBookingLabel(isEs)}</strong>
                <span className="mt-1 block text-xs font-semibold opacity-70">
                  {isEs ? "Fechas, paquetes y precio final" : "Dates, packages and final price"}
                </span>
              </span>
              <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex min-h-28 items-center justify-between gap-5 bg-black/20 p-6 transition hover:bg-white/10 lg:px-8"
            >
              <span>
                <MessageCircle size={20} className="text-[#00C4B0]" />
                <strong className="mt-3 block text-base font-black">{isEs ? "Preguntar a un guía local" : "Ask a local guide"}</strong>
                <span className="mt-1 block text-xs font-semibold text-white/55">
                  {isEs ? "Grupos, empresas y planes a medida" : "Groups, companies and custom plans"}
                </span>
              </span>
              <ArrowRight size={20} className="text-[#00C4B0] transition-transform group-hover:translate-x-1" />
            </a>
          </div>
        </div>
        <div className="mx-auto mt-5 grid max-w-7xl gap-3 sm:grid-cols-3">
          {logistics.map(({ icon: Icon, value, label }) => (
            <div key={value} className="lva-home-panel flex items-center gap-3 rounded-[var(--lva-radius-soft)] px-4 py-4 shadow-none">
              <Icon size={18} className="shrink-0 text-[#00a995]" aria-hidden />
              <div>
                <strong className="block text-sm font-black text-stone-900 dark:text-white">{value}</strong>
                <span className="mt-1 block text-xs text-stone-500 dark:text-stone-400">{label}</span>
              </div>
            </div>
          ))}
        </div>
    </section>
  );
}
