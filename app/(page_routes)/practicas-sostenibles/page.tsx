"use client";

import DynamicHeroHeader from "@/app/components/sections/DynamicHeroHeader";
import { useLanguage } from "@/app/context/LanguageContext";
import { Leaf, Recycle, Droplets, PackageCheck, Ban, Sun } from "lucide-react";

const content = {
  es: {
    title: "Prácticas Sostenibles",
    subtitle: "Biodegradables, principios de no dejar rastro y políticas de sostenibilidad de La Vieja Adventures.",
    badgeLabel: "Sostenibilidad",
    pillars: [
      {
        icon: "recycle",
        title: "Productos Biodegradables",
        items: [
          "Bloqueador solar biodegradable obligatorio para todos los participantes",
          "Repelente de insectos de base natural, libre de DEET",
          "Jabón biodegradable en todas las estaciones de lavado",
          "Empaques de snacks compostables o reutilizables",
          "Bolsas de basura compostables para residuos del tour",
        ],
      },
      {
        icon: "ban",
        title: "No Dejar Rastro (LNT)",
        items: [
          "Planificación y preparación anticipada del tour",
          "Circular únicamente por senderos y zonas designadas",
          "Gestión responsable de desechos: lo que entra, sale",
          "Dejar lo que se encuentra: rocas, plantas, animales, objetos históricos",
          "Minimizar el impacto de fogatas y campamentos",
          "Respetar la vida silvestre: distancia mínima de observación",
          "Considerar a los demás visitantes y al ambiente",
        ],
      },
      {
        icon: "water",
        title: "Gestión del Agua",
        items: [
          "Prohibición de uso de jabones no biodegradables en el río",
          "Punto de rellenado de agua potable para reducir plástico",
          "Monitoreo regular de la calidad del agua del Río La Vieja",
          "Protocolo de limpieza sin detergentes en equipos",
          "Educación sobre la importancia del ciclo hídrico local",
        ],
      },
      {
        icon: "sun",
        title: "Energía y Transporte",
        items: [
          "Optimización de rutas para reducir emisiones de transporte",
          "Preferencia por vehículos con mejor eficiencia de combustible",
          "Oficina con iluminación LED y equipos de bajo consumo",
          "Materiales impresos mínimos: comunicación digital preferida",
          "Compensación de carbono a través de programas locales de reforestación",
        ],
      },
      {
        icon: "package",
        title: "Materiales y Residuos",
        items: [
          "Separación de residuos: orgánico, reciclable, no reciclable",
          "Compostera para residuos orgánicos de cocina",
          "Equipos de rappel mantenidos para extender vida útil",
          "Ropa y equipos usados donados a programas locales",
          "Compras locales preferidas para reducir huella logística",
        ],
      },
      {
        icon: "leaf",
        title: "Política de Cero Plástico",
        items: [
          "Prohibición de plásticos de un solo uso en todas las operaciones",
          "Botellas reutilizables para agua del personal y opción de alquiler para clientes",
          "Vajilla y cubiertos reutilizables en refrigerios",
          "Eliminación gradual de todo empaque plástico",
          "Campañas de limpieza del río con comunidad local",
        ],
      },
    ],
    certTitle: "Certificaciones y Compromisos",
    certItems: [
      "Proceso activo de solicitud del Certificado de Sostenibilidad Turística (CST) del ICT",
      "Miembro de la Red de Turismo Sostenible de San Carlos",
      "Adherencia voluntaria a los Principios de No Dejar Rastro (Leave No Trace Center)",
      "Informe anual de sostenibilidad publicado en el sitio web",
    ],
  },
  en: {
    title: "Sustainable Practices",
    subtitle: "Biodegradables, Leave No Trace principles and sustainability policies of La Vieja Adventures.",
    badgeLabel: "Sustainability",
    pillars: [
      {
        icon: "recycle",
        title: "Biodegradable Products",
        items: [
          "Biodegradable sunscreen mandatory for all participants",
          "Natural-based, DEET-free insect repellent",
          "Biodegradable soap at all washing stations",
          "Compostable or reusable snack packaging",
          "Compostable garbage bags for tour waste",
        ],
      },
      {
        icon: "ban",
        title: "Leave No Trace (LNT)",
        items: [
          "Advanced tour planning and preparation",
          "Travel only on designated trails and areas",
          "Responsible waste management: pack it in, pack it out",
          "Leave what you find: rocks, plants, animals, historical objects",
          "Minimize campfire and camp impact",
          "Respect wildlife: maintain minimum observation distance",
          "Be considerate of other visitors and the environment",
        ],
      },
      {
        icon: "water",
        title: "Water Management",
        items: [
          "Prohibition of non-biodegradable soaps in the river",
          "Drinking water refill station to reduce plastic",
          "Regular water quality monitoring of Río La Vieja",
          "Detergent-free equipment cleaning protocol",
          "Education on the importance of the local water cycle",
        ],
      },
      {
        icon: "sun",
        title: "Energy & Transport",
        items: [
          "Route optimization to reduce transport emissions",
          "Preference for more fuel-efficient vehicles",
          "Office with LED lighting and low-consumption equipment",
          "Minimal printed materials: digital communication preferred",
          "Carbon offsetting through local reforestation programs",
        ],
      },
      {
        icon: "package",
        title: "Materials & Waste",
        items: [
          "Waste separation: organic, recyclable, non-recyclable",
          "Compost bin for kitchen organic waste",
          "Rappel equipment maintained to extend useful life",
          "Used clothing and equipment donated to local programs",
          "Local purchasing preferred to reduce logistics footprint",
        ],
      },
      {
        icon: "leaf",
        title: "Zero Plastic Policy",
        items: [
          "Single-use plastics banned from all operations",
          "Reusable water bottles for staff and rental option for clients",
          "Reusable dishes and cutlery at refreshment breaks",
          "Gradual elimination of all plastic packaging",
          "River clean-up campaigns with local community",
        ],
      },
    ],
    certTitle: "Certifications & Commitments",
    certItems: [
      "Active application process for ICT Tourism Sustainability Certificate (CST)",
      "Member of the San Carlos Sustainable Tourism Network",
      "Voluntary adherence to Leave No Trace principles (Leave No Trace Center)",
      "Annual sustainability report published on the website",
    ],
  },
};

const iconMap: Record<string, React.ReactNode> = {
  recycle: <Recycle size={20} className="text-emerald-600" />,
  ban: <Ban size={20} className="text-emerald-600" />,
  water: <Droplets size={20} className="text-emerald-600" />,
  sun: <Sun size={20} className="text-emerald-600" />,
  package: <PackageCheck size={20} className="text-emerald-600" />,
  leaf: <Leaf size={20} className="text-emerald-600" />,
};

export default function PracticasSosteniblesPage() {
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
            <Recycle className="mr-3 inline-block text-emerald-600" size={36} />
            {tr.title}
          </h1>
          <p className="mt-3 max-w-3xl text-lg text-zinc-600 dark:text-zinc-400">{tr.subtitle}</p>
        </section>

        {/* Pillars */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tr.pillars.map((pillar, idx) => (
            <section key={idx} className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-zinc-900 dark:text-white">
                {iconMap[pillar.icon]}
                {pillar.title}
              </h2>
              <ul className="space-y-2">
                {pillar.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        {/* Certifications */}
        <section className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-6 shadow-sm dark:border-emerald-800/30 dark:bg-emerald-900/10">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-zinc-900 dark:text-white">
            <PackageCheck size={20} className="text-emerald-600" />
            {tr.certTitle}
          </h2>
          <ul className="space-y-3">
            {tr.certItems.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-zinc-700 dark:text-zinc-300">
                <Leaf size={16} className="mt-0.5 flex-shrink-0 text-emerald-500" />
                {item}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
