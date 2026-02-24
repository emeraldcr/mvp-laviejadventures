"use client";

import DynamicHeroHeader from "@/app/components/sections/DynamicHeroHeader";
import {
  ArrowRight,
  Bird,
  CalendarClock,
  Compass,
  Mail,
  MapPin,
  Mountain,
  Phone,
  ShieldCheck,
  Sparkles,
  TreePine,
} from "lucide-react";
import React from "react";
import { useLanguage } from "@/app/context/LanguageContext";
import { translations } from "@/lib/translations";

const socialLinks = [
  {
    label: "WhatsApp",
    href: "https://wa.me/50662332535",
    className:
      "bg-green-600 hover:bg-green-700 focus-visible:ring-green-300 dark:focus-visible:ring-green-700",
    featured: true,
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/laviejaadventures",
    className:
      "bg-blue-700 hover:bg-blue-800 focus-visible:ring-blue-300 dark:focus-visible:ring-blue-700",
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/laviejaadventures",
    className:
      "bg-pink-600 hover:bg-pink-700 focus-visible:ring-pink-300 dark:focus-visible:ring-pink-700",
  },
  {
    label: "TikTok",
    href: "https://www.tiktok.com/@la.vieja.adventur",
    className:
      "bg-black hover:bg-zinc-800 focus-visible:ring-zinc-300 dark:focus-visible:ring-zinc-700",
  },
  {
    label: "X (Twitter)",
    href: "https://x.com/adventuresvieja",
    className:
      "bg-zinc-900 hover:bg-black focus-visible:ring-zinc-300 dark:focus-visible:ring-zinc-700",
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/@laviejaadventures",
    className:
      "bg-red-600 hover:bg-red-700 focus-visible:ring-red-300 dark:focus-visible:ring-red-700",
  },
];

export default function InfoPage() {
  const { lang } = useLanguage();
  const tr = translations[lang].info;

  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50 via-zinc-50 to-white px-4 py-10 dark:from-black dark:via-zinc-950 dark:to-zinc-900">
      <DynamicHeroHeader />

      <div className="mx-auto w-full max-w-6xl space-y-6">
        <section className="rounded-3xl border border-emerald-100 bg-white/90 p-8 shadow-xl backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/90 md:p-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-3xl space-y-4">
              <p className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1 text-sm font-semibold text-emerald-700 dark:border-emerald-800/70 dark:bg-emerald-900/20 dark:text-emerald-300">
                <Sparkles size={16} />
                {tr.badge}
              </p>
              <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white md:text-4xl">
                {tr.title}
              </h1>
              <p className="text-base leading-relaxed text-zinc-700 dark:text-zinc-300">
                {tr.description}
              </p>
            </div>

            <div className="grid w-full gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900 md:max-w-xs">
              <a
                href="https://wa.me/50662332535"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-center text-sm font-semibold text-white shadow-lg shadow-emerald-800/20 transition hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 dark:focus-visible:ring-emerald-700"
              >
                {tr.bookWhatsApp}
                <ArrowRight size={16} />
              </a>
              <a
                href="tel:+50686430807"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-300 px-4 py-3 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                <Phone size={16} />
                {tr.callNow}
              </a>
            </div>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <article className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="mb-4 flex items-center gap-2 text-2xl font-semibold text-zinc-900 dark:text-white">
              <Compass size={20} className="text-emerald-600" />
              {tr.mainToursTitle}
            </h2>
            <ul className="space-y-3 text-zinc-700 dark:text-zinc-300">
              {tr.tours.map((tour, i) => (
                <li key={i} className="flex gap-2">
                  <span className="mt-2 h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
                  <span>{tour}</span>
                </li>
              ))}
            </ul>
          </article>

          <article className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="mb-4 flex items-center gap-2 text-2xl font-semibold text-zinc-900 dark:text-white">
              <CalendarClock size={20} className="text-emerald-600" />
              {tr.ratesTitle}
            </h2>
            <div className="space-y-5 text-zinc-700 dark:text-zinc-300">
              <p>{tr.ratesText1}</p>
              <p>{tr.ratesText2}</p>
              <p>{tr.ratesText3}</p>
            </div>
          </article>
        </section>

        <section className="grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
          <article className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="mb-5 flex items-center gap-2 text-2xl font-semibold text-zinc-900 dark:text-white">
              <ShieldCheck size={20} className="text-emerald-600" />
              {tr.whyTitle}
            </h2>
            <div className="grid gap-4 text-zinc-700 dark:text-zinc-300 sm:grid-cols-2">
              <p className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-900">
                <TreePine size={18} className="mb-2 text-emerald-600" />
                {tr.why1}
              </p>
              <p className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-900">
                <Mountain size={18} className="mb-2 text-emerald-600" />
                {tr.why2}
              </p>
              <p className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-900">
                <Bird size={18} className="mb-2 text-emerald-600" />
                {tr.why3}
              </p>
              <p className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-900">
                <MapPin size={18} className="mb-2 text-emerald-600" />
                {tr.why4}
              </p>
            </div>
          </article>

          <article className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="mb-3 text-2xl font-semibold text-zinc-900 dark:text-white">
              {tr.contactTitle}
            </h2>
            <ul className="mb-6 space-y-2 text-zinc-700 dark:text-zinc-300">
              <li className="flex items-start gap-2">
                <Phone size={16} className="mt-1 text-emerald-600" />
                <span><strong>{tr.phoneLabel}</strong> +506 8643-0807</span>
              </li>
              <li className="flex items-start gap-2">
                <Mail size={16} className="mt-1 text-emerald-600" />
                <span><strong>{tr.emailLabel}</strong> ciudadesmeraldacr@gmail.com</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin size={16} className="mt-1 text-emerald-600" />
                <span>
                  <strong>{tr.locationLabel}</strong>{" "}
                  {lang === "es" ? "Zona Norte, Costa Rica" : "Northern Zone, Costa Rica"}
                </span>
              </li>
            </ul>

            <div className="grid gap-3 sm:grid-cols-2">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center justify-center rounded-xl px-4 py-3 text-center font-semibold text-white shadow-md transition focus-visible:outline-none focus-visible:ring-2 ${social.className} ${social.featured ? "sm:col-span-2" : ""}`}
                >
                  {social.label}
                </a>
              ))}
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}
