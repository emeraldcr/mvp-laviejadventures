"use client";

import DynamicHeroHeader from "@/app/components/sections/DynamicHeroHeader";
import { CheckCircle2, Droplets, Leaf, Recycle, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/app/context/LanguageContext";
import { translations } from "@/lib/translations";

export default function PracticasSosteniblesPage() {
  const { lang } = useLanguage();
  const tr = translations[lang].practicasSostenibles;

  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50 via-zinc-50 to-white px-4 py-10 dark:from-black dark:via-zinc-950 dark:to-zinc-900">
      <DynamicHeroHeader showHeroSlider={false} />

      <div className="mx-auto w-full max-w-4xl space-y-6">
        {/* Header */}
        <section className="rounded-3xl border border-emerald-100 bg-white/90 p-8 shadow-xl backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/90 md:p-10">
          <div className="space-y-4">
            <p className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1 text-sm font-semibold text-emerald-700 dark:border-emerald-800/70 dark:bg-emerald-900/20 dark:text-emerald-300">
              <Recycle size={16} />
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
          {/* Practices */}
          <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-zinc-900 dark:text-white">
              <Leaf size={20} className="text-emerald-600" />
              {tr.practicesTitle}
            </h2>
            <ul className="space-y-3">
              {tr.practices.map((practice, i) => (
                <li key={i} className="flex items-start gap-3 text-zinc-700 dark:text-zinc-300">
                  <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-500" />
                  <span>{practice}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Policies */}
          <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-zinc-900 dark:text-white">
              <ShieldCheck size={20} className="text-emerald-600" />
              {tr.policiesTitle}
            </h2>
            <ul className="space-y-3">
              {tr.policies.map((policy, i) => (
                <li key={i} className="flex items-start gap-3 text-zinc-700 dark:text-zinc-300">
                  <Droplets size={16} className="mt-1 shrink-0 text-sky-500" />
                  <span>{policy}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Commitment */}
        <section className="rounded-2xl border border-emerald-100 bg-emerald-50 p-6 shadow-sm dark:border-emerald-900/40 dark:bg-emerald-950/30 md:p-8">
          <h2 className="mb-3 flex items-center gap-2 text-xl font-semibold text-emerald-900 dark:text-emerald-300">
            <Recycle size={20} />
            {tr.commitmentTitle}
          </h2>
          <p className="leading-relaxed text-emerald-800 dark:text-emerald-200">{tr.commitmentText}</p>
        </section>
      </div>
    </main>
  );
}
