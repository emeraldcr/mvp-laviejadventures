"use client";

import DynamicHeroHeader from "@/app/components/sections/DynamicHeroHeader";
import { useLanguage } from "@/app/context/LanguageContext";
import { CircleHelp, LifeBuoy } from "lucide-react";
import Link from "next/link";

const faqItems = {
  es: [
    {
      question: "¿Cómo reservo un tour?",
      answer:
        "Puedes reservar desde la página principal seleccionando fecha, paquete y completando el pago en línea. Si prefieres, primero revisa la guía completa en la sección de Docs.",
    },
    {
      question: "¿Dónde veo mis reservas confirmadas?",
      answer:
        "Después de reservar, puedes consultar tu información en el dashboard. Ahí verás el estado de tus reservas y los datos clave para tu visita.",
    },
    {
      question: "¿Qué incluye el Portal B2B?",
      answer:
        "El portal B2B permite a operadores y agencias gestionar reservas de clientes, consultar tours disponibles y dar seguimiento operativo de su cuenta.",
    },
    {
      question: "¿Qué métodos de pago aceptan?",
      answer:
        "Las reservas en línea se procesan de forma segura con PayPal, incluyendo tarjetas compatibles dentro de su plataforma.",
    },
    {
      question: "¿Qué debo llevar el día del tour?",
      answer:
        "Te recomendamos ropa cómoda, zapatos con buen agarre, hidratación, protector solar, repelente y una muda extra según el tipo de actividad.",
    },
    {
      question: "¿Cómo recibo ayuda rápida?",
      answer:
        "Puedes escribirnos por WhatsApp para dudas de disponibilidad, transporte, políticas o recomendaciones antes de tu viaje.",
    },
  ],
  en: [
    {
      question: "How do I book a tour?",
      answer:
        "You can book from the home page by selecting a date, package, and completing online payment. You can also review the full guide in the Docs section first.",
    },
    {
      question: "Where can I see my confirmed bookings?",
      answer:
        "After booking, you can check your information in the dashboard, including reservation status and key details for your visit.",
    },
    {
      question: "What is included in the B2B Portal?",
      answer:
        "The B2B portal allows operators and agencies to manage client bookings, browse available tours, and track account operations.",
    },
    {
      question: "What payment methods do you accept?",
      answer:
        "Online reservations are securely processed with PayPal, including compatible card options available in their platform.",
    },
    {
      question: "What should I bring on tour day?",
      answer:
        "We recommend comfortable clothing, good-grip shoes, water, sunscreen, repellent, and an extra change of clothes depending on the activity.",
    },
    {
      question: "How can I get quick support?",
      answer:
        "You can message us on WhatsApp for availability, transport, policy, or recommendation questions before your trip.",
    },
  ],
} as const;

export default function PreguntasFrecuentesPage() {
  const { lang } = useLanguage();
  const items = lang === "es" ? faqItems.es : faqItems.en;

  return (
    <main className="min-h-screen bg-gradient-to-b from-teal-50 via-zinc-50 to-white px-4 py-10 dark:from-black dark:via-zinc-950 dark:to-zinc-900">
      <DynamicHeroHeader showHeroSlider={false} />

      <section className="mx-auto mt-4 w-full max-w-5xl rounded-3xl border border-teal-100 bg-white/90 p-8 shadow-xl backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/90 md:p-10">
        <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-4 py-1 text-sm font-semibold text-teal-700 dark:border-teal-800/70 dark:bg-teal-900/20 dark:text-teal-300">
          <CircleHelp size={16} />
          {lang === "es" ? "Preguntas frecuentes" : "Frequently asked questions"}
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white md:text-4xl">
          {lang === "es" ? "Resolvemos tus dudas" : "Answers to common questions"}
        </h1>
        <p className="mt-3 max-w-3xl text-zinc-700 dark:text-zinc-300">
          {lang === "es"
            ? "Aquí encontrarás respuestas rápidas sobre reservas, pagos, dashboard, portal B2B y preparación para tu aventura."
            : "Find quick answers about bookings, payments, dashboard access, the B2B portal, and getting ready for your adventure."}
        </p>
      </section>

      <section className="mx-auto mt-6 w-full max-w-5xl space-y-3">
        {items.map((item) => (
          <details
            key={item.question}
            className="group rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm open:border-teal-300 dark:border-zinc-800 dark:bg-zinc-950"
          >
            <summary className="cursor-pointer list-none text-lg font-semibold text-zinc-900 marker:content-none dark:text-white">
              {item.question}
            </summary>
            <p className="mt-3 text-zinc-700 dark:text-zinc-300">{item.answer}</p>
          </details>
        ))}
      </section>

      <section className="mx-auto mt-6 flex w-full max-w-5xl flex-wrap gap-3 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <Link
          href="/docs"
          className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-700"
        >
          <LifeBuoy size={16} />
          {lang === "es" ? "Ver guía completa" : "View full guide"}
        </Link>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          {lang === "es" ? "Abrir dashboard" : "Open dashboard"}
        </Link>
        <Link
          href="/b2b/login"
          className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          {lang === "es" ? "Portal B2B" : "B2B Portal"}
        </Link>
      </section>
    </main>
  );
}
