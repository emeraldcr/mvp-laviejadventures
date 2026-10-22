"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Binoculars,
  Clock3,
  Compass,
  HeartHandshake,
  MessageCircle,
  Sparkles,
  Waves,
  type LucideIcon,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useLanguage } from "@/lib/LanguageContext";
import { localizeHref, tourDifficulty, tourDuration } from "@/lib/i18n";
import { getTourImage } from "@/lib/tour-display";
import { getTourPriceDisplay, tourTitle, whatsappHref } from "@/app/components/home/home-utils";
import type { PublicTour } from "@/lib/tours/public-catalog";

type IntentKey = "adventure" | "family" | "quiet" | "short" | "birds" | "premium";

type IntentOption = {
  key: IntentKey;
  icon: LucideIcon;
  labelEs: string;
  labelEn: string;
  descriptionEs: string;
  descriptionEn: string;
  preferredSlugs: string[];
};

const INTENT_OPTIONS: IntentOption[] = [
  {
    key: "adventure",
    icon: Compass,
    labelEs: "Quiero aventura",
    labelEn: "I want adventure",
    descriptionEs: "Río, cañón y adrenalina",
    descriptionEn: "River, canyon, and adrenaline",
    preferredSlugs: ["tour-ciudad-esmeralda", "ciudad-esmeralda", "rapel-canon-del-rio", "cuadra-tours-aventura", "caminata-volcanes-dormidos"],
  },
  {
    key: "family",
    icon: HeartHandshake,
    labelEs: "Voy con familia",
    labelEn: "I'm going with family",
    descriptionEs: "Un ritmo más amable para compartir",
    descriptionEn: "A gentler pace to share",
    preferredSlugs: ["pozas-cristalinas", "cascadas-secretas-rio-la-vieja", "tour-gastronomico-local", "avistamiento-aves"],
  },
  {
    key: "quiet",
    icon: Waves,
    labelEs: "Quiero algo tranquilo",
    labelEn: "I want something quiet",
    descriptionEs: "Naturaleza, calma y cero carreras",
    descriptionEn: "Nature, calm, and no rush",
    preferredSlugs: ["pozas-cristalinas", "lluvia-en-la-naturaleza", "tour-gastronomico-local", "cascadas-secretas-rio-la-vieja", "avistamiento-aves"],
  },
  {
    key: "short",
    icon: Clock3,
    labelEs: "Tengo poco tiempo",
    labelEn: "I don't have much time",
    descriptionEs: "Una experiencia corta que sí cabe",
    descriptionEn: "A shorter experience that fits",
    preferredSlugs: ["lluvia-en-la-naturaleza", "tour-gastronomico-local", "tour-nocturno-la-vieja", "cuadra-tours-aventura"],
  },
  {
    key: "birds",
    icon: Binoculars,
    labelEs: "Quiero aves",
    labelEn: "I want birds",
    descriptionEs: "Cantos, bosque y guía local",
    descriptionEn: "Bird calls, forest, and local guidance",
    preferredSlugs: ["avistamiento-aves-norteno", "avistamiento-aves"],
  },
  {
    key: "premium",
    icon: Sparkles,
    labelEs: "Quiero algo premium",
    labelEn: "I want something premium",
    descriptionEs: "Una escapada especial y cuidada",
    descriptionEn: "A special, thoughtfully hosted escape",
    preferredSlugs: ["domo-geodesico-san-vicente", "domo-geodesico-san-vicente-phoenix-experience", "phoenix-experience"],
  },
];

function searchableTourText(tour: PublicTour) {
  return [
    tour.slug,
    tour.titleEs,
    tour.titleEn,
    tour.descriptionEs,
    tour.descriptionEn,
    tour.tagEs,
    tour.tagEn,
    tour.difficulty,
    tour.duration,
  ].filter(Boolean).join(" ").toLowerCase();
}

function maxDurationHours(duration?: string) {
  const values = duration?.replace(",", ".").match(/\d+(?:\.\d+)?/g)?.map(Number) ?? [];
  return values.length > 0 ? Math.max(...values) : Number.POSITIVE_INFINITY;
}

function scoreTour(tour: PublicTour, intent: IntentOption) {
  const text = searchableTourText(tour);
  const preferredIndex = intent.preferredSlugs.indexOf(tour.slug);
  if (preferredIndex >= 0) return 100 - preferredIndex;

  switch (intent.key) {
    case "adventure":
      return /(canon|cañon|canyon|rapel|rappel|atv|cuadra|aventura|volcan)/.test(text)
        ? 12 + (/(extremo|avanzado|intermedio)/.test(text) ? 3 : 0)
        : 0;
    case "family":
      return /(famil|niñ|kids|all ages|todas las edades)/.test(text)
        ? 14
        : /(fácil|easy|relajad|suave|pausad)/.test(text)
          ? 8
          : 0;
    case "quiet":
      return /(tranquil|calmad|relajad|pausad|suave|sensorial|naturaleza|nature)/.test(text)
        ? 12
        : tour.difficulty?.toLowerCase().includes("fácil") || tour.difficulty?.toLowerCase().includes("easy")
          ? 7
          : 0;
    case "short":
      return maxDurationHours(tour.duration) <= 2 ? 12 : maxDurationHours(tour.duration) <= 3 ? 4 : 0;
    case "birds":
      return /(ave|bird|avifauna|canto)/.test(text) ? 20 : 0;
    case "premium":
      return /(domo|phoenix|glamping|premium)/.test(text) ? 20 : 0;
  }
}

function intentReason(intent: IntentOption, tour: PublicTour, isEs: boolean) {
  if (intent.key === "short") {
    return isEs
      ? `${tourDuration(tour.duration ?? "", "es")} para aprovechar el día sin correr, mae.`
      : `${tourDuration(tour.duration ?? "", "en")} so you can enjoy the day without rushing.`;
  }

  const reasons: Record<IntentKey, { es: string; en: string }> = {
    adventure: {
      es: "Tiene la dosis de aventura que busca, con la ruta y la intensidad claras desde el inicio.",
      en: "It brings the adventure level you want, with the route and intensity clear from the start.",
    },
    family: {
      es: "Es una opción más compartible para el grupo, con un ritmo que deja disfrutar a todos.",
      en: "It is easier to share as a group, with a pace that lets everyone enjoy it.",
    },
    quiet: {
      es: "Es un plan para bajar revoluciones y disfrutar la naturaleza sin andar a la carrera.",
      en: "It is a way to slow down and enjoy nature without being rushed.",
    },
    short: { es: "Cabe bien en una agenda apretada.", en: "It fits well into a tight schedule." },
    birds: {
      es: "La experiencia está enfocada en aves, sus cantos y la lectura del bosque.",
      en: "The experience is focused on birds, their calls, and reading the forest.",
    },
    premium: {
      es: "Encaja con una escapada especial, con atención más cuidada y ambiente de descanso.",
      en: "It fits a special escape with more thoughtful hosting and a restful setting.",
    },
  };
  return isEs ? reasons[intent.key].es : reasons[intent.key].en;
}

type Props = {
  candidateTours: PublicTour[];
  onSelectTour: (slug: string) => void;
};

export default function TourIntentGuide({ candidateTours, onSelectTour }: Props) {
  const { lang } = useLanguage();
  const isEs = lang === "es";
  const [selectedKey, setSelectedKey] = useState<IntentKey | null>(null);
  const selectedIntent = INTENT_OPTIONS.find((intent) => intent.key === selectedKey) ?? null;

  const recommendedTour = useMemo(() => {
    if (!selectedIntent) return null;
    return [...candidateTours]
      .map((tour, index) => ({ tour, score: scoreTour(tour, selectedIntent), index }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score || a.index - b.index)[0]?.tour ?? null;
  }, [candidateTours, selectedIntent]);

  const whatsappMessage = isEs
    ? selectedKey === "premium"
      ? "Hola, quiero consultar el Domo Geodésico San Vicente - Phoenix Experience y su disponibilidad."
      : "Hola, quiero ayuda para escoger una experiencia en La Vieja Adventures."
    : selectedKey === "premium"
      ? "Hello, I would like to ask about the San Vicente Geodesic Dome - Phoenix Experience and availability."
      : "Hello, I would like help choosing an experience at La Vieja Adventures.";

  return (
    <section className="mb-8 overflow-hidden rounded-[2rem] border border-emerald-900/15 bg-[#e7f0e9] shadow-sm dark:border-emerald-300/15 dark:bg-[#102c27]">
      <div className="p-5 sm:p-7">
        <div className="max-w-2xl">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-800 dark:text-emerald-300">
            {isEs ? "La brújula de La Vieja" : "La Vieja compass"}
          </p>
          <h2 className="mt-2 font-display text-2xl font-black tracking-tight text-stone-950 dark:text-white md:text-3xl">
            {isEs ? "¿Qué quiere vivir?" : "What do you want to feel?"}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-stone-700 dark:text-stone-300 md:text-base">
            {isEs
              ? "Escoja lo que más le suena y le recomendamos una experiencia concreta. Menos catálogo, más pura vida a la medida."
              : "Choose what sounds most like you and we will recommend one concrete experience. Less catalog, more of the right pura vida."}
          </p>
        </div>

        <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {INTENT_OPTIONS.map((intent) => {
            const Icon = intent.icon;
            const isSelected = selectedKey === intent.key;
            return (
              <button
                key={intent.key}
                type="button"
                aria-pressed={isSelected}
                onClick={() => setSelectedKey(intent.key)}
                className={`flex min-h-[76px] items-center gap-3 rounded-2xl border px-4 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#102c27] ${
                  isSelected
                    ? "border-emerald-700 bg-white text-stone-950 shadow-sm dark:border-emerald-300 dark:bg-white/12 dark:text-white"
                    : "border-emerald-900/12 bg-white/55 text-stone-800 hover:border-emerald-700/45 hover:bg-white dark:border-white/10 dark:bg-white/6 dark:text-stone-100 dark:hover:bg-white/12"
                }`}
              >
                <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${isSelected ? "bg-emerald-700 text-white dark:bg-emerald-300 dark:text-emerald-950" : "bg-emerald-900/8 text-emerald-800 dark:bg-emerald-300/12 dark:text-emerald-200"}`}>
                  <Icon size={19} aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-sm font-black">{isEs ? intent.labelEs : intent.labelEn}</span>
                  <span className="mt-0.5 block text-xs text-stone-600 dark:text-stone-400">{isEs ? intent.descriptionEs : intent.descriptionEn}</span>
                </span>
              </button>
            );
          })}
        </div>

        {selectedIntent && (
          <div className="mt-5 rounded-2xl border border-white/80 bg-white p-4 shadow-[0_16px_40px_rgba(31,72,61,0.12)] dark:border-white/10 dark:bg-stone-950 sm:p-5" aria-live="polite">
            {recommendedTour ? (
              <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <div className="relative h-28 w-full shrink-0 overflow-hidden rounded-xl bg-stone-200 md:w-36">
                  <Image
                    src={getTourImage(recommendedTour.slug)}
                    alt={tourTitle(recommendedTour, isEs)}
                    fill
                    sizes="144px"
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-300">
                    {isEs ? "Su mejor coincidencia" : "Your best match"}
                  </p>
                  <h3 className="mt-1 font-display text-xl font-black tracking-tight text-stone-950 dark:text-white">
                    {tourTitle(recommendedTour, isEs)}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-stone-600 dark:text-stone-300">
                    {intentReason(selectedIntent, recommendedTour, isEs)}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs font-bold text-stone-500 dark:text-stone-400">
                    {recommendedTour.duration && <span>{tourDuration(recommendedTour.duration, lang)}</span>}
                    {recommendedTour.difficulty && <span>{tourDifficulty(recommendedTour.difficulty, lang)}</span>}
                    <span>{getTourPriceDisplay(recommendedTour, isEs).primary}</span>
                  </div>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2 md:flex-col">
                  <button
                    type="button"
                    onClick={() => onSelectTour(recommendedTour.slug)}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#00796B] px-4 py-2 text-xs font-black uppercase tracking-wide text-white transition hover:bg-[#00695C]"
                  >
                    {isEs ? "Reservar esta" : "Book this one"}
                    <ArrowRight size={14} />
                  </button>
                  <Link
                    href={localizeHref(`/tour/${encodeURIComponent(recommendedTour.slug)}`, lang)}
                    className="inline-flex min-h-11 items-center justify-center rounded-full border border-stone-300 px-4 py-2 text-xs font-bold text-stone-700 transition hover:border-stone-500 dark:border-white/15 dark:text-stone-200 dark:hover:border-white/35"
                  >
                    {isEs ? "Ver detalles" : "View details"}
                  </Link>
                </div>
              </div>
            ) : selectedIntent.key === "premium" ? (
              <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-amber-100 text-amber-700 dark:bg-amber-300/15 dark:text-amber-200">
                  <Sparkles size={24} aria-hidden="true" />
                </div>
                <div className="flex-1">
                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-amber-700 dark:text-amber-300">
                    {isEs ? "Recomendación premium" : "Premium recommendation"}
                  </p>
                  <h3 className="mt-1 font-display text-xl font-black tracking-tight text-stone-950 dark:text-white">
                    {isEs ? "Domo Geodésico San Vicente – Phoenix Experience" : "San Vicente Geodesic Dome – Phoenix Experience"}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-stone-600 dark:text-stone-300">
                    {isEs
                      ? "Una escapada de glamping para celebrar, descansar y vivir algo distinto. Precio y disponibilidad se confirman con el equipo."
                      : "A glamping escape for celebrating, resting, and doing something different. Price and availability are confirmed by the team."}
                  </p>
                </div>
                <a
                  href={whatsappHref(whatsappMessage)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-[#25D366] px-4 py-2 text-xs font-black text-[#073b27] transition hover:bg-[#1ebe5d]"
                >
                  <MessageCircle size={15} />
                  {isEs ? "Confirmar con el equipo" : "Ask the team"}
                </a>
              </div>
            ) : (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm leading-relaxed text-stone-600 dark:text-stone-300">
                  {isEs
                    ? "No encontramos una coincidencia exacta en los filtros actuales. El equipo le ayuda a escoger sin adivinar, mae."
                    : "We could not find an exact match in the current filters. The team can help you choose without guessing."}
                </p>
                <a
                  href={whatsappHref(whatsappMessage)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full border border-emerald-700 px-4 py-2 text-xs font-black text-emerald-800 transition hover:bg-emerald-50 dark:border-emerald-300 dark:text-emerald-200 dark:hover:bg-emerald-300/10"
                >
                  <MessageCircle size={15} />
                  {isEs ? "Preguntar al equipo" : "Ask the team"}
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
