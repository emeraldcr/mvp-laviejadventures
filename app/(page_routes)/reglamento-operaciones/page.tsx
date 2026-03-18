"use client";

import DynamicHeroHeader from "@/app/components/sections/DynamicHeroHeader";
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  CreditCard,
  FileText,
  MapPin,
  ScrollText,
  ShieldCheck,
  UserCheck,
  XCircle,
} from "lucide-react";
import { useLanguage } from "@/app/context/LanguageContext";
import { translations } from "@/lib/translations";

export default function ReglamentoOperacionesPage() {
  const { lang } = useLanguage();
  const tr = translations[lang].reglamentoOperaciones;

  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50 via-zinc-50 to-white px-4 py-10 dark:from-black dark:via-zinc-950 dark:to-zinc-900">
      <DynamicHeroHeader showHeroSlider={false} />

      <div className="mx-auto w-full max-w-5xl space-y-6">
        {/* Header */}
        <section className="rounded-3xl border border-emerald-100 bg-white/90 p-8 shadow-xl backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/90 md:p-10">
          <div className="space-y-4">
            <p className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1 text-sm font-semibold text-emerald-700 dark:border-emerald-800/70 dark:bg-emerald-900/20 dark:text-emerald-300">
              <ScrollText size={16} />
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

        {/* Company description */}
        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 md:p-8">
          <h2 className="mb-3 flex items-center gap-2 text-xl font-semibold text-zinc-900 dark:text-white">
            <MapPin size={20} className="text-emerald-600" />
            {tr.companyTitle}
          </h2>
          <p className="leading-relaxed text-zinc-700 dark:text-zinc-300">{tr.companyText}</p>
        </section>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Schedules */}
          <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-zinc-900 dark:text-white">
              <CalendarClock size={20} className="text-emerald-600" />
              {tr.schedulesTitle}
            </h2>
            <ul className="space-y-3">
              {tr.schedules.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-zinc-700 dark:text-zinc-300">
                  <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Payment methods */}
          <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-zinc-900 dark:text-white">
              <CreditCard size={20} className="text-emerald-600" />
              {tr.paymentTitle}
            </h2>
            <ul className="space-y-3">
              {tr.paymentMethods.map((method, i) => (
                <li key={i} className="flex items-center gap-3 text-zinc-700 dark:text-zinc-300">
                  <CheckCircle2 size={18} className="shrink-0 text-emerald-500" />
                  <span>{method}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Reservation policies */}
        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 md:p-8">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-zinc-900 dark:text-white">
            <FileText size={20} className="text-emerald-600" />
            {tr.reservationTitle}
          </h2>
          <ul className="space-y-3">
            {tr.reservationPolicies.map((policy, i) => (
              <li key={i} className="flex items-start gap-3 text-zinc-700 dark:text-zinc-300">
                <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-500" />
                <span>{policy}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Cancellation */}
        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 md:p-8">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-zinc-900 dark:text-white">
            <XCircle size={20} className="text-emerald-600" />
            {tr.cancellationTitle}
          </h2>
          <ul className="space-y-3">
            {tr.cancellationPolicies.map((policy, i) => (
              <li key={i} className="flex items-start gap-3 text-zinc-700 dark:text-zinc-300">
                <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-500" />
                <span>{policy}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Client requirements */}
        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 md:p-8">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-zinc-900 dark:text-white">
            <UserCheck size={20} className="text-emerald-600" />
            {tr.requirementsTitle}
          </h2>
          <ul className="space-y-3">
            {tr.requirements.map((req, i) => (
              <li key={i} className="flex items-start gap-3 text-zinc-700 dark:text-zinc-300">
                <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-500" />
                <span>{req}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Safety briefing */}
        <section className="rounded-2xl border border-emerald-100 bg-emerald-50 p-6 shadow-sm dark:border-emerald-900/40 dark:bg-emerald-950/30 md:p-8">
          <h2 className="mb-3 flex items-center gap-2 text-xl font-semibold text-emerald-900 dark:text-emerald-300">
            <ShieldCheck size={20} />
            {tr.briefingTitle}
          </h2>
          <p className="leading-relaxed text-emerald-800 dark:text-emerald-200">{tr.briefingText}</p>
        </section>

        {/* Risks */}
        <section className="rounded-2xl border border-amber-100 bg-amber-50 p-6 shadow-sm dark:border-amber-900/40 dark:bg-amber-950/20 md:p-8">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-amber-900 dark:text-amber-300">
            <AlertTriangle size={20} />
            {tr.risksTitle}
          </h2>
          <ul className="mb-4 space-y-2">
            {tr.risks.map((risk, i) => (
              <li key={i} className="flex items-start gap-3 text-amber-800 dark:text-amber-200">
                <AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber-500" />
                <span>{risk}</span>
              </li>
            ))}
          </ul>
          <p className="text-sm leading-relaxed text-amber-700 dark:text-amber-300">{tr.risksNote}</p>
        </section>
      </div>
    </main>
  );
}
