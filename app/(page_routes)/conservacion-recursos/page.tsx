"use client";

import DynamicHeroHeader from "@/app/components/sections/DynamicHeroHeader";
import { CheckCircle2, Droplets, ShieldCheck, TreePine, Users } from "lucide-react";
import { useLanguage } from "@/app/context/LanguageContext";
import { translations } from "@/lib/translations";

export default function ConservacionRecursosPage() {
  const { lang } = useLanguage();
  const tr = translations[lang].conservacionRecursos;

  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50 via-zinc-50 to-white px-4 py-10 dark:from-black dark:via-zinc-950 dark:to-zinc-900">
      <DynamicHeroHeader showHeroSlider={false} />

      <div className="mx-auto w-full max-w-4xl space-y-6">
        {/* Header */}
        <section className="rounded-3xl border border-emerald-100 bg-white/90 p-8 shadow-xl backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/90 md:p-10">
          <div className="space-y-4">
            <p className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1 text-sm font-semibold text-emerald-700 dark:border-emerald-800/70 dark:bg-emerald-900/20 dark:text-emerald-300">
              <TreePine size={16} />
              {tr.badge}
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white md:text-4xl">
              {tr.title}
            </h1>
            <p className="text-base leading-relaxed text-zinc-700 dark:text-zinc-300">
              {tr.description}
            </p>
          </div>
        </section>

        {/* Programs */}
        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 md:p-8">
          <h2 className="mb-5 flex items-center gap-2 text-xl font-semibold text-zinc-900 dark:text-white">
            <ShieldCheck size={20} className="text-emerald-600" />
            {tr.programsTitle}
          </h2>
          <ul className="space-y-3">
            {tr.programs.map((program, i) => (
              <li key={i} className="flex items-start gap-3 text-zinc-700 dark:text-zinc-300">
                <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-500" />
                <span>{program}</span>
              </li>
            ))}
          </ul>
        </section>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Monitoring */}
          <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="mb-3 flex items-center gap-2 text-xl font-semibold text-zinc-900 dark:text-white">
              <Droplets size={20} className="text-emerald-600" />
              {tr.monitoringTitle}
            </h2>
            <p className="leading-relaxed text-zinc-700 dark:text-zinc-300">{tr.monitoringText}</p>
          </section>

          {/* Carrying capacity */}
          <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="mb-3 flex items-center gap-2 text-xl font-semibold text-zinc-900 dark:text-white">
              <Users size={20} className="text-emerald-600" />
              {tr.capacityTitle}
            </h2>
            <p className="leading-relaxed text-zinc-700 dark:text-zinc-300">{tr.capacityText}</p>
          </section>
        </div>
      </div>
    </main>
  );
}
