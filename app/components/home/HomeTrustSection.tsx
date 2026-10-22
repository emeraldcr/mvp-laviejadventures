"use client";

import Link from "next/link";
import {
  ArrowRight,
  Check,
  CloudRain,
  Compass,
  MapPin,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import GoogleRating from "@/app/components/GoogleRating";
import { localizeHref } from "@/lib/i18n";
import { LA_VIEJA_GOOGLE_MAPS_URL, LA_VIEJA_LOCATION_LABEL } from "@/lib/constants/location";
import type { TourSummary } from "@/lib/types/index";
import { useLanguage } from "@/lib/LanguageContext";
import { BOOKING_HREF } from "./home-utils";

type Props = { tour?: TourSummary };

export default function HomeTrustSection({ tour }: Props) {
  const { lang } = useLanguage();
  const isEs = lang === "es";
  const inclusions = (tour?.inclusions ?? []).filter(Boolean).slice(0, 4);
  const visibleInclusions = inclusions.length > 0
    ? inclusions
    : isEs
      ? ["Guía local bilingüe", "Charla de seguridad", "Acceso a la ruta", "Recorrido de 3–4 horas"]
      : ["Local bilingual guide", "Safety briefing", "Route access", "3–4 hour outing"];

  const trustItems = [
    {
      icon: ShieldCheck,
      title: isEs ? "Seguridad antes que el show" : "Safety before the show",
      body: isEs
        ? "El guía revisa el terreno, el clima y el nivel del río antes de entrar. Si no está seguro, el cañón espera."
        : "Your guide checks the terrain, weather, and river conditions before departure. If it is not safe, the canyon waits.",
      tone: "bg-[var(--lva-surface)] text-[var(--lva-ink)] border-[var(--lva-border)]",
    },
    {
      icon: Users,
      title: isEs ? "Guía de la zona · grupos pequeños" : "Local guide · small groups",
      body: isEs
        ? "Conoce los senderos, el cañón y cuándo el río manda. Menos gente, más atención a cada persona."
        : "Knows the trails, the canyon, and when the river calls the shots. Fewer people means more attention for each guest.",
      tone: "bg-[var(--lva-surface)] text-[var(--lva-ink)] border-[var(--lva-border)]",
    },
    {
      icon: CloudRain,
      title: isEs ? "¿Y si llueve?" : "What if it rains?",
      body: isEs
        ? "Lluvia fuerte o río crecido: no forzamos el cañón. Le ofrecemos una alternativa segura o reprogramamos según la política."
        : "Heavy rain or a rising river means no canyon push. We offer a safer alternative or reschedule according to the policy.",
      tone: "bg-[var(--lva-surface)] text-[var(--lva-ink)] border-[var(--lva-border)]",
    },
  ];

  const fitCards = isEs
    ? [
        { icon: Compass, title: "Quiero aventura", body: "Ciudad Esmeralda: cañón, río, cascada y buena condición física.", href: "/tour/tour-ciudad-esmeralda" },
        { icon: Sparkles, title: "Quiero algo tranquilo", body: "Pozas y cascadas: agua cristalina, fotos y un ritmo más relajado.", href: "/tours" },
        { icon: Users, title: "Voy con familia", body: "Compare experiencias y elija una salida acorde al ritmo de su grupo.", href: "/tours" },
      ]
    : [
        { icon: Compass, title: "I want adventure", body: "Ciudad Esmeralda: canyon, river, waterfall, and solid fitness required.", href: "/en/tour/tour-ciudad-esmeralda" },
        { icon: Sparkles, title: "I want it easy", body: "Pools and waterfalls: clear water, photos, and a slower pace.", href: "/en/tours" },
        { icon: Users, title: "I am with family", body: "Compare experiences and choose a departure that fits your group.", href: "/en/tours" },
      ];

  return (
    <section id="confianza" className="lva-home-section py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[.85fr_1.15fr] lg:items-end">
          <div>
            <p className="lva-home-kicker">
              {isEs ? "Antes de reservar" : "Before you book"}
            </p>
            <h2 className="mt-3 max-w-xl font-display text-balance text-4xl font-black leading-[.98] tracking-tight text-stone-950 dark:text-white md:text-6xl">
              {isEs ? "La aventura se disfruta más cuando todo está claro." : "Adventure feels better when everything is clear."}
            </h2>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-stone-600 dark:text-stone-300 md:text-lg">
              {isEs
                ? "Somos de acá y le contamos lo importante antes de que usted llegue: quién guía, qué incluye, cómo cuidamos el río y qué hacemos si la lluvia se pone seria."
                : "We are from here, so we tell you what matters before you arrive: who guides, what is included, how we protect the river, and what happens when rain gets serious."}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <GoogleRating locale={lang} />
              <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">
                {isEs ? "Reseñas públicas del operador" : "Public operator reviews"}
              </span>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {trustItems.map(({ icon: Icon, title, body, tone }) => (
              <article key={title} className={`lva-home-panel rounded-[var(--lva-radius-soft)] p-5 shadow-none ${tone}`}>
                <Icon size={22} aria-hidden />
                <h3 className="mt-5 text-base font-black leading-tight">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed opacity-80">{body}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-[1fr_1fr]">
          <article className="rounded-[2rem] bg-white p-7 shadow-[0_14px_45px_rgba(46,42,37,.08)] dark:bg-stone-900 md:p-9">
            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-300">{isEs ? "Qué incluye" : "What is included"}</p>
                <h3 className="mt-2 font-display text-2xl font-black text-stone-950 dark:text-white">{isEs ? "Sin letra pequeña" : "No fine print"}</h3>
              </div>
              <Check className="mt-1 text-emerald-600" aria-hidden />
            </div>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {visibleInclusions.map((item) => <li key={item} className="flex gap-2 text-sm leading-relaxed text-stone-700 dark:text-stone-300"><Check size={17} className="mt-0.5 shrink-0 text-emerald-600" />{item}</li>)}
            </ul>
            <Link href={localizeHref(BOOKING_HREF, lang)} className="mt-7 inline-flex items-center gap-2 text-sm font-black text-emerald-700 hover:text-emerald-900 dark:text-emerald-300 dark:hover:text-emerald-200">
              {isEs ? "Ver qué incluye" : "See what’s included"}<ArrowRight size={16} />
            </Link>
          </article>

          <article className="rounded-[2rem] bg-[#2e2a25] p-7 text-white shadow-[0_14px_45px_rgba(46,42,37,.15)] md:p-9">
            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-[#70eee1]">{isEs ? "Cómo llegar" : "How to get here"}</p>
                <h3 className="mt-2 font-display text-2xl font-black">{isEs ? "Punto de encuentro claro" : "A clear meeting point"}</h3>
              </div>
              <MapPin className="mt-1 text-[#00c4b0]" aria-hidden />
            </div>
            <p className="mt-6 text-sm leading-relaxed text-white/75">{LA_VIEJA_LOCATION_LABEL}</p>
            <p className="mt-3 text-xs leading-relaxed text-white/55">{isEs ? "La hora exacta y las indicaciones finales se confirman con su reserva. Si viene por carretera y el clima está raro, escríbanos antes de salir." : "Your exact time and final directions are confirmed with your booking. If weather looks unusual, message us before leaving the main road."}</p>
            <a href={LA_VIEJA_GOOGLE_MAPS_URL} target="_blank" rel="noopener noreferrer" className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-full bg-[#00c4b0] px-5 text-sm font-black text-[#17211f] transition hover:bg-[#70eee1]">
              {isEs ? "Abrir en Google Maps" : "Open in Google Maps"}<ArrowRight size={16} />
            </a>
          </article>
        </div>

        <div className="mt-16">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div><p className="lva-home-kicker">{isEs ? "Encuentre su ritmo" : "Find your pace"}</p><h3 className="mt-2 font-display text-3xl font-black text-stone-950 dark:text-white md:text-4xl">{isEs ? "¿Cuál tour es para usted?" : "Which tour fits you?"}</h3></div>
            <Link href={localizeHref("/tours", lang)} className="inline-flex items-center gap-2 text-sm font-black text-emerald-700 dark:text-emerald-300">{isEs ? "Comparar todos" : "Compare all"}<ArrowRight size={16} /></Link>
          </div>
          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {fitCards.map(({ icon: Icon, title, body, href }) => <Link key={title} href={href} className="lva-home-panel group rounded-[var(--lva-radius-soft)] p-6 shadow-none transition hover:-translate-y-1 hover:border-emerald-400 hover:shadow-lg"><Icon className="text-emerald-700 dark:text-emerald-300" size={22} /><h4 className="mt-5 font-black text-stone-950 dark:text-white">{title}</h4><p className="mt-2 text-sm leading-relaxed text-stone-600 dark:text-stone-300">{body}</p><span className="mt-5 inline-flex items-center gap-1 text-xs font-black text-emerald-700 dark:text-emerald-300">{isEs ? "Ver opciones" : "See options"}<ArrowRight size={14} className="transition group-hover:translate-x-1" /></span></Link>)}
          </div>
        </div>
      </div>
    </section>
  );
}
