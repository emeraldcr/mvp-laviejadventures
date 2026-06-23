"use client";

import React, { JSX } from "react";
import Link from "next/link";
import Image from "next/image";
import CalendarSection from "@/app/components/sections/CalendarSection";
import ReservationSection from "@/app/components/sections/ReservationSection";
import DynamicHeroHeader from "@/app/components/sections/DynamicHeroHeader";
import ErrorBoundary from "@/lib/errorBoundary";
import { CalendarProvider } from "@/app/context/CalendarContext";
import { motion } from "framer-motion";
import { Coffee, Croissant, Leaf, Sandwich, CalendarDays, ClipboardList } from "lucide-react";
import { useLanguage } from "@/app/context/LanguageContext";
import { useSession, signIn, signOut } from "next-auth/react";
import Profile from "@/app/components/auth/Profile";

const WHATSAPP_URL = "https://wa.me/50662332535";

const cafeteriaHighlights = [
  {
    title: "Café local",
    text: "Disfrutá café caliente, bebidas naturales y opciones ideales para acompañar una mañana en la montaña.",
    icon: Coffee,
  },
  {
    title: "Pan casero",
    text: "Probá productos horneados con sabor tradicional como pan de yuca, budín, pan de naranja, pan de levadura y tamal de maíz asado.",
    icon: Croissant,
  },
  {
    title: "Opciones saladas",
    text: "También contamos con sándwiches preparados al momento, ideales para quienes buscan algo práctico, fresco y lleno de sabor.",
    icon: Sandwich,
  },
  {
    title: "Ambiente natural",
    text: "Un espacio rural y acogedor para descansar, conversar y disfrutar la esencia de Sucre antes o después de tu visita.",
    icon: Leaf,
  },
];

const cafeteriaMenu = [
  {
    name: "Sándwich de la Casa",
    description: "Jamón, queso derretido, lechuga, tomate y aderezo de la casa.",
    price: "₡2.500",
  },
  {
    name: "Sándwich Supremo",
    description: "Pollo mechado, queso, aguacate y aderezo de la casa.",
    price: "₡3.200",
  },
  {
    name: "Pan de Yuca",
    description: "Bocaditos horneados, crujientes por fuera y suaves y quesosos por dentro.",
    price: "₡600",
  },
  {
    name: "Tamal de Maíz Asado",
    description: "Receta tradicional con auténtico sabor a maíz de pueblo.",
    price: "₡1.200",
  },
  {
    name: "Pan de Levadura Casero",
    description: "Pan artesanal ideal para acompañar con mantequilla o natilla.",
    price: "₡1.000",
  },
  {
    name: "Budín de la Abuela",
    description: "Budín húmedo, tierno y con sabor casero tradicional.",
    price: "₡1.000",
  },
  {
    name: "Pan de Naranja",
    description: "Queque seco artesanal con aroma cítrico natural y glaseado ligero.",
    price: "₡1.200",
  },
];

function CafeteriaSection() {
  return (
    <section id="cafeteria-lva" className="relative overflow-hidden bg-gradient-to-b from-black via-zinc-950 to-zinc-950">
      <div className="pointer-events-none absolute -left-28 top-20 h-72 w-72 rounded-full bg-amber-700/10 blur-[110px]" />
      <div className="pointer-events-none absolute right-0 top-1/3 h-96 w-96 rounded-full bg-emerald-700/10 blur-[130px]" />

      <div className="relative z-10 container mx-auto px-4 py-16 md:px-8 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55 }}
          className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]"
        >
          <div>
            <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.28em] text-amber-300">
              Sabores de Sucre
            </p>
            <h2 className="mb-4 text-3xl font-black leading-tight text-white sm:text-4xl md:text-5xl">
              Cafetería LVA
            </h2>
            <p className="mb-5 text-xl font-semibold leading-relaxed text-amber-100/90 md:text-2xl">
              Café, pan casero y sabores locales en medio de la naturaleza.
            </p>
            <p className="max-w-3xl text-base leading-relaxed text-zinc-300 md:text-lg">
              La cafetería de La Vieja Adventures es un espacio acogedor en Sucre, San Carlos, donde podés disfrutar café local, pan casero, antojitos tradicionales, bebidas y opciones saladas en un ambiente rural, natural y familiar. Es el lugar ideal para iniciar el día con calma, compartir después de la aventura o simplemente disfrutar un momento tranquilo rodeado de naturaleza.
            </p>
          </div>

          <div className="relative min-h-[320px] overflow-hidden rounded-[2rem] border border-white/[0.08] bg-zinc-900 shadow-[0_24px_70px_rgba(0,0,0,0.45)]">
            <Image
              src="/image/IMG_4438.JPG"
              alt="Ambiente natural y rural de La Vieja Adventures para disfrutar café y pan casero"
              fill
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="w-fit rounded-full border border-amber-200/25 bg-black/45 px-4 py-2 text-sm font-semibold text-amber-100 backdrop-blur-md">
                Cafetería rural · casera · natural
              </div>
            </div>
          </div>
        </motion.div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cafeteriaHighlights.map(({ title, text, icon: Icon }) => (
            <article key={title} className="rounded-3xl border border-white/[0.07] bg-white/[0.035] p-6 shadow-[0_18px_50px_rgba(0,0,0,0.28)] backdrop-blur-sm transition hover:-translate-y-1 hover:border-amber-300/25 hover:bg-white/[0.055]">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-300/20 bg-amber-400/10 text-amber-200">
                <Icon size={22} aria-hidden="true" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-white">{title}</h3>
              <p className="text-sm leading-relaxed text-zinc-400">{text}</p>
            </article>
          ))}
        </div>

        <div className="mt-12 rounded-[2rem] border border-white/[0.07] bg-zinc-900/70 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-sm md:p-8">
          <div className="mb-8 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.28em] text-emerald-300">Menú</p>
              <h2 className="text-2xl font-black text-white md:text-3xl">Sabores de la casa</h2>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-zinc-400">
              Opciones sencillas, frescas y con sabor casero para acompañar tu visita.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {cafeteriaMenu.map((item) => (
              <div key={item.name} className="rounded-2xl border border-white/[0.06] bg-black/25 p-4">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="font-bold text-zinc-100">{item.name}</h3>
                  <span className="shrink-0 rounded-full bg-emerald-500/12 px-3 py-1 text-sm font-bold text-emerald-300">{item.price}</span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 rounded-[2rem] border border-emerald-400/20 bg-gradient-to-br from-emerald-900/40 via-zinc-900 to-amber-950/30 p-8 text-center shadow-[0_24px_70px_rgba(0,0,0,0.35)] md:p-10">
          <h2 className="mb-3 text-2xl font-black text-white md:text-3xl">Pasá por nuestra cafetería</h2>
          <p className="mx-auto mb-6 max-w-2xl text-base leading-relaxed text-zinc-300">
            Disfrutá un café, un pan casero o un antojito local en un ambiente tranquilo, natural y familiar dentro de La Vieja Adventures.
          </p>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-900/30 transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 active:translate-y-0"
          >
            Contactar por WhatsApp
          </a>
        </div>
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
          <CafeteriaSection />
          <BookingSection />
        </main>
      </CalendarProvider>
    </ErrorBoundary>
  );
}
