"use client";

import Image from "next/image";
import { ArrowRight, Check, Clock3, MessageCircle, Sparkles, Star } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import type { TourSummary } from "@/lib/types/index";
import { WHATSAPP_HREF } from "./home-utils";

type Props = {
  tours: TourSummary[];
  onSelectTour: (slug: string) => void;
};

export default function FeaturedStory({ tours, onSelectTour }: Props) {
  const { lang } = useLanguage();
  const isEs = lang === "es";

  if (tours.length === 0) return null;

  const inclusions = isEs
    ? [
        "Cañón Ciudad Esmeralda y pozas cristalinas",
        "Avistamiento de aves y volcanes dormidos",
        "Tours gastronómicos y experiencias sensoriales",
        "Guías locales certificados en cada ruta",
      ]
    : [
        "Ciudad Esmeralda canyon and crystal pools",
        "Birdwatching and dormant volcano hikes",
        "Gastronomic and sensory experiences",
        "Certified local guides on every route",
      ];

  const steps = [
    {
      num: "01",
      title: isEs ? "Elegí el tour" : "Pick your tour",
      body: isEs
        ? "Explorá las experiencias y encontrá la que va con tu grupo."
        : "Browse the experiences and find the one that fits your group.",
    },
    {
      num: "02",
      title: isEs ? "Reservá en línea" : "Book online",
      body: isEs
        ? "Fecha, personas y pago seguro. Confirmación inmediata al correo."
        : "Date, guests, and secure payment. Instant confirmation by email.",
    },
    {
      num: "03",
      title: isEs ? "Salí a la aventura" : "Head out on your adventure",
      body: isEs
        ? "Llegás con guías locales, equipo listo y una ruta pensada para tu grupo y el clima del día."
        : "Arrive with local guides, gear ready, and a route tailored to your group and the day's weather.",
    },
  ];

  return (
    <section className="bg-white py-20 dark:bg-[#0b0a09] md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div className="relative">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2.5rem]">
              <Image
                src="/image/IMG_4671.jpg"
                alt={isEs ? "Experiencias en la naturaleza de Costa Rica" : "Nature experiences in Costa Rica"}
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            </div>

            <span className="absolute left-6 top-6 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-4 py-2 text-xs font-bold text-stone-900 shadow-lg backdrop-blur-sm">
              <Sparkles size={13} className="text-amber-500" />
              {isEs ? `${tours.length} experiencias` : `${tours.length} experiences`}
            </span>

            <div className="absolute -bottom-6 right-4 w-56 rounded-2xl bg-white p-4 shadow-[0_20px_60px_rgba(0,0,0,0.15)] dark:bg-stone-900 dark:shadow-[0_20px_60px_rgba(0,0,0,0.5)] dark:ring-1 dark:ring-white/10 sm:right-8 sm:w-64">
              <span className="flex gap-0.5 text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={13} className="fill-current" />
                ))}
              </span>
              <p className="mt-2 text-xs leading-relaxed text-stone-600 dark:text-stone-300">
                {isEs
                  ? "“Desde el cañón hasta las pozas, cada tour fue distinto y todos nos dejaron con ganas de volver.”"
                  : "“From the canyon to the pools, every tour was different and all of them made us want to come back.”"}
              </p>
              <p className="mt-2 text-[11px] font-bold text-stone-900 dark:text-stone-100">— María F.</p>
            </div>
          </div>

          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-emerald-700 dark:text-emerald-300">
              {isEs ? "San Carlos · Juan Castro Blanco" : "San Carlos · Juan Castro Blanco"}
            </p>
            <h2 className="font-display text-balance text-4xl font-bold leading-[1.02] tracking-tight text-stone-900 dark:text-stone-50 md:text-5xl">
              {isEs ? "Naturaleza viva, experiencias para cada estilo" : "Living nature, experiences for every style"}
            </h2>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-stone-600 dark:text-stone-300 md:text-lg">
              {isEs
                ? "Somos un proyecto familiar con rutas por cañón, río, bosque nuboso y corredor biológico. Elegí la intensidad que va con tu grupo — desde pozas tranquilas hasta aventura de verdad."
                : "We are a family-run project with routes through canyon, river, cloud forest, and biological corridor. Choose the intensity that fits your group — from calm pools to real adventure."}
            </p>

            <ul className="mt-7 grid gap-3 sm:grid-cols-2">
              {inclusions.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-stone-700 dark:text-stone-200">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40">
                    <Check size={12} className="text-emerald-700 dark:text-emerald-300" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-wrap items-center gap-5">
              <div>
                <span className="block text-xs font-medium uppercase tracking-widest text-stone-400 dark:text-stone-500">
                  {isEs ? "Experiencias disponibles" : "Available experiences"}
                </span>
                <span className="font-display text-3xl font-bold text-stone-900 dark:text-stone-50">
                  {tours.length}
                </span>
                <span className="ml-1.5 text-sm text-stone-500 dark:text-stone-400">
                  {isEs ? "tours en la zona" : "tours in the area"}
                </span>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-stone-100 px-3.5 py-2 text-xs font-semibold text-stone-600 dark:bg-stone-800 dark:text-stone-300">
                <Clock3 size={13} />
                {isEs ? "2 h a día completo" : "2 h to full day"}
              </span>
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => onSelectTour(tours[0]?.slug ?? "")}
                className="group inline-flex items-center gap-2 rounded-full bg-emerald-600 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/25 transition-all hover:-translate-y-0.5 hover:bg-emerald-500"
              >
                {isEs ? "Ver fechas" : "See dates"}
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </button>
              <a
                href={WHATSAPP_HREF}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-stone-300 px-7 py-3.5 text-sm font-bold text-stone-800 transition-colors hover:border-emerald-600 hover:text-emerald-700 dark:border-stone-600 dark:text-stone-200 dark:hover:border-emerald-400 dark:hover:text-emerald-300"
              >
                <MessageCircle size={16} />
                {isEs ? "Preguntar por WhatsApp" : "Ask on WhatsApp"}
              </a>
            </div>
          </div>
        </div>

        <div className="mt-24 md:mt-32">
          <div className="mb-10 text-center">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-emerald-700 dark:text-emerald-300">
              {isEs ? "Así de fácil" : "This easy"}
            </p>
            <h2 className="font-display text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-50 md:text-4xl">
              {isEs ? "De tu pantalla al bosque en tres pasos" : "From your screen to the forest in three steps"}
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {steps.map((step) => (
              <div
                key={step.num}
                className="rounded-3xl border border-stone-200 bg-[#FAF9F6] p-8 transition-all hover:-translate-y-1 hover:border-emerald-200 hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)] dark:border-stone-800 dark:bg-white/[0.03] dark:hover:border-emerald-500/40"
              >
                <span className="font-display text-sm font-bold text-emerald-700 dark:text-emerald-300">{step.num}</span>
                <h3 className="font-display mt-3 text-xl font-bold tracking-tight text-stone-900 dark:text-stone-50">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-stone-600 dark:text-stone-300">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}