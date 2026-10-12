"use client";

import DynamicHeroHeader from "@/app/components/sections/DynamicHeroHeader";
import { useLanguage } from "@/lib/LanguageContext";
import { CircleHelp } from "lucide-react";
import { SITE_FAQS } from "@/lib/site-faqs";

export default function PreguntasFrecuentesPage() {
  const { lang } = useLanguage();
  const items = lang === "es" ? SITE_FAQS.es : SITE_FAQS.en;

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
            ? "Reservas, pagos y consejos para su aventura. Si necesita ayuda, escribanos por WhatsApp."
            : "Bookings, payments, and what to bring. If you need help, message us on WhatsApp."}
        </p>
      </section>



    </main>
  );
}
