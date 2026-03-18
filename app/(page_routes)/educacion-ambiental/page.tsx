"use client";

import DynamicHeroHeader from "@/app/components/sections/DynamicHeroHeader";
import { useLanguage } from "@/app/context/LanguageContext";
import { Leaf, TreePine, Droplets, Bird, BookOpen, Users } from "lucide-react";

const content = {
  es: {
    title: "Educación Ambiental",
    subtitle: "Charlas y programa ambiental integrado en cada tour de La Vieja Adventures.",
    badgeLabel: "Turismo Responsable",
    introTitle: "Nuestra Filosofía",
    introParagraph:
      "En La Vieja Adventures creemos que cada aventura es una oportunidad de aprendizaje. Integramos educación ambiental en cada momento del tour, desde el briefing inicial hasta la charla de cierre, para que cada participante se vaya con mayor conciencia sobre el ecosistema del Río La Vieja y las montañas de San Carlos.",
    programTitle: "Programa de Educación Ambiental",
    program: [
      {
        phase: "Bienvenida y Briefing (15 min)",
        icon: "users",
        topics: [
          "Presentación del ecosistema de bosque nuboso bajo",
          "Flora y fauna endémica del Río La Vieja",
          "Importancia del corredor biológico de la zona",
          "Principios de no dejar rastro",
        ],
      },
      {
        phase: "Durante el Descenso",
        icon: "tree",
        topics: [
          "Identificación de especies arbóreas nativas (guácimo, guanacaste, ceibo)",
          "Observación de aves: tucanes, loros, colibríes en su hábitat",
          "Explicación del ciclo hídrico del río y sus afluentes",
          "Importancia de las pozas como hábitat para anfibios y peces",
        ],
      },
      {
        phase: "Pozas y Zonas de Nado",
        icon: "water",
        topics: [
          "Identificación de macroinvertebrados como indicadores de calidad de agua",
          "Características del agua del Río La Vieja: pH, temperatura, oxígeno",
          "Manejo de residuos sólidos en zonas riparias",
          "Comportamiento responsable en el agua",
        ],
      },
      {
        phase: "Charla de Cierre (10 min)",
        icon: "book",
        topics: [
          "Resumen del ecosistema visitado",
          "Amenazas actuales: deforestación, contaminación, cambio climático",
          "Acciones individuales para la conservación",
          "Recursos para aprender más sobre la biodiversidad costarricense",
        ],
      },
    ],
    speciesTitle: "Especies Destacadas del Recorrido",
    species: [
      { name: "Tucán Pico Iris", category: "Ave", note: "Observación frecuente en el dosel" },
      { name: "Rana de Vidrio", category: "Anfibio", note: "Indicador de calidad de agua" },
      { name: "Colibí Garganta Ardiente", category: "Ave", note: "Polinizador clave del bosque" },
      { name: "Martín Pescador", category: "Ave", note: "Depredador del río" },
      { name: "Heliconia", category: "Flora", note: "Fuente de néctar para colibríes" },
      { name: "Ceibo", category: "Árbol", note: "Árbol emergente del bosque ripario" },
    ],
    guideTitle: "Guías como Educadores",
    guideNote:
      "Todos nuestros guías reciben formación en interpretación ambiental y técnicas de educación no formal. Utilizamos dinámicas participativas, preguntas inductoras y observación directa para fomentar la conexión emocional con la naturaleza.",
    categoryLabel: "Categoría",
    noteLabel: "Nota",
  },
  en: {
    title: "Environmental Education",
    subtitle: "Talks and environmental program integrated into every La Vieja Adventures tour.",
    badgeLabel: "Responsible Tourism",
    introTitle: "Our Philosophy",
    introParagraph:
      "At La Vieja Adventures we believe every adventure is a learning opportunity. We integrate environmental education into every moment of the tour — from the initial briefing to the closing talk — so every participant leaves with greater awareness of the Río La Vieja ecosystem and the mountains of San Carlos.",
    programTitle: "Environmental Education Program",
    program: [
      {
        phase: "Welcome & Briefing (15 min)",
        icon: "users",
        topics: [
          "Introduction to the lower cloud forest ecosystem",
          "Endemic flora and fauna of Río La Vieja",
          "Importance of the local biological corridor",
          "Leave No Trace principles",
        ],
      },
      {
        phase: "During the Descent",
        icon: "tree",
        topics: [
          "Native tree species identification (guácimo, guanacaste, ceibo)",
          "Bird watching: toucans, parrots, hummingbirds in their habitat",
          "River water cycle and tributaries explanation",
          "Importance of pools as habitat for amphibians and fish",
        ],
      },
      {
        phase: "Pools and Swimming Areas",
        icon: "water",
        topics: [
          "Macroinvertebrate identification as water quality indicators",
          "Río La Vieja water characteristics: pH, temperature, oxygen",
          "Solid waste management in riparian zones",
          "Responsible behavior in the water",
        ],
      },
      {
        phase: "Closing Talk (10 min)",
        icon: "book",
        topics: [
          "Visited ecosystem summary",
          "Current threats: deforestation, pollution, climate change",
          "Individual conservation actions",
          "Resources to learn more about Costa Rican biodiversity",
        ],
      },
    ],
    speciesTitle: "Highlighted Species on the Route",
    species: [
      { name: "Rainbow-billed Toucan", category: "Bird", note: "Frequent canopy sighting" },
      { name: "Glass Frog", category: "Amphibian", note: "Water quality indicator" },
      { name: "Fiery-throated Hummingbird", category: "Bird", note: "Key forest pollinator" },
      { name: "Amazon Kingfisher", category: "Bird", note: "River predator" },
      { name: "Heliconia", category: "Flora", note: "Nectar source for hummingbirds" },
      { name: "Ceibo Tree", category: "Tree", note: "Emergent tree of riparian forest" },
    ],
    guideTitle: "Guides as Educators",
    guideNote:
      "All our guides receive training in environmental interpretation and non-formal education techniques. We use participatory dynamics, inductive questions and direct observation to foster emotional connection with nature.",
    categoryLabel: "Category",
    noteLabel: "Note",
  },
};

export default function EducacionAmbientalPage() {
  const { lang } = useLanguage();
  const tr = content[lang];

  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50 via-zinc-50 to-white px-4 py-10 dark:from-black dark:via-zinc-950 dark:to-zinc-900">
      <DynamicHeroHeader showHeroSlider={false} />

      <div className="mx-auto w-full max-w-6xl space-y-6 pt-6">
        {/* Hero */}
        <section className="rounded-3xl border border-emerald-100 bg-white/90 p-8 shadow-xl backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/90 md:p-10">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1 text-sm font-semibold text-emerald-700 dark:border-emerald-800/70 dark:bg-emerald-900/20 dark:text-emerald-300">
            <Leaf size={14} />
            {tr.badgeLabel}
          </span>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-900 dark:text-white md:text-4xl">
            <TreePine className="mr-3 inline-block text-emerald-600" size={36} />
            {tr.title}
          </h1>
          <p className="mt-3 max-w-3xl text-lg text-zinc-600 dark:text-zinc-400">{tr.subtitle}</p>
        </section>

        {/* Intro */}
        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="mb-3 text-xl font-bold text-zinc-900 dark:text-white">{tr.introTitle}</h2>
          <p className="text-zinc-700 dark:text-zinc-300">{tr.introParagraph}</p>
        </section>

        {/* Program */}
        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-zinc-900 dark:text-white">
            <BookOpen size={20} className="text-emerald-600" />
            {tr.programTitle}
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {tr.program.map((phase, idx) => (
              <div key={idx} className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4 dark:border-emerald-800/30 dark:bg-emerald-900/10">
                <h3 className="mb-3 font-semibold text-emerald-700 dark:text-emerald-300">{phase.phase}</h3>
                <ul className="space-y-1.5">
                  {phase.topics.map((topic, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                      <Leaf size={12} className="mt-1 flex-shrink-0 text-emerald-500" />
                      {topic}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Species */}
        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-zinc-900 dark:text-white">
            <Bird size={20} className="text-emerald-600" />
            {tr.speciesTitle}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {tr.species.map((sp, i) => (
              <div key={i} className="rounded-xl border border-zinc-100 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900">
                <p className="font-semibold text-zinc-900 dark:text-white">{sp.name}</p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400">{sp.category}</p>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{sp.note}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Guides note */}
        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="mb-3 flex items-center gap-2 text-xl font-bold text-zinc-900 dark:text-white">
            <Users size={20} className="text-emerald-600" />
            {tr.guideTitle}
          </h2>
          <div className="flex items-start gap-3 rounded-xl bg-emerald-50 p-4 dark:bg-emerald-900/20">
            <Droplets size={20} className="mt-0.5 flex-shrink-0 text-emerald-600" />
            <p className="text-zinc-700 dark:text-zinc-300">{tr.guideNote}</p>
          </div>
        </section>
      </div>
    </main>
  );
}
