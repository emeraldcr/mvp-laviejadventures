"use client";

import DynamicHeroHeader from "@/app/components/sections/DynamicHeroHeader";
import {
  ArrowRight,
  Bird,
  CalendarClock,
  CheckCircle2,
  Compass,
  ExternalLink,
  Mail,
  MapPin,
  MessageCircle,
  Mountain,
  Phone,
  ShieldCheck,
  Sparkles,
  TreePine,
} from "lucide-react";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/lib/LanguageContext";
import { translations } from "@/lib/translations";

const socialLinks = [
  {
    label: "WhatsApp",
    href: "https://wa.me/50662332535",
    bg: "bg-[#25D366]",
    hover: "hover:bg-[#1ebe5d]",
    ring: "focus-visible:ring-green-300",
    featured: true,
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    ),
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/laviejaadventures",
    bg: "bg-[#1877F2]",
    hover: "hover:bg-[#0d6be0]",
    ring: "focus-visible:ring-blue-300",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/laviejaadventures",
    bg: "bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400",
    hover: "hover:opacity-90",
    ring: "focus-visible:ring-pink-300",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    ),
  },
  {
    label: "TikTok",
    href: "https://www.tiktok.com/@la.vieja.adventur",
    bg: "bg-black",
    hover: "hover:bg-zinc-800",
    ring: "focus-visible:ring-zinc-300",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
      </svg>
    ),
  },
  {
    label: "X (Twitter)",
    href: "https://x.com/adventuresvieja",
    bg: "bg-zinc-900",
    hover: "hover:bg-black",
    ring: "focus-visible:ring-zinc-300",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.259 5.63L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
      </svg>
    ),
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/@laviejaadventures",
    bg: "bg-[#FF0000]",
    hover: "hover:bg-[#cc0000]",
    ring: "focus-visible:ring-red-300",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
];

const youtubeVideos = [
  "Oy2Hm2g6PJQ",
  "kqw7n0BQb-Y",
  "8GKq7rw6ZcQ",
  "Fuuquz1FsjI",
];

const googleMapsUrl =
  "https://www.google.com/maps/search/?api=1&query=La+Vieja+Adventures+Canyon+Tour+Sucre+Ciudad+Quesada";
const googleMapsEmbedUrl =
  "https://www.google.com/maps?q=La+Vieja+Adventures+Canyon+Tour+Sucre+Ciudad+Quesada&output=embed";
const wazeUrl = "https://waze.com/ul?ll=10.330,-84.430&navigate=yes";
const wazeEmbedUrl = "https://embed.waze.com/iframe?zoom=14&lat=10.330&lon=-84.430";

const whyIcons = [TreePine, Mountain, Bird, MapPin];
const whyColors = [
  "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
  "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
  "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
];
const whatsappHref = "https://wa.me/50662332535?text=Hola%2C%20quiero%20reservar%20un%20tour%20en%20La%20Vieja%20Adventures.%20Me%20pueden%20ayudar%20con%20la%20disponibilidad%20y%20los%20detalles%3F";

export default function InfoPage() {
  const { lang } = useLanguage();
  const tr = translations[lang].info;

  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50 via-zinc-50 to-white dark:from-zinc-950 dark:via-zinc-950 dark:to-zinc-900">
      <DynamicHeroHeader showHeroSlider={false} />

      {/* Floating WhatsApp CTA */}
      <a
        href="https://wa.me/50662332535"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-sm font-bold text-white shadow-2xl shadow-green-700/30 transition-all hover:scale-105 hover:bg-[#1ebe5d] hover:shadow-green-600/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-300"
        aria-label="Reservar por WhatsApp"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
        WhatsApp
      </a>

      <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-10">

        {/* Hero CTA */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 p-8 shadow-2xl shadow-emerald-900/30 md:p-12">
          <div className="pointer-events-none absolute inset-0 opacity-10">
            <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-white/30 blur-3xl" />
            <div className="absolute -bottom-10 -left-10 h-64 w-64 rounded-full bg-emerald-300/30 blur-3xl" />
          </div>
          <div className="relative z-10 flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl space-y-4">
              <p className="inline-flex w-fit items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-sm font-semibold text-white backdrop-blur-sm">
                <Sparkles size={14} />
                {tr.badge}
              </p>
              <h1 className="text-3xl font-extrabold tracking-tight text-white drop-shadow md:text-4xl lg:text-5xl">
                {tr.title}
              </h1>
              <p className="text-base leading-relaxed text-emerald-100 md:text-lg">
                {tr.description}
              </p>
            </div>

            <div className="flex shrink-0 flex-col gap-3 rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm md:min-w-[260px]">
              <p className="text-sm font-semibold text-white">{tr.quickBookingTitle}</p>
              <p className="text-sm leading-relaxed text-emerald-50">{tr.quickBookingDescription}</p>
              <Link
                href="/reservar"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3 text-sm font-bold text-emerald-700 shadow-lg shadow-black/20 transition hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                {tr.quickBookingPrimary}
                <ArrowRight size={16} />
              </Link>
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <MessageCircle size={16} />
                {tr.quickBookingSecondary}
              </a>
            </div>
          </div>
        </section>

        {/* Tours & Rates */}
        <section className="grid gap-6 md:grid-cols-2">
          <article className="group rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950">
            <div className="mb-5 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                <Compass size={20} />
              </span>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                {tr.mainToursTitle}
              </h2>
            </div>
            <ul className="space-y-2.5">
              {tr.tours.map((tour, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-zinc-700 dark:text-zinc-300">
                  <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-500" />
                  <span>{tour}</span>
                </li>
              ))}
            </ul>
          </article>

          <article className="group rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950">
            <div className="mb-5 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300">
                <CalendarClock size={20} />
              </span>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                {tr.ratesTitle}
              </h2>
            </div>
            <div className="space-y-4 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
              <div className="rounded-xl bg-emerald-50 p-4 dark:bg-emerald-900/10">
                <p className="font-medium text-emerald-800 dark:text-emerald-300">{tr.ratesText1}</p>
              </div>
              <p>{tr.ratesText2}</p>
              <p>{tr.ratesText3}</p>
            </div>
          </article>
        </section>

        <section className="rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-amber-50 p-6 shadow-sm dark:border-emerald-900/40 dark:from-emerald-950/50 dark:via-zinc-950 dark:to-amber-950/20 md:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-700 dark:text-emerald-300">
                {tr.bookingStepsTitle}
              </p>
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
                {tr.quickBookingTitle}
              </h2>
              <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                {tr.quickBookingDescription}
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/reservar"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
              >
                {tr.quickBookingPrimary}
                <ArrowRight size={16} />
              </Link>
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-white px-5 py-3 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50 dark:border-emerald-900/40 dark:bg-zinc-950 dark:text-emerald-300"
              >
                <MessageCircle size={16} />
                {tr.quickBookingSecondary}
              </a>
            </div>
          </div>
          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {tr.bookingSteps.map((step, index) => (
              <div key={step} className="rounded-2xl border border-white/70 bg-white/80 p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/70">
                <div className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white">
                  {index + 1}
                </div>
                <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">{step}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Story Section */}
        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 md:p-10">
          <div className="mb-8 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
              <Mountain size={20} />
            </span>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
              {tr.storyTitle}
            </h2>
          </div>

          <div className="space-y-10">
            {tr.storyParagraphs.map((paragraph, index) => {
              const images = [
                "/image/IMG_6813.jpg",
                "/image/IMG_6805.jpg",
                "/image/IMG_4522.jpg",
              ];

              return (
                <div
                  key={paragraph}
                  className={`grid items-center gap-6 ${index % 2 === 0 ? "md:grid-cols-[1.2fr_0.8fr]" : "md:grid-cols-[0.8fr_1.2fr]"}`}
                >
                  <p className={`text-base leading-relaxed text-zinc-700 dark:text-zinc-300 ${index % 2 === 1 ? "md:order-2" : ""}`}>
                    {paragraph}
                  </p>
                  <div className={`relative h-56 overflow-hidden rounded-2xl shadow-md ${index % 2 === 1 ? "md:order-1" : ""}`}>
                    <Image
                      src={images[index]}
                      alt={lang === "es" ? `Momento de la experiencia Ciudad Esmeralda ${index + 1}` : `Ciudad Esmeralda experience moment ${index + 1}`}
                      fill
                      className="object-cover transition duration-500 hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 40vw"
                    />
                    <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-black/10" />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Why Us + Contact */}
        <section className="grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
          <article className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 md:p-8">
            <div className="mb-6 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">
                <ShieldCheck size={20} />
              </span>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                {tr.whyTitle}
              </h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[tr.why1, tr.why2, tr.why3, tr.why4].map((why, i) => {
                const Icon = whyIcons[i];
                return (
                  <div key={i} className="rounded-xl border border-zinc-100 bg-zinc-50 p-4 transition hover:border-zinc-200 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                    <span className={`mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg ${whyColors[i]}`}>
                      <Icon size={18} />
                    </span>
                    <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">{why}</p>
                  </div>
                );
              })}
            </div>
          </article>

          <article className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="mb-4 text-xl font-bold text-zinc-900 dark:text-white">
              {tr.contactTitle}
            </h2>
            <Link
              href="/reservar"
              className="mb-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
            >
              {tr.quickBookingPrimary}
              <ArrowRight size={16} />
            </Link>
            <ul className="mb-6 space-y-3 text-sm text-zinc-700 dark:text-zinc-300">
              <li className="flex items-start gap-3">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                  <Phone size={14} />
                </span>
                <span><strong className="font-semibold text-zinc-900 dark:text-white">{tr.phoneLabel}</strong> +506 8643-0807</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                  <Mail size={14} />
                </span>
                <span><strong className="font-semibold text-zinc-900 dark:text-white">{tr.emailLabel}</strong> ciudadesmeraldacr@gmail.com</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                  <MapPin size={14} />
                </span>
                <span>
                  <strong className="font-semibold text-zinc-900 dark:text-white">{tr.locationLabel}</strong>{" "}
                  {tr.locationDetail}
                </span>
              </li>
            </ul>

            <div className="grid gap-2.5 sm:grid-cols-2">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 ${social.bg} ${social.hover} ${social.ring} ${social.featured ? "sm:col-span-2" : ""}`}
                >
                  {social.icon}
                  {social.label}
                </a>
              ))}
            </div>
          </article>
        </section>

        {/* Maps + What to bring */}
        <section className="grid gap-6 md:grid-cols-2">
          <article className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300">
                <MapPin size={20} />
              </span>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                {tr.mapsTitle}
              </h2>
            </div>
            <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">{tr.mapsDescription}</p>
            <div className="mb-4 grid gap-3 sm:grid-cols-2">
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                {tr.openInGoogleMaps}
                <ExternalLink size={14} />
              </a>
              <a
                href={wazeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-700"
              >
                {tr.openInWaze}
                <ExternalLink size={14} />
              </a>
            </div>
            <div className="space-y-3">
              <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
                <iframe
                  title="La Vieja Adventures en Google Maps"
                  src={googleMapsEmbedUrl}
                  loading="lazy"
                  className="h-52 w-full"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
              <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
                <iframe
                  title="La Vieja Adventures en Waze"
                  src={wazeEmbedUrl}
                  loading="lazy"
                  className="h-52 w-full"
                />
              </div>
            </div>
          </article>

          <article className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <div className="mb-5 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                <TreePine size={20} />
              </span>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                {tr.whatToBringTitle}
              </h2>
            </div>
            <ul className="mb-6 space-y-2.5">
              {tr.whatToBringItems.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm text-zinc-700 dark:text-zinc-300">
                  <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-emerald-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-900">
              <h3 className="mb-4 text-base font-bold text-zinc-900 dark:text-white">{tr.tourFlowTitle}</h3>
              <ol className="space-y-3">
                {tr.tourFlowItems.map((item, idx) => (
                  <li key={idx} className="flex gap-3 text-sm text-zinc-700 dark:text-zinc-300">
                    <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
                      {idx + 1}
                    </span>
                    <span className="pt-0.5">{item}</span>
                  </li>
                ))}
              </ol>
            </div>
          </article>
        </section>

        {/* Videos */}
        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 md:p-8">
          <h2 className="mb-6 text-2xl font-bold text-zinc-900 dark:text-white">{tr.videosTitle}</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {youtubeVideos.map((videoId) => (
              <div key={videoId} className="overflow-hidden rounded-xl border border-zinc-200 shadow-sm dark:border-zinc-800">
                <iframe
                  className="aspect-video w-full"
                  src={`https://www.youtube.com/embed/${videoId}`}
                  title={`YouTube video ${videoId}`}
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
