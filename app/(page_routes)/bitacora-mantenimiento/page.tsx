"use client";

import DynamicHeroHeader from "@/app/components/sections/DynamicHeroHeader";
import { useLanguage } from "@/app/context/LanguageContext";
import { ClipboardList, CheckCircle2, AlertTriangle, Wrench, Shield, Calendar } from "lucide-react";

type CheckItem = { category: string; items: string[] };

const content = {
  es: {
    title: "Bitácora de Mantenimiento",
    subtitle: "Verificaciones diarias antes de cada tour para garantizar la seguridad de todos los participantes.",
    badgeLabel: "Seguridad Operacional",
    sections: [
      {
        icon: "checklist",
        title: "Verificación de Equipo de Rappel",
        checks: [
          "Revisión visual de cuerdas: desgaste, cortes o deformaciones",
          "Inspección de arneses: costuras, hebillas y ajustes",
          "Verificación de descensores (tubos, ocho, grigri): estado y funcionalidad",
          "Revisión de mosquetones y conectores: cierre de rosca y mecanismo de seguro",
          "Inspección de cascos: estructura, correas y sistema de ajuste",
          "Verificación de guantes de rappel: estado de la palma y velcros",
        ],
      },
      {
        icon: "anchor",
        title: "Verificación de Anclajes y Líneas de Vida",
        checks: [
          "Inspección de anclajes fijos en roca: fisuras, movimiento o corrosión",
          "Revisión de cintas y slings de anclaje: cortes, desgaste UV o deformaciones",
          "Verificación de líneas de vida en zonas de alto tráfico",
          "Comprobación de conectores de anclaje: rosca y pin de seguridad",
          "Prueba de carga en anclajes principales antes de operar",
          "Documentación fotográfica de anclajes con señales de desgaste",
        ],
      },
      {
        icon: "water",
        title: "Condiciones del Río y Cañón",
        checks: [
          "Medición del nivel y caudal del Río La Vieja",
          "Evaluación de color y turbidez del agua",
          "Revisión de zonas de pozas: profundidad y presencia de obstáculos",
          "Verificación de caminos de acceso y salida de emergencia",
          "Evaluación de condiciones de roca: musgo, humedad y estabilidad",
          "Revisión meteorológica local (lluvia, tormenta eléctrica en las últimas 12h)",
        ],
      },
      {
        icon: "firstaid",
        title: "Kit de Primeros Auxilios y Emergencias",
        checks: [
          "Inventario completo del botiquín de primeros auxilios",
          "Verificación de fechas de vencimiento de medicamentos",
          "Estado y carga de dispositivos de comunicación (radio, celular backup)",
          "Disponibilidad y funcionalidad de camilla de rescate",
          "Verificación del protocolo de emergencia (números de contacto actualizados)",
          "Estado de la mochila de rescate técnico",
        ],
      },
    ],
    frequencyTitle: "Frecuencia de Inspecciones",
    frequencies: [
      { period: "Antes de cada tour", items: ["Equipo personal de cada participante", "Condiciones del río y accesos", "Comunicaciones y botiquín"] },
      { period: "Semanal", items: ["Inspección profunda de cuerdas y arneses", "Revisión de anclajes con herramientas", "Inventario de repuestos y consumibles"] },
      { period: "Mensual", items: ["Prueba de carga en todos los anclajes", "Evaluación y reemplazo de equipo deteriorado", "Reporte fotográfico documentado"] },
    ],
    retireTitle: "Criterios de Retiro de Equipo",
    retireItems: [
      "Cuerda: cortes visibles, aplastamiento, exposición química o caída de factor alto",
      "Arnés: costura deshilachada, hebilla doblada, plástico quebrado o más de 5 años de uso",
      "Casco: cualquier impacto significativo, grieta o deformación visible",
      "Mosquetón: mella visible, cierre irregular, oxidación profunda o caída libre desde altura",
    ],
    responsibleTitle: "Responsables de la Bitácora",
    responsibleItems: [
      "Guía principal: responsable de la verificación diaria antes de cada tour",
      "Coordinador de operaciones: revisiones semanales y documentación",
      "Director técnico: auditorías mensuales y decisiones de retiro de equipo",
    ],
  },
  en: {
    title: "Maintenance Log",
    subtitle: "Daily checks before each tour to ensure the safety of all participants.",
    badgeLabel: "Operational Safety",
    sections: [
      {
        icon: "checklist",
        title: "Rappel Equipment Check",
        checks: [
          "Visual rope inspection: wear, cuts or deformations",
          "Harness inspection: stitching, buckles and adjustments",
          "Descender check (tube, figure-8, grigri): condition and function",
          "Carabiner and connector inspection: screw gate and lock mechanism",
          "Helmet inspection: structure, straps and adjustment system",
          "Rappel glove check: palm condition and velcro",
        ],
      },
      {
        icon: "anchor",
        title: "Anchor and Safety Line Check",
        checks: [
          "Fixed rock anchor inspection: cracks, movement or corrosion",
          "Sling and anchor tape review: cuts, UV wear or deformation",
          "Safety line verification in high-traffic areas",
          "Anchor connector check: gate and safety pin",
          "Load test on main anchors before operation",
          "Photographic documentation of anchors showing wear signs",
        ],
      },
      {
        icon: "water",
        title: "River and Canyon Conditions",
        checks: [
          "Water level and flow measurement of Río La Vieja",
          "Water color and turbidity evaluation",
          "Pool zone review: depth and obstacle presence",
          "Access and emergency exit path verification",
          "Rock condition evaluation: moss, humidity and stability",
          "Local weather check (rain, lightning in past 12h)",
        ],
      },
      {
        icon: "firstaid",
        title: "First Aid and Emergency Kit",
        checks: [
          "Complete first aid kit inventory",
          "Medication expiration date verification",
          "Communication device status and charge (radio, backup phone)",
          "Rescue stretcher availability and functionality",
          "Emergency protocol verification (updated contact numbers)",
          "Technical rescue backpack condition",
        ],
      },
    ],
    frequencyTitle: "Inspection Frequency",
    frequencies: [
      { period: "Before each tour", items: ["Personal equipment of each participant", "River and access conditions", "Communications and first aid kit"] },
      { period: "Weekly", items: ["In-depth rope and harness inspection", "Anchor review with tools", "Spare parts and consumables inventory"] },
      { period: "Monthly", items: ["Load test on all anchors", "Evaluation and replacement of deteriorated equipment", "Documented photo report"] },
    ],
    retireTitle: "Equipment Retirement Criteria",
    retireItems: [
      "Rope: visible cuts, crushing, chemical exposure or high-factor fall",
      "Harness: frayed stitching, bent buckle, cracked plastic or over 5 years of use",
      "Helmet: any significant impact, crack or visible deformation",
      "Carabiner: visible notch, irregular gate closure, deep rust or free fall from height",
    ],
    responsibleTitle: "Log Responsible Parties",
    responsibleItems: [
      "Lead guide: responsible for daily verification before each tour",
      "Operations coordinator: weekly reviews and documentation",
      "Technical director: monthly audits and equipment retirement decisions",
    ],
  },
};

export default function BitacoraMantenimientoPage() {
  const { lang } = useLanguage();
  const tr = content[lang];

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
            <ClipboardList className="mr-3 inline-block text-emerald-600" size={36} />
            {tr.title}
          </h1>
          <p className="mt-3 max-w-3xl text-lg text-zinc-600 dark:text-zinc-400">{tr.subtitle}</p>
        </section>

        {/* Checklist sections */}
        <div className="grid gap-6 md:grid-cols-2">
          {tr.sections.map((section, idx) => (
            <section
              key={idx}
              className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
            >
              <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-zinc-900 dark:text-white">
                <CheckCircle2 size={20} className="text-emerald-600" />
                {section.title}
              </h2>
              <ul className="space-y-2">
                {section.checks.map((check, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                    <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-emerald-500" />
                    {check}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        {/* Frequency */}
        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-zinc-900 dark:text-white">
            <Calendar size={20} className="text-emerald-600" />
            {tr.frequencyTitle}
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {tr.frequencies.map((freq, i) => (
              <div key={i} className="rounded-xl bg-emerald-50 p-4 dark:bg-emerald-900/20">
                <h3 className="mb-2 font-semibold text-emerald-700 dark:text-emerald-300">{freq.period}</h3>
                <ul className="space-y-1">
                  {freq.items.map((item, j) => (
                    <li key={j} className="text-sm text-zinc-700 dark:text-zinc-300">• {item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Retire criteria */}
        <section className="rounded-2xl border border-red-100 bg-white p-6 shadow-sm dark:border-red-900/30 dark:bg-zinc-950">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-zinc-900 dark:text-white">
            <AlertTriangle size={20} className="text-red-500" />
            {tr.retireTitle}
          </h2>
          <ul className="space-y-3">
            {tr.retireItems.map((item, i) => (
              <li key={i} className="flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-zinc-800 dark:border-red-900/30 dark:bg-red-900/10 dark:text-zinc-200">
                <AlertTriangle size={14} className="mt-0.5 flex-shrink-0 text-red-500" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* Responsible parties */}
        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-zinc-900 dark:text-white">
            <Wrench size={20} className="text-emerald-600" />
            {tr.responsibleTitle}
          </h2>
          <ul className="space-y-3">
            {tr.responsibleItems.map((item, i) => (
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
