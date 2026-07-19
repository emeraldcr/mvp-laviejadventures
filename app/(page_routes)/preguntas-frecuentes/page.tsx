"use client";

import DynamicHeroHeader from "@/app/components/sections/DynamicHeroHeader";
import { useLanguage } from "@/lib/LanguageContext";
import { CircleHelp, LifeBuoy } from "lucide-react";
import Link from "next/link";

const faqItems = {
  es: [
    {
      question: "¿Cómo reservo un tour?",
      answer:
        "Entrá a Reservar, elegí fecha y paquete, y pagás en línea. Si preferís ir más despacio, mirá primero la Guía (Docs) o escribinos por WhatsApp y te armamos el plan.",
    },
    {
      question: "¿Dónde veo mis reservas confirmadas?",
      answer:
        "En el dashboard, después de iniciar sesión. Ahí está el estado del pago y los datos que necesitás el día del tour.",
    },
    {
      question: "¿Qué es el portal B2B?",
      answer:
        "Es para operadores y agencias aliadas: reservan para sus clientes, ven tours y dan seguimiento a su cuenta. Si sos operador y no tenés acceso, escribinos.",
    },
    {
      question: "¿Cómo se paga?",
      answer:
        "Online con PayPal (incluye tarjetas que PayPal acepte). El pago va seguro; no pedimos datos de tarjeta por WhatsApp.",
    },
    {
      question: "¿Qué llevo el día del tour?",
      answer:
        "Ropa cómoda, zapatos con agarre, agua, bloqueador, repelente y una muda seca. Según el tour te mandamos la lista exacta al confirmar.",
    },
    {
      question: "¿Necesito ayuda ya?",
      answer:
        "WhatsApp es lo más rápido: cupos, clima, transporte o si no sabés si el cañón te calza. Preferimos decirte la verdad antes de que reserves.",
    },
  ],
  en: [
    {
      question: "How do I book a tour?",
      answer:
        "Go to Book, pick date and package, and pay online. Prefer a slower path? Check the Docs guide first, or WhatsApp us and we'll sort a plan.",
    },
    {
      question: "Where do I see confirmed bookings?",
      answer:
        "In the dashboard after you sign in — payment status and the details you need on tour day.",
    },
    {
      question: "What's the B2B portal?",
      answer:
        "For partner operators and agencies: book for clients, browse tours, and track the account. Operator without access? Message us.",
    },
    {
      question: "How do I pay?",
      answer:
        "Online with PayPal (including cards PayPal accepts). Secure checkout — we never ask for card numbers over WhatsApp.",
    },
    {
      question: "What should I bring on tour day?",
      answer:
        "Comfy clothes, good-grip shoes, water, sunscreen, repellent, and a dry change. We'll send the exact list when you confirm.",
    },
    {
      question: "Need help now?",
      answer:
        "WhatsApp is fastest: availability, weather, transport, or whether the canyon fits you. We'd rather be honest before you book.",
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
          {lang === "es" ? "Lo que la gente pregunta de verdad" : "What people actually ask"}
        </h1>
        <p className="mt-3 max-w-3xl text-zinc-700 dark:text-zinc-300">
          {lang === "es"
            ? "Reservas, pagos, dashboard, B2B y qué meter en la mochila. Si no está acá, WhatsApp y te respondemos en tico, sin script."
            : "Bookings, payments, dashboard, B2B, and what to pack. Missing something? WhatsApp us — plain talk, no script."}
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
