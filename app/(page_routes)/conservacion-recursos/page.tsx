"use client";

import DynamicHeroHeader from "@/app/components/sections/DynamicHeroHeader";
import { useLanguage } from "@/app/context/LanguageContext";
import { Droplets, TreePine, Activity, Shield, AlertTriangle, BarChart3 } from "lucide-react";

const content = {
  es: {
    title: "Conservación de Recursos",
    subtitle: "Protección del Río La Vieja, monitoreo ambiental y acciones de conservación del ecosistema.",
    badgeLabel: "Conservación Activa",
    introTitle: "El Río La Vieja: Nuestro Patrimonio",
    introParagraph:
      "El Río La Vieja es el corazón de nuestra operación y el ecosistema que protegemos con mayor compromiso. Sus aguas limpias, pozas naturales y bosque ripario son el resultado de décadas de conservación local. Asumimos la responsabilidad de mantenerlo así para las generaciones futuras.",
    monitoringTitle: "Programa de Monitoreo",
    monitoringItems: [
      {
        title: "Calidad del Agua",
        frequency: "Quincenal",
        parameters: ["pH (rango óptimo: 6.5–8.5)", "Temperatura del agua", "Oxígeno disuelto", "Turbidez y color", "Coliformes fecales (mensual)", "Nitratos y fosfatos"],
      },
      {
        title: "Biodiversidad",
        frequency: "Trimestral",
        parameters: ["Conteo de aves por puntos fijos", "Registro de anfibios y reptiles", "Inventario de flora riparia", "Macroinvertebrados bentónicos", "Rastreo de mamíferos medianos"],
      },
      {
        title: "Caudal y Erosión",
        frequency: "Mensual",
        parameters: ["Medición de caudal en punto fijo", "Fotografía comparativa de riberas", "Registro de eventos de sedimentación", "Evaluación de estabilidad de orillas", "Registro de árboles caídos en cauce"],
      },
    ],
    actionsTitle: "Acciones de Conservación",
    actions: [
      {
        icon: "tree",
        title: "Reforestación Riparia",
        description: "Siembra anual de especies nativas en las orillas del Río La Vieja, con especial énfasis en áreas con mayor exposición solar y erosión.",
        target: "Meta: 200 árboles/año",
      },
      {
        icon: "shield",
        title: "Zona de Amortiguamiento",
        description: "Mantenimiento de una franja de bosque no intervenido de al menos 50 metros a cada lado del río en toda la extensión del recorrido.",
        target: "2 km de franja protegida",
      },
      {
        icon: "activity",
        title: "Control de Invasoras",
        description: "Identificación y manejo manual de especies vegetales exóticas invasoras que amenazan la vegetación nativa del bosque ripario.",
        target: "Jornadas bimensuales",
      },
      {
        icon: "water",
        title: "Gestión de Residuos",
        description: "Recolección activa de residuos sólidos en toda la ruta del tour y tramo de 500m aguas arriba y abajo del punto de operación.",
        target: "Limpieza en cada tour",
      },
    ],
    threatsTitle: "Amenazas Identificadas",
    threats: [
      { threat: "Escorrentía agrícola con agroquímicos", level: "Alto", action: "Monitoreo de calidad de agua y coordinación con vecinos" },
      { threat: "Deforestación en cuenca alta", level: "Medio", action: "Gestión ante SINAC y Municipalidad" },
      { threat: "Residuos sólidos de visitantes", level: "Bajo", action: "Educación y limpieza activa en tours" },
      { threat: "Extracción de material de río", level: "Bajo", action: "Denuncia ante autoridades competentes" },
    ],
    levelHigh: "Alto",
    levelMed: "Medio",
    levelLow: "Bajo",
    partnerTitle: "Alianzas para la Conservación",
    partners: ["SINAC — Sistema Nacional de Áreas de Conservación", "SENARA — Servicio Nacional de Aguas Subterráneas", "Universidad de Costa Rica — Escuela de Biología", "ASADA local (Asociación de Acueductos)", "Vecinos propietarios de la cuenca"],
  },
  en: {
    title: "Resource Conservation",
    subtitle: "Protection of Río La Vieja, environmental monitoring and ecosystem conservation actions.",
    badgeLabel: "Active Conservation",
    introTitle: "Río La Vieja: Our Heritage",
    introParagraph:
      "The Río La Vieja is the heart of our operation and the ecosystem we protect with the greatest commitment. Its clean waters, natural pools and riparian forest are the result of decades of local conservation. We take responsibility for maintaining it this way for future generations.",
    monitoringTitle: "Monitoring Program",
    monitoringItems: [
      {
        title: "Water Quality",
        frequency: "Biweekly",
        parameters: ["pH (optimal range: 6.5–8.5)", "Water temperature", "Dissolved oxygen", "Turbidity and color", "Fecal coliforms (monthly)", "Nitrates and phosphates"],
      },
      {
        title: "Biodiversity",
        frequency: "Quarterly",
        parameters: ["Bird count at fixed points", "Amphibian and reptile records", "Riparian flora inventory", "Benthic macroinvertebrates", "Medium mammal tracking"],
      },
      {
        title: "Flow & Erosion",
        frequency: "Monthly",
        parameters: ["Flow measurement at fixed point", "Comparative bank photography", "Sedimentation event records", "Bank stability assessment", "Fallen tree records in channel"],
      },
    ],
    actionsTitle: "Conservation Actions",
    actions: [
      {
        icon: "tree",
        title: "Riparian Reforestation",
        description: "Annual planting of native species on the banks of Río La Vieja, with special emphasis on areas with greater sun exposure and erosion.",
        target: "Goal: 200 trees/year",
      },
      {
        icon: "shield",
        title: "Buffer Zone",
        description: "Maintenance of an undisturbed forest strip of at least 50 meters on each side of the river along the entire tour route.",
        target: "2 km of protected strip",
      },
      {
        icon: "activity",
        title: "Invasive Species Control",
        description: "Identification and manual management of exotic invasive plant species that threaten native vegetation in the riparian forest.",
        target: "Bimonthly sessions",
      },
      {
        icon: "water",
        title: "Waste Management",
        description: "Active solid waste collection along the entire tour route and 500m upstream and downstream from the operation point.",
        target: "Cleanup on every tour",
      },
    ],
    threatsTitle: "Identified Threats",
    threats: [
      { threat: "Agricultural runoff with agrochemicals", level: "High", action: "Water quality monitoring and coordination with neighbors" },
      { threat: "Deforestation in upper watershed", level: "Medium", action: "Coordination with SINAC and Municipality" },
      { threat: "Solid waste from visitors", level: "Low", action: "Education and active cleanup during tours" },
      { threat: "River material extraction", level: "Low", action: "Reporting to competent authorities" },
    ],
    levelHigh: "High",
    levelMed: "Medium",
    levelLow: "Low",
    partnerTitle: "Conservation Partnerships",
    partners: ["SINAC — National System of Conservation Areas", "SENARA — National Groundwater Service", "University of Costa Rica — School of Biology", "Local ASADA (Water Association)", "Watershed landowner neighbors"],
  },
};

export default function ConservacionRecursosPage() {
  const { lang } = useLanguage();
  const tr = content[lang];

  const levelColor = (level: string) => {
    if (level === tr.levelHigh) return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300";
    if (level === tr.levelMed) return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300";
    return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300";
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50 via-zinc-50 to-white px-4 py-10 dark:from-black dark:via-zinc-950 dark:to-zinc-900">
      <DynamicHeroHeader showHeroSlider={false} />

      <div className="mx-auto w-full max-w-6xl space-y-6 pt-6">
        {/* Hero */}
        <section className="rounded-3xl border border-emerald-100 bg-white/90 p-8 shadow-xl backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/90 md:p-10">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1 text-sm font-semibold text-emerald-700 dark:border-emerald-800/70 dark:bg-emerald-900/20 dark:text-emerald-300">
            <Shield size={14} />
            {tr.badgeLabel}
          </span>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-900 dark:text-white md:text-4xl">
            <Droplets className="mr-3 inline-block text-emerald-600" size={36} />
            {tr.title}
          </h1>
          <p className="mt-3 max-w-3xl text-lg text-zinc-600 dark:text-zinc-400">{tr.subtitle}</p>
        </section>

        {/* Intro */}
        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="mb-3 text-xl font-bold text-zinc-900 dark:text-white">{tr.introTitle}</h2>
          <p className="text-zinc-700 dark:text-zinc-300">{tr.introParagraph}</p>
        </section>

        {/* Monitoring */}
        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-zinc-900 dark:text-white">
            <BarChart3 size={20} className="text-emerald-600" />
            {tr.monitoringTitle}
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            {tr.monitoringItems.map((item, i) => (
              <div key={i} className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4 dark:border-emerald-800/30 dark:bg-emerald-900/10">
                <p className="font-semibold text-zinc-900 dark:text-white">{item.title}</p>
                <p className="mb-3 text-xs text-emerald-700 dark:text-emerald-400">{item.frequency}</p>
                <ul className="space-y-1">
                  {item.parameters.map((p, j) => (
                    <li key={j} className="flex items-start gap-1.5 text-xs text-zinc-700 dark:text-zinc-300">
                      <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-emerald-500" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Actions */}
        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-zinc-900 dark:text-white">
            <TreePine size={20} className="text-emerald-600" />
            {tr.actionsTitle}
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {tr.actions.map((action, i) => (
              <div key={i} className="rounded-xl border border-zinc-100 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
                <h3 className="mb-2 font-semibold text-zinc-900 dark:text-white">{action.title}</h3>
                <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-400">{action.description}</p>
                <span className="inline-block rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                  {action.target}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Threats */}
        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-zinc-900 dark:text-white">
            <AlertTriangle size={20} className="text-amber-500" />
            {tr.threatsTitle}
          </h2>
          <div className="space-y-3">
            {tr.threats.map((t, i) => (
              <div key={i} className="flex flex-wrap items-start gap-3 rounded-xl border border-zinc-100 p-4 dark:border-zinc-800">
                <span className={`flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-bold ${levelColor(t.level)}`}>{t.level}</span>
                <div className="flex-1">
                  <p className="font-medium text-zinc-900 dark:text-white">{t.threat}</p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">{t.action}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Partners */}
        <section className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-6 shadow-sm dark:border-emerald-800/30 dark:bg-emerald-900/10">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-zinc-900 dark:text-white">
            <Activity size={20} className="text-emerald-600" />
            {tr.partnerTitle}
          </h2>
          <ul className="space-y-2">
            {tr.partners.map((p, i) => (
              <li key={i} className="flex items-start gap-2 text-zinc-700 dark:text-zinc-300">
                <Droplets size={14} className="mt-1 flex-shrink-0 text-emerald-500" />
                {p}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
