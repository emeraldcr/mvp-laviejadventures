"use client";

import DynamicHeroHeader from "@/app/components/sections/DynamicHeroHeader";
import { useLanguage } from "@/app/context/LanguageContext";
import { Award, Heart, ShieldCheck, Users, BookOpen, Calendar } from "lucide-react";

const content = {
  es: {
    title: "Capacitación y Certificaciones",
    subtitle: "Primeros Auxilios, RCP y formación técnica del personal de La Vieja Adventures.",
    badgeLabel: "Personal Certificado",
    certs: [
      {
        title: "Primeros Auxilios Básico",
        issuer: "Cruz Roja Costarricense",
        validity: "2 años",
        required: true,
        topics: [
          "Evaluación de la escena y víctima",
          "Control de hemorragias y vendajes",
          "Manejo de fracturas y luxaciones",
          "Quemaduras y trauma menor",
          "Traslado seguro de heridos",
        ],
      },
      {
        title: "Reanimación Cardiopulmonar (RCP) y DEA",
        issuer: "American Heart Association",
        validity: "2 años",
        required: true,
        topics: [
          "Cadena de supervivencia",
          "RCP adultos, niños y lactantes",
          "Uso del Desfibrilador Externo Automático (DEA)",
          "Obstrucción de vías respiratorias (maniobra de Heimlich)",
          "Reconocimiento de emergencias cardíacas",
        ],
      },
      {
        title: "Rescate en Cañón y Cuerdas",
        issuer: "Programa Interno + ACTA",
        validity: "Anual",
        required: true,
        topics: [
          "Sistemas de polipasto para rescate",
          "Evacuación en vertical y horizontal",
          "Manejo de camilla en terreno técnico",
          "Autoseguro y técnicas de rescate en pareja",
          "Comunicación durante rescate",
        ],
      },
      {
        title: "Guía de Turismo de Aventura",
        issuer: "ICT — Instituto Costarricense de Turismo",
        validity: "Vigente según ICT",
        required: true,
        topics: [
          "Legislación turística de Costa Rica",
          "Atención al cliente y manejo de grupos",
          "Protocolos de seguridad en aventura",
          "Interpretación ambiental",
          "Gestión de riesgos y emergencias",
        ],
      },
    ],
    scheduleTitle: "Calendario de Renovaciones",
    scheduleItems: [
      { month: "Enero", event: "Renovación RCP / DEA — todos los guías" },
      { month: "Marzo", event: "Simulacro de rescate en cañón" },
      { month: "Junio", event: "Renovación Primeros Auxilios" },
      { month: "Agosto", event: "Taller de atención al cliente" },
      { month: "Octubre", event: "Evaluación de competencias técnicas" },
      { month: "Diciembre", event: "Auditoría interna de certificaciones vigentes" },
    ],
    staffTitle: "Estado de Certificaciones del Personal",
    staffNote: "Todos los guías activos mantienen sus certificaciones vigentes como requisito para operar tours.",
    requiredLabel: "Obligatoria",
    validityLabel: "Vigencia",
    issuerLabel: "Institución",
    topicsLabel: "Contenido",
  },
  en: {
    title: "Training & Certifications",
    subtitle: "First Aid, CPR and technical training for La Vieja Adventures staff.",
    badgeLabel: "Certified Staff",
    certs: [
      {
        title: "Basic First Aid",
        issuer: "Costa Rican Red Cross",
        validity: "2 years",
        required: true,
        topics: [
          "Scene and victim assessment",
          "Bleeding control and bandaging",
          "Fracture and dislocation management",
          "Burns and minor trauma",
          "Safe casualty transport",
        ],
      },
      {
        title: "Cardiopulmonary Resuscitation (CPR) and AED",
        issuer: "American Heart Association",
        validity: "2 years",
        required: true,
        topics: [
          "Chain of survival",
          "CPR for adults, children and infants",
          "Automated External Defibrillator (AED) use",
          "Airway obstruction (Heimlich maneuver)",
          "Cardiac emergency recognition",
        ],
      },
      {
        title: "Canyon and Rope Rescue",
        issuer: "Internal Program + ACTA",
        validity: "Annual",
        required: true,
        topics: [
          "Pulley rescue systems",
          "Vertical and horizontal evacuation",
          "Stretcher management on technical terrain",
          "Self-belay and buddy rescue techniques",
          "Communication during rescue",
        ],
      },
      {
        title: "Adventure Tourism Guide",
        issuer: "ICT — Costa Rican Tourism Institute",
        validity: "Valid per ICT",
        required: true,
        topics: [
          "Costa Rican tourism legislation",
          "Customer service and group management",
          "Adventure safety protocols",
          "Environmental interpretation",
          "Risk and emergency management",
        ],
      },
    ],
    scheduleTitle: "Renewal Calendar",
    scheduleItems: [
      { month: "January", event: "CPR / AED Renewal — all guides" },
      { month: "March", event: "Canyon rescue drill" },
      { month: "June", event: "First Aid renewal" },
      { month: "August", event: "Customer service workshop" },
      { month: "October", event: "Technical skills assessment" },
      { month: "December", event: "Internal audit of active certifications" },
    ],
    staffTitle: "Staff Certification Status",
    staffNote: "All active guides maintain current certifications as a requirement to operate tours.",
    requiredLabel: "Required",
    validityLabel: "Validity",
    issuerLabel: "Institution",
    topicsLabel: "Content",
  },
};

export default function CapacitacionCertificacionesPage() {
  const { lang } = useLanguage();
  const tr = content[lang];

  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50 via-zinc-50 to-white px-4 py-10 dark:from-black dark:via-zinc-950 dark:to-zinc-900">
      <DynamicHeroHeader showHeroSlider={false} />

      <div className="mx-auto w-full max-w-6xl space-y-6 pt-6">
        {/* Hero */}
        <section className="rounded-3xl border border-emerald-100 bg-white/90 p-8 shadow-xl backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/90 md:p-10">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1 text-sm font-semibold text-emerald-700 dark:border-emerald-800/70 dark:bg-emerald-900/20 dark:text-emerald-300">
            <ShieldCheck size={14} />
            {tr.badgeLabel}
          </span>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-900 dark:text-white md:text-4xl">
            <Award className="mr-3 inline-block text-emerald-600" size={36} />
            {tr.title}
          </h1>
          <p className="mt-3 max-w-3xl text-lg text-zinc-600 dark:text-zinc-400">{tr.subtitle}</p>
        </section>

        {/* Certifications */}
        <div className="grid gap-6 md:grid-cols-2">
          {tr.certs.map((cert, idx) => (
            <section key={idx} className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
              <div className="mb-3 flex items-start justify-between gap-2">
                <h2 className="flex items-center gap-2 text-lg font-bold text-zinc-900 dark:text-white">
                  <Award size={18} className="flex-shrink-0 text-emerald-600" />
                  {cert.title}
                </h2>
                {cert.required && (
                  <span className="flex-shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                    {tr.requiredLabel}
                  </span>
                )}
              </div>
              <div className="mb-4 flex flex-wrap gap-4 text-sm text-zinc-600 dark:text-zinc-400">
                <span><span className="font-medium text-zinc-800 dark:text-zinc-200">{tr.issuerLabel}:</span> {cert.issuer}</span>
                <span><span className="font-medium text-zinc-800 dark:text-zinc-200">{tr.validityLabel}:</span> {cert.validity}</span>
              </div>
              <p className="mb-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">{tr.topicsLabel}:</p>
              <ul className="space-y-1">
                {cert.topics.map((topic, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                    <Heart size={12} className="mt-1 flex-shrink-0 text-red-500" />
                    {topic}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        {/* Schedule */}
        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-zinc-900 dark:text-white">
            <Calendar size={20} className="text-emerald-600" />
            {tr.scheduleTitle}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {tr.scheduleItems.map((item, i) => (
              <div key={i} className="rounded-xl border border-emerald-100 bg-emerald-50 p-4 dark:border-emerald-800/30 dark:bg-emerald-900/20">
                <p className="mb-1 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">{item.month}</p>
                <p className="text-sm text-zinc-700 dark:text-zinc-300">{item.event}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Staff note */}
        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="mb-3 flex items-center gap-2 text-xl font-bold text-zinc-900 dark:text-white">
            <Users size={20} className="text-emerald-600" />
            {tr.staffTitle}
          </h2>
          <div className="flex items-start gap-3 rounded-xl bg-emerald-50 p-4 dark:bg-emerald-900/20">
            <BookOpen size={20} className="mt-0.5 flex-shrink-0 text-emerald-600" />
            <p className="text-zinc-700 dark:text-zinc-300">{tr.staffNote}</p>
          </div>
        </section>
      </div>
    </main>
  );
}
