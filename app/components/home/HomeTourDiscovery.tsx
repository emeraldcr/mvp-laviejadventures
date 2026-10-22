"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, Check, Compass, HeartHandshake, Sparkles, Waves, type LucideIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { useLanguage } from "@/lib/LanguageContext";
import { localizeHref, tourDifficulty, tourDuration } from "@/lib/i18n";
import { getTourImage } from "@/lib/tour-display";
import type { TourSummary } from "@/lib/types/index";
import { getTourPriceDisplay, tourTitle } from "./home-utils";

type DayType = "adventure" | "water" | "nature" | "premium" | "family";

type DayIntent = { key: DayType; icon: LucideIcon; labelEs: string; labelEn: string; bodyEs: string; bodyEn: string; effortEs: string; effortEn: string; slugs: string[] };

const DAY_TYPES: DayIntent[] = [
  { key: "adventure", icon: Compass, labelEs: "Quiero aventura fuerte", labelEn: "I want strong adventure", bodyEs: "Cañón, rápel, ATV y senderos para moverse de verdad.", bodyEn: "Canyon, rappelling, ATV, and trails for real movement.", effortEs: "Intenso", effortEn: "Intense", slugs: ["tour-ciudad-esmeralda", "ciudad-esmeralda", "rapel-canon-del-rio", "cuadra-tours-aventura", "caminata-volcanes-dormidos"] },
  { key: "water", icon: Waves, labelEs: "Quiero agua y relax", labelEn: "I want water and relaxation", bodyEs: "Pozas, cascadas y bosque con un ritmo más tranquilo.", bodyEn: "Pools, waterfalls, and forest at an easier pace.", effortEs: "Moderado", effortEn: "Moderate", slugs: ["pozas-cristalinas", "cascadas-secretas-rio-la-vieja", "lluvia-en-la-naturaleza"] },
  { key: "nature", icon: Waves, labelEs: "Quiero naturaleza sin exigirme tanto", labelEn: "I want easygoing nature", bodyEs: "Aves, bosque y planes suaves para disfrutar sin carrera.", bodyEn: "Birds, forest, and gentle plans without rushing.", effortEs: "Fácil", effortEn: "Easy", slugs: ["avistamiento-aves-norteno", "avistamiento-aves", "tour-nocturno-la-vieja", "lluvia-en-la-naturaleza", "cascadas-secretas-rio-la-vieja"] },
  { key: "premium", icon: Sparkles, labelEs: "Quiero algo premium", labelEn: "I want something premium", bodyEs: "Una escapada especial, cuidada y con ambiente de descanso.", bodyEn: "A special, thoughtfully hosted escape with room to rest.", effortEs: "Premium / estancia", effortEn: "Premium / stay", slugs: ["domo-geodesico-san-vicente", "domo-geodesico-san-vicente-phoenix-experience", "phoenix-experience"] },
  { key: "family", icon: HeartHandshake, labelEs: "Voy con niños", labelEn: "I'm going with kids", bodyEs: "Opciones compartibles para que el grupo disfrute a su ritmo.", bodyEn: "Shareable options so the whole group can enjoy its own pace.", effortEs: "Fácil", effortEn: "Easy", slugs: ["pozas-cristalinas", "cascadas-secretas-rio-la-vieja", "tour-gastronomico-local", "avistamiento-aves"] },
];

export default function HomeTourDiscovery({ tours }: { tours: TourSummary[] }) {
  const { lang } = useLanguage();
  const isEs = lang === "es";
  const [selected, setSelected] = useState<DayType>("adventure");
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
            <p className="mt-4 text-base leading-relaxed text-stone-600 dark:text-stone-300">{isEs ? "Elegí la vibra y compará experiencias que sí combinan con tu grupo. Ciudad Esmeralda es una opción, no la única, mae." : "Choose the vibe and compare experiences that fit your group. Ciudad Esmeralda is one option, not the only one."}</p>
          </div>
          <Link href={localizeHref("/tours", lang)} className="lva-button-primary shrink-0">
            {isEs ? "Ver todos los tours" : "See all tours"}<ArrowRight size={16} />
          </Link>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {DAY_TYPES.map(({ key, icon: Icon, labelEs, labelEn, bodyEs, bodyEn, effortEs, effortEn }) => {
            const active = selected === key;
            return <button key={key} type="button" aria-pressed={active} onClick={() => setSelected(key)} className={`group relative min-h-36 rounded-[var(--lva-radius-soft)] border p-5 text-left transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--lva-bg)] ${active ? "border-[var(--lva-accent)] bg-[var(--lva-accent)] text-white shadow-lg" : "border-[var(--lva-border)] bg-[var(--lva-surface)] text-[var(--lva-ink)] shadow-sm hover:border-emerald-500/60"}`}>
              <div className="flex items-start justify-between gap-3">
                <Icon size={23} className={active ? "text-[#70eee1]" : "text-emerald-700 dark:text-emerald-300"} aria-hidden />
                {active && <span className="inline-flex items-center gap-1 rounded-full border border-white/40 bg-white/15 px-2 py-1 text-[10px] font-black uppercase tracking-wide text-white"><Check size={12} aria-hidden />{isEs ? "Elegido" : "Selected"}</span>}
              </div>
              <strong className="mt-5 block text-base font-black">{isEs ? labelEs : labelEn}</strong>
              <span className={`mt-2 inline-flex rounded-full border px-2 py-1 text-[10px] font-black uppercase tracking-wide ${active ? "border-white/40 bg-white/15 text-white" : "border-emerald-700/20 bg-emerald-500/10 text-emerald-800 dark:border-emerald-300/20 dark:text-emerald-200"}`}>{isEs ? effortEs : effortEn}</span>
              <span className={`mt-1 block text-sm leading-snug ${active ? "text-white/75" : "text-stone-500 dark:text-stone-400"}`}>{isEs ? bodyEs : bodyEn}</span>
            </button>;
          })}
        </div>

        {selectedType && <div className="mt-8">
          <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
            {isEs ? `${matches.length} ${matches.length === 1 ? "experiencia coincide" : "experiencias coinciden"} con ${selectedType.labelEs}.` : `${matches.length} ${matches.length === 1 ? "experience matches" : "experiences match"} ${selectedType.labelEn}.`}
          </p>
          <div className="flex items-end justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-300">{selected === "adventure" ? (isEs ? "Una buena primera opción" : "A good first option") : (isEs ? "Experiencias para comparar" : "Experiences to compare")}</p><h3 className="mt-2 font-display text-2xl font-black text-stone-950 dark:text-white">{isEs ? selectedType.labelEs : selectedType.labelEn}</h3></div><Link href={localizeHref("/tours", lang)} className="hidden items-center gap-2 text-sm font-black text-emerald-800 sm:inline-flex dark:text-emerald-300">{isEs ? "Ver todos" : "See all"}<ArrowRight size={15} /></Link></div>
          {matches.length > 0 ? <div className="mt-5 grid gap-5 md:grid-cols-3">
            {matches.map((tour) => <article key={tour.slug} className="lva-home-panel overflow-hidden"><Link href={localizeHref(`/tour/${encodeURIComponent(tour.slug)}`, lang)}><div className="relative aspect-[16/10]"><Image src={getTourImage(tour.slug)} alt={tourTitle(tour, isEs)} fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover" /></div><div className="p-5"><h4 className="font-display text-xl font-black">{tourTitle(tour, isEs)}</h4><div className="lva-home-meta mt-2 flex flex-wrap gap-3 font-bold">{tour.duration && <span>{tourDuration(tour.duration, lang)}</span>}{tour.difficulty && <span>{tourDifficulty(tour.difficulty, lang)}</span>}<span>{getTourPriceDisplay(tour, isEs).primary}</span></div><span className="mt-4 inline-flex items-center gap-2 text-xs font-black uppercase tracking-wide text-emerald-800 dark:text-emerald-300">{isEs ? "Comparar detalles" : "Compare details"}<ArrowRight size={14} /></span></div></Link><Link href={localizeHref(`/reservar?tour=${encodeURIComponent(tour.slug)}`, lang)} className="mx-5 mb-5 inline-flex items-center justify-center gap-2 rounded-full bg-[#00796B] px-4 py-3 text-xs font-black uppercase tracking-wide text-white transition hover:bg-[#00695C] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/40"><CalendarDays size={15} aria-hidden />{isEs ? "Elegir esta experiencia" : "Choose this experience"}<ArrowRight size={14} aria-hidden /></Link></article>)}
          </div> : <div className="mt-5 rounded-[var(--lva-radius-soft)] border border-[var(--lva-border)] bg-[var(--lva-surface)] p-6"><p className="text-sm text-stone-600 dark:text-stone-300">{isEs ? "Todavía no tenemos una experiencia publicada con ese perfil. Escribinos y te ayudamos a armar un plan; no inventamos disponibilidad ni precios." : "We do not have a published experience for that profile yet. Contact us and we will help plan it; availability and prices are always confirmed."}</p><Link href={localizeHref("/tours", lang)} className="mt-4 inline-flex items-center gap-2 text-sm font-black text-emerald-800 dark:text-emerald-300">{isEs ? "Ver todos los tours" : "See all tours"}<ArrowRight size={15} /></Link></div>}
        </div>}
      </div>
    </section>
  );
}
