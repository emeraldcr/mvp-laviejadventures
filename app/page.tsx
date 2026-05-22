"use client";

import React, { JSX, useMemo, useState } from "react";
import CalendarSection from "@/app/components/sections/CalendarSection";
import ReservationSection from "@/app/components/sections/ReservationSection";
import DynamicHeroHeader from "@/app/components/sections/DynamicHeroHeader";
import ErrorBoundary from "@/lib/errorBoundary";
import { CalendarProvider } from "@/app/context/CalendarContext";
import { motion } from "framer-motion";
import { CalendarDays, ClipboardList } from "lucide-react";
import { useLanguage } from "@/app/context/LanguageContext";
import { useSession } from "next-auth/react";
import { useReservationData } from "@/app/hooks/useReservationData";
import type { TourSummary } from "@/lib/types";
import Image from "next/image";

const TOUR_IMAGE_BY_SLUG: Record<string, string> = {
  "cascadas-secretas-rio-la-vieja": "/image/IMG_6812.jpg",
  "lluvia-en-la-naturaleza": "/image/IMG_4928.PNG",
  "tour-nocturno-la-vieja": "/image/IMG_4672.jpg",
  "cuadra-tours-aventura": "/image/IMG_6809.jpg",
};

function ConversionSection() {
  const { lang } = useLanguage();

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




function ToursImmersionSection({
  tours,
  onSelectTour,
}: {
  tours: TourSummary[];
  onSelectTour: (slug: string) => void;
}) {
  const { lang } = useLanguage();

  return (
    <section className="relative bg-black pb-10 pt-4 md:pb-14">
      <div className="container mx-auto px-4 md:px-8">
        <div className="mb-8 text-center">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.28em] text-cyan-300">
            {lang === "es" ? "Explora primero" : "Explore first"}
          </p>
          <h2 className="text-3xl font-black text-white md:text-5xl">
            {lang === "es" ? "Elige tu aventura ideal" : "Choose your ideal adventure"}
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {tours.map((tour) => (
            <button
              key={tour.slug}
              onClick={() => onSelectTour(tour.slug)}
              className="group relative h-[340px] overflow-hidden rounded-3xl border border-white/10 text-left"
            >
              <Image
                src={TOUR_IMAGE_BY_SLUG[tour.slug] ?? "/image/IMG_4671.jpg"}
                alt={lang === "es" ? tour.titleEs : tour.titleEn}
                fill
                className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/10" />
              <div className="absolute inset-0 bg-cyan-500/0 transition group-hover:bg-cyan-500/20" />
              <div className="absolute bottom-0 w-full p-5">
                <span className="mb-2 inline-block rounded-full bg-white/20 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white">
                  {tour.difficulty ?? (lang === "es" ? "Aventura" : "Adventure")}
                </span>
                <h3 className="text-xl font-black text-white">{lang === "es" ? tour.titleEs : tour.titleEn}</h3>
                <p className="mt-2 text-sm text-zinc-200">
                  {lang === "es" ? tour.descriptionEs : tour.descriptionEn}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function BookingSection({ selectedTourSlug }: { selectedTourSlug: string }) {
  const { lang } = useLanguage();
  const { status } = useSession();

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
            {lang === "es" ? "Crea una nueva reserva" : "Make a new reservation"}
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
              <ReservationSection preselectedTourSlug={selectedTourSlug} />
            </div>
          </div>
        </motion.div>
      </div>

      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black to-transparent" />

      
    </section>
  );
}

export default function Home(): JSX.Element {
  const { tours } = useReservationData();
  const defaultTourSlug = useMemo(() => tours[0]?.slug ?? "tour-ciudad-esmeralda", [tours]);
  const [selectedTourSlug, setSelectedTourSlug] = useState(defaultTourSlug);

  React.useEffect(() => {
    if (!tours.length) return;
    const exists = tours.some((tour) => tour.slug === selectedTourSlug);
    if (!exists) setSelectedTourSlug(tours[0].slug);
  }, [selectedTourSlug, tours]);

  const handleSelectTour = (slug: string) => {
    setSelectedTourSlug(slug);
    window.history.replaceState({}, "", `/?tour=${slug}#booking`);
    document.getElementById("booking")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

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
          <ToursImmersionSection tours={tours} onSelectTour={handleSelectTour} />
          <BookingSection selectedTourSlug={selectedTourSlug} />
        
        </main>
      </CalendarProvider>
    </ErrorBoundary>
  );
}
