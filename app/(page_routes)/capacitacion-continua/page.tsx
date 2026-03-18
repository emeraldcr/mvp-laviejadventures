"use client";

import DynamicHeroHeader from "@/app/components/sections/DynamicHeroHeader";
import { useLanguage } from "@/app/context/LanguageContext";
import { BookOpen, Users, AlertTriangle, Calendar, CheckCircle2, Wrench } from "lucide-react";

const content = {
  es: {
    title: "Capacitación Continua",
    subtitle: "Simulacros, talleres trimestrales y desarrollo profesional permanente del equipo de La Vieja Adventures.",
    badgeLabel: "Mejora Continua",
    introTitle: "Cultura de Aprendizaje Permanente",
    introParagraph:
      "La capacitación continua es uno de los pilares de nuestra operación. No se trata solo de cumplir requisitos legales: invertimos en el desarrollo profesional de nuestro equipo porque sabemos que guías mejor preparados brindan experiencias más seguras y enriquecedoras.",
    drillsTitle: "Simulacros de Emergencia",
    drills: [
      {
        title: "Simulacro de Rescate en Cañón",
        frequency: "Trimestral",
        description: "Práctica completa de extracción de víctima en el cañón, incluyendo activación del protocolo de emergencias, comunicación, estabilización y evacuación.",
        duration: "4 horas",
        participants: "Todo el equipo operativo",
      },
      {
        title: "Simulacro de RCP y Primeros Auxilios",
        frequency: "Semestral",
        description: "Práctica con maniquí de RCP adulto, pediátrico y lactante. Uso del DEA. Escenarios de ahogamiento, caída y trauma. Certificación renovada al finalizar.",
        duration: "3 horas",
        participants: "Todos los guías activos",
      },
      {
        title: "Simulacro de Evacuación por Mal Tiempo",
        frequency: "Anual",
        description: "Práctica de evacuación rápida del cañón ante alerta de tormenta eléctrica o crecida del río. Rutas alternativas, comunicación y manejo de grupos.",
        duration: "2 horas",
        participants: "Guías y coordinadores",
      },
      {
        title: "Simulacro de Crisis con Cliente",
        frequency: "Anual",
        description: "Gestión de escenarios difíciles: cliente con ataque de pánico, lesión en descenso, conflicto en grupo. Comunicación y toma de decisiones bajo presión.",
        duration: "2 horas",
        participants: "Guías y atención al cliente",
      },
    ],
    workshopsTitle: "Talleres Trimestrales",
    workshops: [
      { quarter: "Q1 (Enero–Marzo)", topics: ["Interpretación ambiental avanzada", "Técnicas de rappel para grupos especiales", "Actualización de protocolos ICT"] },
      { quarter: "Q2 (Abril–Junio)", topics: ["Atención al cliente y manejo de grupos", "Fotografía y video del tour", "Primeros auxilios — taller práctico"] },
      { quarter: "Q3 (Julio–Setiembre)", topics: ["Bilingüismo: inglés técnico para guías", "Gestión de riesgos y mapa de peligros", "Sostenibilidad y educación ambiental"] },
      { quarter: "Q4 (Octubre–Diciembre)", topics: ["Evaluación de competencias del año", "Planificación operativa del próximo año", "Celebración y reconocimientos del equipo"] },
    ],
    trainingLogTitle: "Registro de Capacitaciones",
    trainingLogNote:
      "Cada capacitación, simulacro y taller queda documentado en el expediente individual de cada guía. Este registro está disponible para auditorías del ICT y es requerido para renovaciones de licencia.",
    developmentTitle: "Desarrollo Profesional Individual",
    developmentItems: [
      "Financiamiento de cursos externos relacionados con turismo de aventura",
      "Acceso a plataformas de aprendizaje en línea (idiomas, guianza, liderazgo)",
      "Mentoría entre guías senior y guías en formación",
      "Participación en ferias y congresos de turismo nacional",
      "Plan de carrera documentado para cada miembro del equipo",
    ],
  },
  en: {
    title: "Ongoing Training",
    subtitle: "Drills, quarterly workshops and permanent professional development for the La Vieja Adventures team.",
    badgeLabel: "Continuous Improvement",
    introTitle: "Culture of Permanent Learning",
    introParagraph:
      "Ongoing training is one of the pillars of our operation. It's not just about meeting legal requirements: we invest in the professional development of our team because we know that better-prepared guides deliver safer and more enriching experiences.",
    drillsTitle: "Emergency Drills",
    drills: [
      {
        title: "Canyon Rescue Drill",
        frequency: "Quarterly",
        description: "Full victim extraction practice in the canyon, including emergency protocol activation, communication, stabilization and evacuation.",
        duration: "4 hours",
        participants: "Full operational team",
      },
      {
        title: "CPR & First Aid Drill",
        frequency: "Biannual",
        description: "Practice with adult, pediatric and infant CPR mannequin. AED use. Drowning, fall and trauma scenarios. Certification renewed upon completion.",
        duration: "3 hours",
        participants: "All active guides",
      },
      {
        title: "Bad Weather Evacuation Drill",
        frequency: "Annual",
        description: "Practice of rapid canyon evacuation on lightning storm or river surge alert. Alternative routes, communication and group management.",
        duration: "2 hours",
        participants: "Guides and coordinators",
      },
      {
        title: "Customer Crisis Drill",
        frequency: "Annual",
        description: "Management of difficult scenarios: client panic attack, descent injury, group conflict. Communication and decision-making under pressure.",
        duration: "2 hours",
        participants: "Guides and customer service",
      },
    ],
    workshopsTitle: "Quarterly Workshops",
    workshops: [
      { quarter: "Q1 (January–March)", topics: ["Advanced environmental interpretation", "Rappel techniques for special groups", "ICT protocol updates"] },
      { quarter: "Q2 (April–June)", topics: ["Customer service and group management", "Tour photography and video", "First aid — practical workshop"] },
      { quarter: "Q3 (July–September)", topics: ["Bilingualism: technical English for guides", "Risk management and hazard mapping", "Sustainability and environmental education"] },
      { quarter: "Q4 (October–December)", topics: ["Year-end competency evaluation", "Operational planning for next year", "Team celebration and recognition"] },
    ],
    trainingLogTitle: "Training Log",
    trainingLogNote:
      "Each training session, drill and workshop is documented in each guide's individual file. This record is available for ICT audits and is required for license renewals.",
    developmentTitle: "Individual Professional Development",
    developmentItems: [
      "Funding of external courses related to adventure tourism",
      "Access to online learning platforms (languages, guiding, leadership)",
      "Mentorship between senior guides and guides in training",
      "Participation in national tourism fairs and conferences",
      "Documented career plan for each team member",
    ],
  },
};

export default function CapacitacionContinuaPage() {
  const { lang } = useLanguage();
  const tr = content[lang];

  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50 via-zinc-50 to-white px-4 py-10 dark:from-black dark:via-zinc-950 dark:to-zinc-900">
      <DynamicHeroHeader showHeroSlider={false} />

      <div className="mx-auto w-full max-w-6xl space-y-6 pt-6">
        {/* Hero */}
        <section className="rounded-3xl border border-emerald-100 bg-white/90 p-8 shadow-xl backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/90 md:p-10">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1 text-sm font-semibold text-emerald-700 dark:border-emerald-800/70 dark:bg-emerald-900/20 dark:text-emerald-300">
            <BookOpen size={14} />
            {tr.badgeLabel}
          </span>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-900 dark:text-white md:text-4xl">
            <BookOpen className="mr-3 inline-block text-emerald-600" size={36} />
            {tr.title}
          </h1>
          <p className="mt-3 max-w-3xl text-lg text-zinc-600 dark:text-zinc-400">{tr.subtitle}</p>
        </section>

        {/* Intro */}
        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="mb-3 text-xl font-bold text-zinc-900 dark:text-white">{tr.introTitle}</h2>
          <p className="text-zinc-700 dark:text-zinc-300">{tr.introParagraph}</p>
        </section>

        {/* Drills */}
        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-zinc-900 dark:text-white">
            <AlertTriangle size={20} className="text-amber-500" />
            {tr.drillsTitle}
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {tr.drills.map((drill, idx) => (
              <div key={idx} className="rounded-xl border border-zinc-100 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-zinc-900 dark:text-white">{drill.title}</h3>
                  <span className="flex-shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                    {drill.frequency}
                  </span>
                </div>
                <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-400">{drill.description}</p>
                <div className="flex gap-4 text-xs text-zinc-500 dark:text-zinc-400">
                  <span>{drill.duration}</span>
                  <span>·</span>
                  <span>{drill.participants}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Workshops */}
        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-zinc-900 dark:text-white">
            <Calendar size={20} className="text-emerald-600" />
            {tr.workshopsTitle}
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {tr.workshops.map((w, i) => (
              <div key={i} className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4 dark:border-emerald-800/30 dark:bg-emerald-900/10">
                <h3 className="mb-3 font-semibold text-emerald-700 dark:text-emerald-300">{w.quarter}</h3>
                <ul className="space-y-1.5">
                  {w.topics.map((topic, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                      <CheckCircle2 size={12} className="mt-1 flex-shrink-0 text-emerald-500" />
                      {topic}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Log note */}
        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="mb-3 flex items-center gap-2 text-xl font-bold text-zinc-900 dark:text-white">
            <Wrench size={20} className="text-emerald-600" />
            {tr.trainingLogTitle}
          </h2>
          <div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-900">
            <p className="text-zinc-700 dark:text-zinc-300">{tr.trainingLogNote}</p>
          </div>
        </section>

        {/* Development */}
        <section className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-6 shadow-sm dark:border-emerald-800/30 dark:bg-emerald-900/10">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-zinc-900 dark:text-white">
            <Users size={20} className="text-emerald-600" />
            {tr.developmentTitle}
          </h2>
          <ul className="space-y-2">
            {tr.developmentItems.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-zinc-700 dark:text-zinc-300">
                <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0 text-emerald-500" />
                {item}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
