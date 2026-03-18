"use client";

import DynamicHeroHeader from "@/app/components/sections/DynamicHeroHeader";
import { CheckCircle2, ClipboardList, ShieldCheck, Sparkles, UserCheck } from "lucide-react";
import { useLanguage } from "@/app/context/LanguageContext";
import { translations } from "@/lib/translations";

export default function BitacoraMantenimientoPage() {
  const { lang } = useLanguage();
  const tr = translations[lang].bitacoraMantenimiento;

  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50 via-zinc-50 to-white px-4 py-10 dark:from-black dark:via-zinc-950 dark:to-zinc-900">
      <DynamicHeroHeader showHeroSlider={false} />

      <div className="mx-auto w-full max-w-4xl space-y-6">
        {/* Header */}
        <section className="rounded-3xl border border-emerald-100 bg-white/90 p-8 shadow-xl backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/90 md:p-10">
          <div className="space-y-4">
            <p className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1 text-sm font-semibold text-emerald-700 dark:border-emerald-800/70 dark:bg-emerald-900/20 dark:text-emerald-300">
              <ShieldCheck size={16} />
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

        <div className="grid gap-6 md:grid-cols-2">
          {/* Daily checks */}
          <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-zinc-900 dark:text-white">
              <ClipboardList size={20} className="text-emerald-600" />
              {tr.checksTitle}
            </h2>
            <ul className="space-y-3">
              {tr.checks.map((check, i) => (
                <li key={i} className="flex items-start gap-3 text-zinc-700 dark:text-zinc-300">
                  <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-500" />
                  <span>{check}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Frequency & responsible */}
          <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-zinc-900 dark:text-white">
              <UserCheck size={20} className="text-emerald-600" />
              {tr.frequencyLabel} &amp; {tr.responsibleLabel}
            </h2>
            <div className="space-y-4">
              <div className="rounded-xl bg-emerald-50 p-4 dark:bg-emerald-900/20">
                <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
                  {tr.frequencyLabel}
                </p>
                <p className="mt-1 text-zinc-800 dark:text-zinc-200">{tr.frequency}</p>
              </div>
              <div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-900">
                <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  {tr.responsibleLabel}
                </p>
                <p className="mt-1 text-zinc-800 dark:text-zinc-200">{tr.responsible}</p>
              </div>
            </div>
          </section>
        </div>

        {/* Importance */}
        <section className="rounded-2xl border border-emerald-100 bg-emerald-50 p-6 shadow-sm dark:border-emerald-900/40 dark:bg-emerald-950/30 md:p-8">
          <h2 className="mb-3 flex items-center gap-2 text-xl font-semibold text-emerald-900 dark:text-emerald-300">
            <Sparkles size={20} />
            {tr.importanceTitle}
          </h2>
          <p className="leading-relaxed text-emerald-800 dark:text-emerald-200">{tr.importanceText}</p>
        </section>
      </div>
    </main>
  );
}
