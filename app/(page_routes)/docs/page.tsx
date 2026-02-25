"use client";

import DynamicHeroHeader from "@/app/components/sections/DynamicHeroHeader";
import { useLanguage } from "@/app/context/LanguageContext";
import { BookOpen, CalendarCheck2, Compass, CreditCard, Map, MessageCircle } from "lucide-react";
import Link from "next/link";

const steps = {
  es: [
    {
      title: "Explora los tours",
      description:
        "Visita la sección de Tours para conocer las experiencias, duración, horarios y el tipo de aventura que mejor encaja contigo.",
      href: "/tours",
      cta: "Ver tours",
      icon: Compass,
    },
    {
      title: "Selecciona fecha y paquete",
      description:
        "Desde la página principal, usa el calendario para elegir una fecha disponible y luego el paquete del tour que deseas reservar.",
      href: "/#booking",
      cta: "Ir a reservar",
      icon: CalendarCheck2,
    },
    {
      title: "Completa tus datos y paga",
      description:
        "Llena la información del viajero principal, revisa el resumen y finaliza de forma segura con PayPal.",
      href: "/",
      cta: "Comenzar reserva",
      icon: CreditCard,
    },
    {
      title: "Consulta ubicación, clima y soporte",
      description:
        "Antes de viajar, revisa la info general, el clima y contáctanos por WhatsApp para coordinar cualquier detalle.",
      href: "/info",
      cta: "Ver información",
      icon: Map,
    },
  ],
  en: [
    {
      title: "Explore tours",
      description:
        "Visit the Tours section to compare experiences, duration, schedules, and choose the adventure that fits you best.",
      href: "/tours",
      cta: "View tours",
      icon: Compass,
    },
    {
      title: "Pick date and package",
      description:
        "From the home page, use the booking calendar to select an available date and then choose your preferred tour package.",
      href: "/#booking",
      cta: "Go to booking",
      icon: CalendarCheck2,
    },
    {
      title: "Fill in details and pay",
      description:
        "Complete the lead traveler information, review your booking summary, and securely finish payment with PayPal.",
      href: "/",
      cta: "Start booking",
      icon: CreditCard,
    },
    {
      title: "Check location, weather, and support",
      description:
        "Before your trip, review key info, weather updates, and contact us on WhatsApp for help with logistics.",
      href: "/info",
      cta: "View info",
      icon: Map,
    },
  ],
} as const;

export default function DocsPage() {
  const { lang } = useLanguage();
  const copy = lang === "es" ? steps.es : steps.en;

  return (
    <main className="min-h-screen bg-gradient-to-b from-teal-50 via-zinc-50 to-white px-4 py-10 dark:from-black dark:via-zinc-950 dark:to-zinc-900">
      <DynamicHeroHeader showHeroSlider={false} />

      <section className="mx-auto mt-4 w-full max-w-6xl rounded-3xl border border-teal-100 bg-white/90 p-8 shadow-xl backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/90 md:p-10">
        <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-4 py-1 text-sm font-semibold text-teal-700 dark:border-teal-800/70 dark:bg-teal-900/20 dark:text-teal-300">
          <BookOpen size={16} />
          {lang === "es" ? "Centro de ayuda" : "Help center"}
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white md:text-4xl">
          {lang === "es" ? "Cómo usar La Vieja Adventures" : "How to use La Vieja Adventures"}
        </h1>
        <p className="mt-3 max-w-3xl text-zinc-700 dark:text-zinc-300">
          {lang === "es"
            ? "Sigue esta guía rápida para encontrar tu tour ideal, reservar en minutos y prepararte para tu aventura en Costa Rica."
            : "Follow this quick guide to find your ideal tour, book in minutes, and get ready for your Costa Rica adventure."}
        </p>
      </section>

      <section className="mx-auto mt-6 grid w-full max-w-6xl gap-5 md:grid-cols-2">
        {copy.map((step, index) => {
          const Icon = step.icon;
          return (
            <article
              key={step.title}
              className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950"
            >
              <div className="mb-3 flex items-center gap-3">
                <div className="rounded-full bg-teal-100 p-2 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300">
                  <Icon size={18} />
                </div>
                <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
                  {lang === "es" ? `Paso ${index + 1}` : `Step ${index + 1}`}
                </p>
              </div>

              <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">{step.title}</h2>
              <p className="mt-3 text-zinc-700 dark:text-zinc-300">{step.description}</p>

              <Link
                href={step.href}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-700"
              >
                {step.cta}
              </Link>
            </article>
          );
        })}
      </section>

      <section className="mx-auto mt-6 w-full max-w-6xl rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <h3 className="text-xl font-semibold text-zinc-900 dark:text-white">
          {lang === "es" ? "¿Necesitas ayuda personalizada?" : "Need personalized help?"}
        </h3>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          {lang === "es"
            ? "Nuestro equipo responde rápido por WhatsApp para dudas sobre disponibilidad, transporte o recomendaciones."
            : "Our team quickly responds on WhatsApp for questions about availability, transport, or recommendations."}
        </p>
        <a
          href="https://wa.me/50662332535"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
        >
          <MessageCircle size={16} />
          {lang === "es" ? "Escribir por WhatsApp" : "Chat on WhatsApp"}
        </a>
      </section>
    </main>
  );
}
