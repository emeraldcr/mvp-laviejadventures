"use client";

import Link from "next/link";
import { ArrowRight, Bot, CalendarDays, MessageCircle, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import { BOOKING_HREF, WHATSAPP_HREF, primaryBookingLabel } from "./home-utils";

export default function HomeConversionRail() {
  const { lang } = useLanguage();
  const isEs = lang === "es";

  return (
    <>
      <section className="relative z-10 bg-[#FAF9F6] px-4 py-7 dark:bg-[#0b0a09] sm:px-6 md:py-10 lg:px-8">
        <div className="mx-auto grid max-w-7xl overflow-hidden rounded-[2rem] border border-[#00C4B0]/25 bg-[#2E2A25] text-white shadow-[0_28px_80px_rgba(46,42,37,.18)] lg:grid-cols-[1.15fr_.85fr]">
          <div className="p-7 sm:p-9 lg:p-12">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#00C4B0]/12 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.16em] text-[#70eee1]">
              <ShieldCheck size={14} />
              {isEs ? "Reserva segura · ruta responsable" : "Secure booking · responsible route"}
            </span>
            <h2 className="mt-5 max-w-2xl font-display text-balance text-3xl font-black leading-[1.02] tracking-tight sm:text-4xl lg:text-5xl">
              {isEs ? "Su aventura puede empezar en menos de dos minutos." : "Your adventure can start in under two minutes."}
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/68 sm:text-base">
              {isEs
                ? "Elija fecha, cantidad de personas y paquete. Antes de pagar verá el resumen completo; si algo no le calza, Vero o el equipo le ayudan."
                : "Pick a date, group size, and package. You will see the full summary before payment; if anything does not fit, Vero or our team can help."}
            </p>
          </div>

          <div className="grid gap-px bg-white/10 sm:grid-cols-3 lg:grid-cols-1">
            <Link
              href={BOOKING_HREF}
              className="group flex min-h-28 items-center justify-between gap-5 bg-[#00C4B0] p-6 text-[#17211f] transition hover:bg-[#70eee1] lg:px-8"
            >
              <span>
                <CalendarDays size={20} />
                <strong className="mt-3 block text-base font-black">{primaryBookingLabel(isEs)}</strong>
                <span className="mt-1 block text-xs font-semibold opacity-70">
                  {isEs ? "Ver fechas y paquetes" : "See dates and packages"}
                </span>
              </span>
              <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/ai?from=landing-rail"
              className="group flex min-h-28 items-center justify-between gap-5 bg-[#27241f] p-6 transition hover:bg-[#34302a] lg:px-8"
            >
              <span>
                <Bot size={20} className="text-[#00C4B0]" />
                <strong className="mt-3 block text-base font-black">{isEs ? "Armar con Vero" : "Plan with Vero"}</strong>
                <span className="mt-1 block text-xs font-semibold text-white/55">
                  {isEs ? "IA para elegir mejor" : "AI to help you choose"}
                </span>
              </span>
              <ArrowRight size={20} className="text-[#00C4B0] transition-transform group-hover:translate-x-1" />
            </Link>
            <a
              href={WHATSAPP_HREF}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex min-h-28 items-center justify-between gap-5 bg-[#27241f] p-6 transition hover:bg-[#34302a] lg:px-8"
            >
              <span>
                <MessageCircle size={20} className="text-[#00C4B0]" />
                <strong className="mt-3 block text-base font-black">{isEs ? "Hablar con el equipo" : "Talk to the team"}</strong>
                <span className="mt-1 block text-xs font-semibold text-white/55">
                  {isEs ? "Grupos y planes especiales" : "Groups and custom plans"}
                </span>
              </span>
              <ArrowRight size={20} className="text-[#00C4B0] transition-transform group-hover:translate-x-1" />
            </a>
          </div>
        </div>
      </section>

      <aside className="fixed bottom-7 right-7 z-40 hidden w-64 overflow-hidden rounded-[1.4rem] border border-white/10 bg-[#2E2A25]/95 text-white shadow-[0_24px_70px_rgba(0,0,0,.3)] backdrop-blur-xl md:block">
        <div className="border-b border-white/10 px-5 py-4">
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#70eee1]">
            {isEs ? "¿Listo para mojarse?" : "Ready to get wet?"}
          </p>
          <p className="mt-1 text-sm font-bold">{isEs ? "Reserve cuando quiera." : "Book whenever you are ready."}</p>
        </div>
        <div className="grid grid-cols-[1fr_auto]">
          <Link
            href={BOOKING_HREF}
            className="flex items-center gap-2 bg-[#00C4B0] px-5 py-4 text-sm font-black text-[#17211f] transition hover:bg-[#70eee1]"
          >
            <CalendarDays size={16} />
            {isEs ? "Ver fechas" : "See dates"}
          </Link>
          <Link
            href="/ai?from=landing-dock"
            aria-label={isEs ? "Planear con Vero" : "Plan with Vero"}
            className="flex items-center justify-center border-l border-black/10 bg-[#00C4B0] px-4 text-[#17211f] transition hover:bg-[#70eee1]"
          >
            <Bot size={18} />
          </Link>
        </div>
      </aside>
    </>
  );
}
