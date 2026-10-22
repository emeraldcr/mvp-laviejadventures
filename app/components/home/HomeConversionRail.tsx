"use client";

import { localizeHref } from "@/lib/i18n";

import Link from "next/link";
import { ArrowRight, CalendarDays, MessageCircle, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/LanguageContext";
import { BOOKING_HREF, localizedHomeWhatsAppHref, primaryBookingLabel } from "./home-utils";

export default function HomeConversionRail() {
  const { lang } = useLanguage();
  const isEs = lang === "es";
  const whatsappHref = localizedHomeWhatsAppHref(isEs);
  const [showFloatingCard, setShowFloatingCard] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowFloatingCard(window.scrollY > window.innerHeight * 0.85);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <section className="relative z-10 bg-[#FAF9F6] px-4 py-7 dark:bg-[#0b0a09] sm:px-6 md:py-10 lg:px-8">
        <div className="mx-auto grid max-w-7xl overflow-hidden rounded-[2rem] border border-[#00C4B0]/25 bg-[#2E2A25] text-white shadow-[0_28px_80px_rgba(46,42,37,.18)] lg:grid-cols-[1.15fr_.85fr]">
          <div className="p-7 sm:p-9 lg:p-12">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#00C4B0]/12 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.16em] text-[#70eee1]">
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
              className="group flex min-h-28 items-center justify-between gap-5 bg-[#00C4B0] p-6 text-[#17211f] transition hover:bg-[#70eee1] lg:px-8"
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
              className="group flex min-h-28 items-center justify-between gap-5 bg-[#27241f] p-6 transition hover:bg-[#34302a] lg:px-8"
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
      </section>

      <aside className={`fixed bottom-7 right-7 z-40 hidden w-64 overflow-hidden rounded-[1.4rem] border border-[#00C4B0]/35 bg-[#17211f]/95 text-white shadow-[0_24px_70px_rgba(0,0,0,.3)] backdrop-blur-xl transition-all duration-300 md:block ${showFloatingCard ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"}`} aria-hidden={!showFloatingCard}>
        <div className="border-b border-[#00C4B0]/25 bg-[#073f3b]/80 px-5 py-4">
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#70eee1]">
            {isEs ? "¿Listo para elegir?" : "Ready to choose?"}
          </p>
          <p className="mt-1 text-sm font-bold">{isEs ? "Revise fechas y condiciones de su salida." : "Review dates and conditions for your trip."}</p>
        </div>
        <div className="grid grid-cols-1">
          <Link
            href={localizeHref(BOOKING_HREF, lang)}
            className="flex items-center gap-2 bg-[#00C4B0] px-5 py-4 text-sm font-black text-[#17211f] transition hover:bg-[#70eee1]"
          >
            <CalendarDays size={16} />
            {isEs ? "Ver fechas" : "See dates"}
          </Link>
        </div>
      </aside>
    </>
  );
}
