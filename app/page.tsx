"use client";

import React, { JSX } from "react";
import Link from "next/link";
import CalendarSection from "@/app/components/sections/CalendarSection";
import ReservationSection from "@/app/components/sections/ReservationSection";
import DynamicHeroHeader from "@/app/components/sections/DynamicHeroHeader";
import ErrorBoundary from "@/lib/errorBoundary";
import { CalendarProvider } from "@/app/context/CalendarContext";
import { motion } from "framer-motion";
import { CalendarDays, CheckCircle2, ClipboardList, MessageCircleQuestion, ShieldCheck, Star, TimerReset } from "lucide-react";
import { useLanguage } from "@/app/context/LanguageContext";
import { useSession, signIn, signOut } from "next-auth/react";
import Profile from "@/app/components/auth/Profile";

function ConversionSection() {
  const { lang } = useLanguage();

  const highlights = [
    {
      icon: TimerReset,
      title: lang === "es" ? "Reserva en 2 minutos" : "Book in 2 minutes",
      text:
        lang === "es"
          ? "Flujo ultra simple: eliges fecha, completas tus datos y confirmas sin pasos innecesarios."
          : "A simple flow: pick date, complete details, and confirm without unnecessary steps.",
    },
    {
      icon: ShieldCheck,
      title: lang === "es" ? "Pagos y datos seguros" : "Secure payment and data",
      text:
        lang === "es"
          ? "Checkout protegido y soporte humano para ayudarte antes y después de reservar."
          : "Protected checkout plus human support before and after booking.",
    },
    {
      icon: MessageCircleQuestion,
      title: lang === "es" ? "Asistencia AI + equipo local" : "AI help + local team",
      text:
        lang === "es"
          ? "¿Dudas sobre clima, dificultad o transporte? Te respondemos en segundos."
          : "Questions about weather, difficulty or transport? Get answers in seconds.",
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
    <section className="relative bg-black pb-12 pt-8 md:pb-16 md:pt-10">
      <div className="container mx-auto space-y-8 px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 gap-4 md:grid-cols-3"
        >
          {highlights.map(({ icon: Icon, title, text }) => (
            <article
              key={title}
              className="rounded-2xl border border-white/10 bg-zinc-900/65 p-5 shadow-[0_12px_30px_rgba(0,0,0,0.35)]"
            >
              <div className="mb-3 inline-flex rounded-full border border-teal-500/30 bg-teal-400/10 p-2.5">
                <Icon size={18} className="text-teal-300" />
              </div>
              <h3 className="mb-2 text-base font-semibold text-white">{title}</h3>
              <p className="text-sm leading-relaxed text-zinc-300">{text}</p>
            </article>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.45 }}
          className="rounded-3xl border border-emerald-500/20 bg-gradient-to-r from-emerald-600/12 via-teal-500/10 to-cyan-500/10 p-6"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="mb-2 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">
                <Star size={14} className="fill-emerald-300 text-emerald-300" />
                {lang === "es" ? "Más confianza, menos fricción" : "More trust, less friction"}
              </p>
              <h3 className="text-2xl font-black text-white md:text-3xl">
                {lang === "es"
                  ? "Haz scroll, entiende todo y reserva con claridad"
                  : "Scroll, understand everything, and book with clarity"}
              </h3>
              <p className="mt-2 max-w-2xl text-sm text-zinc-200 md:text-base">
                {lang === "es"
                  ? "Reducimos dudas mostrando respuestas rápidas y beneficios reales antes del checkout."
                  : "We reduce uncertainty by showing quick answers and clear value before checkout."}
              </p>
            </div>
            <a
              href="#booking"
              className="inline-flex items-center justify-center rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-black transition hover:bg-emerald-400"
            >
              {lang === "es" ? "Reservar ahora" : "Book now"}
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 gap-4 md:grid-cols-3"
        >
          {faq.map((item) => (
            <article key={item.q} className="rounded-2xl border border-white/10 bg-zinc-900/55 p-5">
              <h4 className="mb-2 text-sm font-semibold text-white">{item.q}</h4>
              <p className="text-sm leading-relaxed text-zinc-300">{item.a}</p>
            </article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}


function StickyBookingCTA() {
  const { lang } = useLanguage();

  return (
    <a
      href="#booking"
      className="fixed bottom-4 left-1/2 z-50 inline-flex -translate-x-1/2 items-center gap-2 rounded-full border border-emerald-400/50 bg-emerald-400 px-5 py-2.5 text-sm font-bold text-black shadow-xl shadow-emerald-900/50 md:hidden"
    >
      <CheckCircle2 size={16} />
      {lang === "es" ? "Reservar ahora" : "Book now"}
    </a>
  );
}

function BookingSection() {
  const { lang } = useLanguage();
  const { data: session, status } = useSession();
  const user = session?.user;

  if (status === "loading") {
    return (
      <div className="relative z-10 container mx-auto px-4 py-16 text-center md:px-8 md:py-28">
        <div className="text-lg text-zinc-400">
          {lang === "es" ? "Preparando tu panel de reserva..." : "Preparing your booking panel..."}
        </div>
      </div>
    );
  }

  return (
    <section id="booking" className="relative overflow-hidden bg-zinc-950">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[900px] -translate-x-1/2 bg-teal-900/15 blur-[140px]" />
      <div className="pointer-events-none absolute left-0 top-40 h-[350px] w-[350px] bg-teal-800/8 blur-[120px]" />
      <div className="pointer-events-none absolute right-0 top-40 h-[350px] w-[350px] bg-cyan-900/8 blur-[120px]" />

      <div className="relative z-10 container mx-auto px-4 py-16 md:px-8 md:py-28">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55 }}
          className="mb-12 text-center"
        >
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.28em] text-teal-400">
            {lang === "es" ? "Reserva asistida por AI" : "AI assisted booking"}
          </p>
          <h2 className="mb-4 text-3xl font-black leading-tight text-white sm:text-4xl md:text-5xl">
            {lang === "es" ? "Tu próximo tour empieza aquí" : "Your next tour starts here"}
          </h2>
          <p className="mx-auto max-w-xl text-base leading-relaxed text-zinc-400 md:text-lg">
            {lang === "es"
              ? "Elige la fecha, completa tus detalles y si tienes dudas usa el botón de AI para resolver todo al instante."
              : "Pick your date, complete your details, and use the AI button whenever you need instant help."}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="mb-12 flex items-center justify-center gap-3"
        >
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
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="grid grid-cols-1 items-start gap-5 lg:grid-cols-7"
        >
          <div className="rounded-3xl border border-white/[0.07] bg-white/[0.025] shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-sm lg:col-span-4">
            <CalendarSection />
          </div>

          <div className="lg:sticky lg:top-24 lg:col-span-3">
            <div className="rounded-3xl border border-white/[0.07] bg-white/[0.025] shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-sm">
              <ReservationSection />
            </div>
          </div>
        </motion.div>
      </div>

      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black to-transparent" />

      <div className="relative z-10 container mx-auto px-4 pb-16 text-center md:px-8">
        {user ? (
          <div className="mx-auto max-w-md rounded-2xl border border-teal-500/20 bg-zinc-900/60 p-8 shadow-xl backdrop-blur-md">
            <p className="logged-in-message mb-6 text-xl font-bold text-teal-400">
              {lang === "es" ? "¡Sesión iniciada con éxito!" : "Successfully logged in!"}
            </p>
            <Profile />
            <div className="mt-6 flex flex-col gap-3">
              <a
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition bg-emerald-600 text-white hover:bg-emerald-700"
              >
                {lang === "es" ? "Ver mi dashboard" : "Go to Dashboard"}
              </a>
              <Link
                href="/ai"
                className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition border border-cyan-400/50 text-cyan-200 hover:bg-cyan-400/10"
              >
                {lang === "es" ? "Abrir La Vieja AI" : "Open La Vieja AI"}
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition border border-zinc-600 text-zinc-300 hover:bg-zinc-800"
              >
                {lang === "es" ? "Cerrar sesión" : "Log Out"}
              </button>
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-md rounded-2xl border border-zinc-700/60 bg-zinc-900/60 p-8 shadow-xl backdrop-blur-md">
            <p className="action-text mb-6 text-lg text-zinc-300">
              {lang === "es"
                ? "Inicia sesión para reservar tu tour."
                : "Log in to book your tour."}
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => signIn(undefined, { callbackUrl: "/dashboard" })}
                className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-900/30 active:translate-y-0 active:scale-[0.99]"
              >
                {lang === "es" ? "Iniciar sesión" : "Log In"}
              </button>
            </div>
          </div>
        )}
      </div>
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
          <StickyBookingCTA />
        </main>
      </CalendarProvider>
    </ErrorBoundary>
  );
}
