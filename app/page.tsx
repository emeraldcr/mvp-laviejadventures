"use client";

import React, { JSX } from "react";
import Link from "next/link";
import CalendarSection from "@/app/components/sections/CalendarSection";
import ReservationSection from "@/app/components/sections/ReservationSection";
import DynamicHeroHeader from "@/app/components/sections/DynamicHeroHeader";
import ErrorBoundary from "@/lib/errorBoundary";
import { CalendarProvider } from "@/app/context/CalendarContext";
import { motion } from "framer-motion";
import { CalendarDays, ClipboardList, MessageCircleHeart, Sparkles, Wand2 } from "lucide-react";
import { useLanguage } from "@/app/context/LanguageContext";
import { useSession, signIn, signOut } from "next-auth/react";
import Profile from "@/src/components/Profile";

function AILandingIntro() {
  const { lang } = useLanguage();

  const points = [
    {
      icon: Sparkles,
      es: "Recomendaciones inteligentes para elegir tour según clima, presupuesto y estilo.",
      en: "Smart recommendations to pick your tour by weather, budget, and vibe.",
    },
    {
      icon: MessageCircleHeart,
      es: "Resuelve dudas al instante: horarios, transporte, qué llevar y más.",
      en: "Get instant answers: schedules, transport, what to bring, and more.",
    },
    {
      icon: Wand2,
      es: "Reserva en segundos con una experiencia conversacional moderna.",
      en: "Book in seconds with a modern conversational experience.",
    },
  ];

  return (
    <section className="relative overflow-hidden bg-black pt-24 md:pt-32 pb-14 md:pb-20">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[-120px] left-1/2 -translate-x-1/2 h-[420px] w-[900px] rounded-full bg-cyan-500/10 blur-[130px]" />
        <div className="absolute top-24 right-[-90px] h-72 w-72 rounded-full bg-emerald-400/10 blur-[110px]" />
        <div className="absolute bottom-[-60px] left-[-70px] h-80 w-80 rounded-full bg-teal-500/10 blur-[110px]" />
      </div>

      <div className="relative z-10 container mx-auto px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="mx-auto max-w-5xl"
        >
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">
            <Sparkles size={14} />
            {lang === "es" ? "Nueva atracción: La Vieja AI" : "New attraction: La Vieja AI"}
          </div>

          <h1 className="text-balance text-4xl font-black leading-tight text-white sm:text-5xl md:text-6xl">
            {lang === "es"
              ? "La aventura ahora también se conversa."
              : "Adventure now comes with conversation."}
          </h1>
          <p className="mt-6 max-w-3xl text-pretty text-base leading-relaxed text-zinc-300 md:text-xl">
            {lang === "es"
              ? "Transformamos el inicio de tu tour en una experiencia AI: te guía, responde tus preguntas y te ayuda a reservar el plan perfecto con estilo moderno y energía aventurera."
              : "We transformed your tour journey with AI: it guides you, answers your questions, and helps you book the perfect plan with modern style and adventurous energy."}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/ai"
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 to-emerald-400 px-6 py-3 text-sm font-extrabold uppercase tracking-wider text-zinc-950 shadow-[0_18px_45px_rgba(45,212,191,0.35)] transition hover:-translate-y-0.5"
            >
              <Sparkles size={16} />
              {lang === "es" ? "Probar La Vieja AI" : "Try La Vieja AI"}
            </Link>
            <a
              href="#booking"
              className="inline-flex items-center gap-2 rounded-2xl border border-zinc-600 bg-zinc-900/50 px-6 py-3 text-sm font-semibold text-zinc-200 transition hover:border-cyan-300/60 hover:text-cyan-200"
            >
              {lang === "es" ? "Reservar ahora" : "Book now"}
            </a>
          </div>

          <div className="mt-9 grid gap-3 md:grid-cols-3">
            {points.map(({ icon: Icon, es, en }) => (
              <div key={es} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-sm">
                <Icon size={18} className="mb-3 text-emerald-300" />
                <p className="text-sm leading-relaxed text-zinc-300">{lang === "es" ? es : en}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
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
      <div className="absolute left-1/2 top-0 h-[500px] w-[900px] -translate-x-1/2 bg-teal-900/15 blur-[140px] pointer-events-none" />
      <div className="absolute left-0 top-40 h-[350px] w-[350px] bg-teal-800/8 blur-[120px] pointer-events-none" />
      <div className="absolute right-0 top-40 h-[350px] w-[350px] bg-cyan-900/8 blur-[120px] pointer-events-none" />

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

      <div className="action-card relative z-10 container mx-auto px-4 pb-16 text-center md:px-8">
        {user ? (
          <div className="logged-in-section mx-auto max-w-md rounded-2xl border border-teal-500/20 bg-zinc-900/60 p-8 shadow-xl backdrop-blur-md">
            <p className="logged-in-message mb-6 text-xl font-bold text-teal-400">
              {lang === "es" ? "¡Sesión iniciada con éxito!" : "Successfully logged in!"}
            </p>
            <Profile />
            <div className="mt-6 flex flex-col gap-3">
              <a
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                {lang === "es" ? "Ver mi dashboard" : "Go to Dashboard"}
              </a>
              <Link
                href="/ai"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-cyan-400/50 px-4 py-3 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-400/10"
              >
                {lang === "es" ? "Abrir La Vieja AI" : "Open La Vieja AI"}
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-600 px-4 py-3 text-sm font-semibold text-zinc-300 transition hover:bg-zinc-800"
              >
                {lang === "es" ? "Cerrar sesión" : "Log Out"}
              </button>
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-md rounded-2xl border border-zinc-700/60 bg-zinc-900/60 p-8 shadow-xl backdrop-blur-md">
            <p className="action-text mb-6 text-lg text-zinc-300">
              {lang === "es"
                ? "Inicia sesión para reservar, y luego descubre todo lo que puedes hacer con La Vieja AI."
                : "Log in to book your tour, then unlock everything you can do with La Vieja AI."}
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => signIn(undefined, { callbackUrl: "/dashboard" })}
                className="w-full inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-900/30 active:scale-[0.99] active:translate-y-0"
              >
                {lang === "es" ? "Iniciar sesión" : "Log In"}
              </button>
              <Link
                href="/ai"
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-cyan-400/50 px-6 py-3 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-400/10"
              >
                {lang === "es" ? "Explorar La Vieja AI" : "Explore La Vieja AI"}
              </Link>
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
          <AILandingIntro />
          <BookingSection />
        </main>
      </CalendarProvider>
    </ErrorBoundary>
  );
}
