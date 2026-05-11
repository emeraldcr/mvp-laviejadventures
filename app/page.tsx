"use client";

import React, { JSX } from "react";
import CalendarSection from "@/app/components/sections/CalendarSection";
import ReservationSection from "@/app/components/sections/ReservationSection";
import DynamicHeroHeader from "@/app/components/sections/DynamicHeroHeader";
import ErrorBoundary from "@/lib/errorBoundary";
import { CalendarProvider } from "@/app/context/CalendarContext";
import { motion } from "framer-motion";
import {
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  MessageCircleQuestion,
  ShieldCheck,
  Sparkles,
  TimerReset,
} from "lucide-react";
import { useLanguage } from "@/app/context/LanguageContext";

function ConversionSection() {
  const { lang } = useLanguage();

  const highlights = [
    {
      icon: TimerReset,
      title: lang === "es" ? "Reserva en 2 minutos" : "Book in 2 minutes",
      text:
        lang === "es"
          ? "Flujo directo para móvil: fecha, detalles y confirmación sin pasos innecesarios."
          : "A mobile-first flow: date, details, and confirmation without unnecessary steps.",
    },
    {
      icon: ShieldCheck,
      title: lang === "es" ? "Compra con confianza" : "Book with confidence",
      text:
        lang === "es"
          ? "Checkout protegido, políticas claras y soporte humano para ayudarte al reservar."
          : "Protected checkout, clear policies, and human support when you book.",
    },
    {
      icon: MessageCircleQuestion,
      title: lang === "es" ? "Ayuda inmediata" : "Instant help",
      text:
        lang === "es"
          ? "Resuelve dudas sobre clima, intensidad o transporte antes de pagar."
          : "Get answers about weather, intensity, or transport before payment.",
    },
  ];

  const faq = [
    {
      q: lang === "es" ? "¿Puedo cambiar mi fecha después de reservar?" : "Can I change my date after booking?",
      a:
        lang === "es"
          ? "Sí, nuestro equipo te ayuda a reprogramar según disponibilidad para que no pierdas tu experiencia."
          : "Yes, our team helps you reschedule based on availability so you never miss the experience.",
    },
    {
      q: lang === "es" ? "¿Cuál tour es mejor para principiantes?" : "Which tour is best for beginners?",
      a:
        lang === "es"
          ? "Usa el botón AI en la reserva y te recomendará la opción ideal por duración e intensidad."
          : "Use the AI button in booking and it will suggest the best option by duration and intensity.",
    },
    {
      q: lang === "es" ? "¿Qué pasa si llueve?" : "What if it rains?",
      a:
        lang === "es"
          ? "Monitoreamos el clima constantemente y te notificamos alternativas seguras con tiempo."
          : "We monitor weather constantly and notify you in advance with safe alternatives.",
    },
  ];

  return (
    <section className="relative overflow-hidden bg-black py-10 sm:py-12 md:py-16">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-teal-500/10 to-transparent" />
      <div className="container relative mx-auto space-y-7 px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-zinc-900 via-zinc-950 to-teal-950/45 p-4 shadow-2xl shadow-black/40 sm:p-6"
        >
          <div className="mb-5 flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-teal-400 text-zinc-950 shadow-lg shadow-teal-500/20">
              <Sparkles size={19} />
            </span>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-teal-300">
                {lang === "es" ? "Pensado para móvil" : "Mobile-first"}
              </p>
              <h2 className="text-xl font-black leading-tight text-white sm:text-2xl">
                {lang === "es" ? "Reserva sin fricción desde tu teléfono" : "Frictionless booking from your phone"}
              </h2>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {highlights.map(({ icon: Icon, title, text }) => (
              <article key={title} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <div className="mb-3 flex items-center gap-2 text-teal-300">
                  <Icon size={16} />
                  <h3 className="text-sm font-bold text-white">{title}</h3>
                </div>
                <p className="text-sm leading-relaxed text-zinc-300">{text}</p>
              </article>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 gap-3 md:grid-cols-3"
        >
          {faq.map((item) => (
            <article key={item.q} className="rounded-2xl border border-white/10 bg-zinc-900/70 p-4 shadow-lg shadow-black/20 sm:p-5">
              <div className="mb-2 flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal-400" />
                <h4 className="text-sm font-semibold text-white">{item.q}</h4>
              </div>
              <p className="pl-6 text-sm leading-relaxed text-zinc-300">{item.a}</p>
            </article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function BookingSection() {
  const { lang } = useLanguage();

  const mobileSteps = [
    lang === "es" ? "Elige fecha" : "Pick date",
    lang === "es" ? "Completa detalles" : "Add details",
    lang === "es" ? "Confirma" : "Confirm",
  ];

  return (
    <section id="booking" className="relative overflow-hidden bg-zinc-950">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[900px] -translate-x-1/2 bg-teal-900/20 blur-[140px]" />
      <div className="pointer-events-none absolute -left-24 top-40 h-[350px] w-[350px] bg-teal-800/10 blur-[120px]" />
      <div className="pointer-events-none absolute -right-24 top-40 h-[350px] w-[350px] bg-cyan-900/10 blur-[120px]" />

      <div className="relative z-10 container mx-auto px-3 py-10 sm:px-4 md:px-8 md:py-28">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55 }}
          className="mb-7 text-left sm:mb-12 sm:text-center"
        >
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.28em] text-teal-400">
            {lang === "es" ? "Crea una nueva reserva" : "Make a new reservation"}
          </p>
          <h2 className="mb-4 text-3xl font-black leading-[1.05] text-white sm:text-4xl md:text-5xl">
            {lang === "es" ? "Tu próximo tour empieza aquí" : "Your next tour starts here"}
          </h2>
          <p className="max-w-xl text-base leading-relaxed text-zinc-400 sm:mx-auto md:text-lg">
            {lang === "es"
              ? "En móvil verás un flujo guiado: selecciona fecha, continúa a los detalles y confirma con todo claro antes de pagar."
              : "On mobile, the flow is guided: select a date, continue to details, and review everything clearly before checkout."}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="mb-6 sm:mb-12"
        >
          <div className="hidden items-center justify-center gap-3 sm:flex">
            <div className="flex items-center gap-2 rounded-full border border-teal-500/25 bg-teal-500/12 px-4 py-2 shadow-[0_0_18px_rgba(20,184,166,0.12)]">
              <CalendarDays size={13} className="text-teal-400" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-teal-300">
                {lang === "es" ? "Paso 1 · Fecha" : "Step 1 · Date"}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-px w-3 bg-zinc-700" />
              <div className="h-1.5 w-1.5 rounded-full bg-zinc-700" />
              <div className="h-px w-3 bg-zinc-700" />
            </div>
            <div className="flex items-center gap-2 rounded-full border border-zinc-700/60 bg-zinc-800/50 px-4 py-2">
              <ClipboardList size={13} className="text-zinc-500" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">
                {lang === "es" ? "Paso 2 · Detalles" : "Step 2 · Details"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 rounded-3xl border border-white/10 bg-white/[0.04] p-2 shadow-xl shadow-black/30 sm:hidden">
            {mobileSteps.map((step, index) => (
              <div
                key={step}
                className={`rounded-2xl px-2 py-3 text-center text-[11px] font-bold ${
                  index === 0 ? "bg-teal-400 text-zinc-950" : "bg-zinc-900 text-zinc-400"
                }`}
              >
                <span className="mb-1 block text-[10px] opacity-70">0{index + 1}</span>
                {step}
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="grid grid-cols-1 items-start gap-4 lg:grid-cols-7 lg:gap-5"
        >
          <div className="rounded-[1.6rem] border border-white/[0.07] bg-white/[0.035] shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-sm sm:rounded-3xl lg:col-span-4">
            <CalendarSection />
          </div>

          <div className="lg:sticky lg:top-24 lg:col-span-3">
            <div className="overflow-hidden rounded-[1.6rem] border border-white/[0.07] bg-white/[0.035] shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-sm sm:rounded-3xl">
              <ReservationSection />
            </div>
          </div>
        </motion.div>
      </div>

      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black to-transparent" />
    </section>
  );
}

export default function Home(): JSX.Element {
  return (
    <ErrorBoundary
      fallback={
        <div className="flex h-screen items-center justify-center bg-black text-xl text-red-600">
          ⚠️ Critical System Failure: Cannot load the booking engine.
        </div>
      }
    >
      <CalendarProvider>
        <main className="min-h-screen overflow-x-hidden bg-black">
          <DynamicHeroHeader />
          <ConversionSection />
          <BookingSection />
        </main>
      </CalendarProvider>
    </ErrorBoundary>
  );
}
