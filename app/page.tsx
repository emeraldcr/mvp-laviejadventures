"use client";

import React, { JSX } from "react";
import CalendarSection from "@/app/components/sections/CalendarSection";
import ReservationSection from "@/app/components/sections/ReservationSection";
import DynamicHeroHeader from "@/app/components/sections/DynamicHeroHeader";
import ErrorBoundary from "@/lib/errorBoundary";
import { CalendarProvider } from "@/app/context/CalendarContext";
import { motion } from "framer-motion";
import { CalendarDays, ClipboardList } from "lucide-react";
import { useLanguage } from "@/app/context/LanguageContext";
import { useSession, signIn, signOut } from "next-auth/react";
import Profile from "../src/components/Profile";

// BookingSection is a client component that can now safely use useUser
function BookingSection() {
  const { lang } = useLanguage();
  const { data: session, status } = useSession();
  const user = session?.user;

  if (status === "loading") {
    return (
      <div className="relative z-10 container mx-auto px-4 md:px-8 py-16 md:py-28 text-center">
        <div className="text-zinc-400 text-lg">
          {lang === "es" ? "Verificando sesión..." : "Checking session..."}
        </div>
      </div>
    );
  }

  return (
    <section id="booking" className="relative bg-zinc-950 overflow-hidden">
      {/* Ambient glow blobs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-teal-900/15 blur-[140px] pointer-events-none" />
      <div className="absolute top-40 left-0 w-[350px] h-[350px] bg-teal-800/8 blur-[120px] pointer-events-none" />
      <div className="absolute top-40 right-0 w-[350px] h-[350px] bg-cyan-900/8 blur-[120px] pointer-events-none" />

      <div className="relative z-10 container mx-auto px-4 md:px-8 py-16 md:py-28">
        {/* ── Section header ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55 }}
          className="text-center mb-12"
        >
          <p className="text-teal-400 text-[11px] font-bold uppercase tracking-[0.28em] mb-3">
            {lang === "es" ? "Tu próxima aventura" : "Your next adventure"}
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
            {lang === "es" ? "Reserva tu experiencia" : "Book your experience"}
          </h2>
          <p className="text-zinc-400 text-base md:text-lg max-w-lg mx-auto leading-relaxed">
            {lang === "es"
              ? "Elige una fecha disponible y personaliza cada detalle de tu tour."
              : "Choose an available date and customize every detail of your tour."}
          </p>
        </motion.div>

        {/* ── Step indicators ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="flex items-center justify-center gap-3 mb-12"
        >
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-teal-500/12 border border-teal-500/25 shadow-[0_0_18px_rgba(20,184,166,0.12)]">
            <CalendarDays size={13} className="text-teal-400" />
            <span className="text-[11px] font-bold text-teal-300 uppercase tracking-widest">
              {lang === "es" ? "Paso 1 · Fecha" : "Step 1 · Date"}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-px bg-zinc-700" />
            <div className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
            <div className="w-3 h-px bg-zinc-700" />
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-800/50 border border-zinc-700/60">
            <ClipboardList size={13} className="text-zinc-500" />
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">
              {lang === "es" ? "Paso 2 · Detalles" : "Step 2 · Details"}
            </span>
          </div>
        </motion.div>

        {/* ── Calendar + Reservation grid ── */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="grid grid-cols-1 lg:grid-cols-7 gap-5 items-start"
        >
          {/* Calendar panel */}
          <div className="lg:col-span-4 rounded-3xl border border-white/[0.07] bg-white/[0.025] backdrop-blur-sm shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
            <CalendarSection />
          </div>

          {/* Reservation panel */}
          <div className="lg:col-span-3 lg:sticky lg:top-24">
            <div className="rounded-3xl border border-white/[0.07] bg-white/[0.025] backdrop-blur-sm shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
              <ReservationSection />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black to-transparent pointer-events-none" />

      {/* Action card / Auth UI */}
      <div className="action-card relative z-10 container mx-auto px-4 md:px-8 pb-16 text-center">
        {user ? (
          <div className="logged-in-section max-w-md mx-auto bg-zinc-900/60 backdrop-blur-md p-8 rounded-2xl border border-teal-500/20 shadow-xl">
            <p className="logged-in-message text-teal-400 text-xl font-bold mb-6">
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
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-600 px-4 py-3 text-sm font-semibold text-zinc-300 transition hover:bg-zinc-800"
              >
                {lang === "es" ? "Cerrar sesión" : "Log Out"}
              </button>
            </div>
          </div>
        ) : (
          <div className="max-w-md mx-auto bg-zinc-900/60 backdrop-blur-md p-8 rounded-2xl border border-zinc-700/60 shadow-xl">
            <p className="action-text text-zinc-300 text-lg mb-6">
              {lang === "es"
                ? "¡Bienvenido! Inicia sesión para reservar o ver tu perfil."
                : "Welcome! Please log in to book your adventure or access your profile."}
            </p>
            <button
              onClick={() => signIn(undefined, { callbackUrl: "/dashboard" })}
              className="w-full inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-900/30 active:translate-y-0 active:scale-[0.99]"
            >
              {lang === "es" ? "Iniciar sesión" : "Log In"}
            </button>
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
        <div className="flex justify-center items-center h-screen text-xl text-red-600 bg-black">
          ⚠️ Critical System Failure: Cannot load the booking engine.
        </div>
      }
    >
      <CalendarProvider>
        <main className="min-h-screen bg-black overflow-x-hidden">
          <DynamicHeroHeader />
          <BookingSection />
        </main>
      </CalendarProvider>
    </ErrorBoundary>
  );
}