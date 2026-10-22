"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Binoculars, Compass, Utensils, Waves } from "lucide-react";
import { useMemo, useState } from "react";
import { useLanguage } from "@/lib/LanguageContext";
import { localizeHref, tourDifficulty, tourDuration } from "@/lib/i18n";
import { getTourImage } from "@/lib/tour-display";
import type { TourSummary } from "@/lib/types/index";
import { getTourPriceDisplay, tourTitle } from "./home-utils";

type DayType = "active" | "water" | "wildlife" | "culture";

const DAY_TYPES = [
  { key: "active" as const, icon: Compass, labelEs: "Aventura activa", labelEn: "Active adventure", bodyEs: "Cañón, rapel, ATV y senderos para moverse de verdad.", bodyEn: "Canyons, rappelling, ATV, and trails to really get moving.", slugs: ["tour-ciudad-esmeralda", "ciudad-esmeralda", "rapel-canon-del-rio", "cuadra-tours-aventura", "caminata-volcanes-dormidos"] },
  { key: "water" as const, icon: Waves, labelEs: "Agua relajada", labelEn: "Relaxed water", bodyEs: "Pozas, cascadas y bosque con un ritmo más tranquilo.", bodyEn: "Pools, waterfalls, and forest at an easier pace.", slugs: ["pozas-cristalinas", "cascadas-secretas-rio-la-vieja", "lluvia-en-la-naturaleza"] },
  { key: "wildlife" as const, icon: Binoculars, labelEs: "Vida silvestre", labelEn: "Wildlife", bodyEs: "Aves, bosque y los sonidos que hacen especial la zona.", bodyEn: "Birds, forest, and the sounds that make this place special.", slugs: ["avistamiento-aves", "avistamiento-aves-norteno", "tour-nocturno-la-vieja", "caminata-volcanes-dormidos"] },
  { key: "culture" as const, icon: Utensils, labelEs: "Cultura local", labelEn: "Local culture", bodyEs: "Comida, historias y una mirada más cercana a San Carlos.", bodyEn: "Food, stories, and a closer look at San Carlos.", slugs: ["tour-gastronomico-local", "lluvia-en-la-naturaleza"] },
];

export default function HomeTourDiscovery({ tours }: { tours: TourSummary[] }) {
  const { lang } = useLanguage();
  const isEs = lang === "es";
  const [selected, setSelected] = useState<DayType>("active");
  const selectedType = DAY_TYPES.find((item) => item.key === selected);
  const matches = useMemo(() => {
    if (!selectedType) return [];
    return [...tours]
      .sort((a, b) => selectedType.slugs.indexOf(a.slug) - selectedType.slugs.indexOf(b.slug))
      .filter((tour) => selectedType.slugs.includes(tour.slug))
      .slice(0, 3);
  }, [selectedType, tours]);

  return (
    <section id="descubrir" className="lva-home-section py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="lva-home-kicker">{isEs ? "Primero, el ritmo del día" : "First, choose your pace"}</p>
            <h2 className="mt-3 font-display text-balance text-3xl font-black leading-[1.04] tracking-tight text-stone-950 dark:text-white md:text-5xl">{isEs ? "¿Qué tipo de día está buscando?" : "What kind of day are you looking for?"}</h2>
            <p className="mt-4 text-base leading-relaxed text-stone-600 dark:text-stone-300">{isEs ? "Elija la vibra y compare experiencias que sí combinan con su grupo. Ciudad Esmeralda es una opción, no la única, mae." : "Choose the vibe and compare experiences that fit your group. Ciudad Esmeralda is one option, not the only one."}</p>
          </div>
          <Link href={localizeHref("/tours", lang)} className="lva-button-primary shrink-0">
            {isEs ? "Ver todos los tours" : "See all tours"}<ArrowRight size={16} />
          </Link>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {DAY_TYPES.map(({ key, icon: Icon, labelEs, labelEn, bodyEs, bodyEn }) => {
            const active = selected === key;
            return <button key={key} type="button" aria-pressed={active} onClick={() => setSelected(key)} className={`min-h-36 rounded-[var(--lva-radius-soft)] border p-5 text-left transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 ${active ? "border-[var(--lva-accent)] bg-[var(--lva-accent)] text-white shadow-lg" : "border-[var(--lva-border)] bg-[var(--lva-surface)] text-[var(--lva-ink)] shadow-sm"}`}>
              <Icon size={23} className={active ? "text-[#70eee1]" : "text-emerald-700 dark:text-emerald-300"} aria-hidden />
              <strong className="mt-5 block text-base font-black">{isEs ? labelEs : labelEn}</strong>
              <span className={`mt-1 block text-sm leading-snug ${active ? "text-white/75" : "text-stone-500 dark:text-stone-400"}`}>{isEs ? bodyEs : bodyEn}</span>
            </button>;
          })}
        </div>

        {selectedType && <div className="mt-8" aria-live="polite">
          <div className="flex items-end justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-300">{selected === "active" ? (isEs ? "Una buena primera opción" : "A good first option") : (isEs ? "Experiencias para comparar" : "Experiences to compare")}</p><h3 className="mt-2 font-display text-2xl font-black text-stone-950 dark:text-white">{isEs ? selectedType.labelEs : selectedType.labelEn}</h3></div><Link href={localizeHref("/tours", lang)} className="hidden items-center gap-2 text-sm font-black text-emerald-800 sm:inline-flex dark:text-emerald-300">{isEs ? "Ver todos" : "See all"}<ArrowRight size={15} /></Link></div>
          {matches.length > 0 ? <div className="mt-5 grid gap-5 md:grid-cols-3">
            {matches.map((tour) => <article key={tour.slug} className="lva-home-panel overflow-hidden"><Link href={localizeHref(`/tour/${encodeURIComponent(tour.slug)}`, lang)}><div className="relative aspect-[16/10]"><Image src={getTourImage(tour.slug)} alt={tourTitle(tour, isEs)} fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover" /></div><div className="p-5"><h4 className="font-display text-xl font-black">{tourTitle(tour, isEs)}</h4><div className="lva-home-meta mt-2 flex flex-wrap gap-3 font-bold">{tour.duration && <span>{tourDuration(tour.duration, lang)}</span>}{tour.difficulty && <span>{tourDifficulty(tour.difficulty, lang)}</span>}<span>{getTourPriceDisplay(tour, isEs).primary}</span></div><span className="mt-4 inline-flex items-center gap-2 text-xs font-black uppercase tracking-wide text-emerald-800 dark:text-emerald-300">{isEs ? "Comparar detalles" : "Compare details"}<ArrowRight size={14} /></span></div></Link></article>)}
          </div> : <div className="mt-5 rounded-[var(--lva-radius-soft)] border border-[var(--lva-border)] bg-[var(--lva-surface)] p-6"><p className="text-sm text-stone-600 dark:text-stone-300">{isEs ? "Todavía no hay una experiencia publicada en esta categoría." : "There is not a published experience in this category yet."}</p><Link href={localizeHref("/tours", lang)} className="mt-4 inline-flex items-center gap-2 text-sm font-black text-emerald-800 dark:text-emerald-300">{isEs ? "Ver todos los tours" : "See all tours"}<ArrowRight size={15} /></Link></div>}
        </div>}
      </div>
    </section>
  );
}
