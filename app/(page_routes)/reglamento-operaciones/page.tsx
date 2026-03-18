"use client";

import DynamicHeroHeader from "@/app/components/sections/DynamicHeroHeader";
import { useLanguage } from "@/app/context/LanguageContext";
import { ScrollText, Clock, CreditCard, AlertTriangle, Building2, Shield } from "lucide-react";

type Section = {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
};

const reglamentoContent = {
  es: {
    title: "Reglamento de Operaciones",
    subtitle: "Empresa, horarios, pagos, riesgos y regulaciones ICT completas de La Vieja Adventures.",
    badgeLabel: "ICT Certificado",
    companyTitle: "1. Datos de la Empresa",
    companyItems: [
      "Razón Social: La Vieja Adventures S.A.",
      "Actividad: Tour operadora de turismo de aventura — Cañonismo, Rappel y Senderismo",
      "Ubicación: San Carlos, Alajuela, Costa Rica",
      "Teléfono: +506 8643-0807",
      "Correo: info@laviejadventures.com",
      "Registro ICT: Operadora de Turismo de Aventura categoría Tipo II",
      "CCSS al día: Sí — Todos los trabajadores asegurados",
    ],
    sections: [
      {
        title: "2. Horarios de Operación",
        bullets: [
          "Tours disponibles: Lunes a Domingo (sin días feriados excluidos)",
          "Horario de tours: 7:00 am — 3:00 pm (último ingreso al cañón: 12:00 pm)",
          "Duración de cada tour: 3 a 4 horas aproximadamente",
          "Horario de atención al cliente: 7:00 am — 8:00 pm todos los días",
          "Cierre operativo por mantenimiento: Primer lunes de cada mes (notificado con anticipación)",
          "Temporada alta: Diciembre–Abril y Julio–Agosto (reserva con al menos 3 días de antelación)",
          "Temporada baja: Mayo, Junio, Septiembre, Octubre, Noviembre",
        ],
      },
      {
        title: "3. Política de Precios y Pagos",
        bullets: [
          "Precio del tour: Según tarifa vigente publicada en el sitio web",
          "Monedas aceptadas: Colones (CRC) y Dólares Americanos (USD)",
          "Métodos de pago: Tarjeta de crédito/débito, SINPE Móvil, transferencia bancaria, efectivo",
          "Anticipo requerido: 50% para confirmar reserva",
          "Saldo restante: Al llegar al tour o al hacer reserva completa en línea",
          "Factura electrónica emitida para todas las transacciones",
          "Precio especial grupos (+8 personas): Consultar disponibilidad y descuento",
          "Descuento residentes: 15% con cédula costarricense vigente",
        ],
      },
      {
        title: "4. Requisitos de Participación",
        bullets: [
          "Edad mínima: 10 años (menores requieren autorización escrita del tutor legal)",
          "Peso máximo: 120 kg por restricción técnica de equipos certificados",
          "Condición física: No se requiere entrenamiento previo; nivel básico de condición física",
          "Restricciones médicas: Embarazo, epilepsia activa, problemas cardíacos graves sin autorización médica",
          "Menores de 18 sin tutor presente: Requieren carta de autorización notariada",
          "Participantes con discapacidad: Evaluar caso a caso con el equipo",
        ],
      },
      {
        title: "5. Exención de Responsabilidad y Riesgos",
        paragraphs: [
          "El cañonismo y rappel son actividades de aventura que implican riesgos inherentes. Todos los participantes deben leer, comprender y firmar el Formulario de Exención de Responsabilidad antes de iniciar el tour.",
        ],
        bullets: [
          "Riesgos naturales: Crecidas del río por lluvia, deslizamientos, variaciones en roca húmeda",
          "Riesgos físicos: Golpes, raspaduras, torceduras, hipotermia en agua fría",
          "Riesgo por desobediencia: Daños causados por no seguir instrucciones del guía no son responsabilidad de la empresa",
          "Riesgo de equipo personal: La empresa no se responsabiliza por objetos personales perdidos en el río o cañón",
          "Riesgo de salud preexistente: El cliente declara estar en condiciones de salud aptas para la actividad",
          "Seguro de actividad incluido en el precio del tour — cubre atención médica de urgencia",
        ],
      },
      {
        title: "6. Normas de Conducta y Seguridad",
        bullets: [
          "Seguir en todo momento las instrucciones del guía líder",
          "No separarse del grupo sin autorización explícita",
          "Prohibido consumir alcohol o sustancias antes o durante el tour",
          "Prohibido el uso de teléfonos durante descensos técnicos",
          "Uso obligatorio de todo el equipo de protección proporcionado",
          "Respetar la flora, fauna y entorno natural del Río La Vieja",
          "Prohibido alterar, remover o dañar formaciones naturales del cañón",
          "Reportar inmediatamente cualquier lesión o malestar al guía",
        ],
      },
      {
        title: "7. Regulaciones ICT — Instituto Costarricense de Turismo",
        paragraphs: [
          "La Vieja Adventures opera bajo la supervisión y regulación del ICT conforme al Reglamento de las Empresas y Actividades Turísticas de Costa Rica. Cumplimos con:",
        ],
        bullets: [
          "Declaratoria turística y registro vigente ante el ICT",
          "Guías certificados con licencia habilitante del ICT",
          "Equipos de seguridad con certificación UIAA o CE vigente",
          "Seguro de responsabilidad civil turística activo",
          "Protocolo de emergencias documentado y aprobado",
          "Inspecciones anuales de instalaciones y equipos",
          "Declaración de capacidad máxima de aforo por actividad",
          "Manual de operaciones disponible para auditoría en cualquier momento",
        ],
      },
      {
        title: "8. Protocolo de Emergencias",
        bullets: [
          "Cruz Roja Costarricense — San Carlos: +506 2460-1111",
          "911 — Emergencias generales",
          "Hospital San Carlos: +506 2461-1566",
          "Punto de encuentro de emergencias: Entrada principal del cañón",
          "Guía principal con radio y teléfono de backup en todo tour",
          "Protocolo: Evaluar, asegurar, comunicar, evacuar",
          "Acceso vehicular de emergencia: Habilitado en toda la ruta del tour",
        ],
      },
    ],
    downloadNote: "Este reglamento está disponible en formato impreso en nuestras instalaciones y en formato digital en este sitio web. Versión vigente: 2024.",
  },
  en: {
    title: "Operations Regulations",
    subtitle: "Company, schedules, payments, risks and complete ICT regulations of La Vieja Adventures.",
    badgeLabel: "ICT Certified",
    companyTitle: "1. Company Information",
    companyItems: [
      "Company Name: La Vieja Adventures S.A.",
      "Activity: Adventure tourism operator — Canyoneering, Rappel and Hiking",
      "Location: San Carlos, Alajuela, Costa Rica",
      "Phone: +506 8643-0807",
      "Email: info@laviejadventures.com",
      "ICT Registration: Adventure Tourism Operator Type II",
      "CCSS (Social Security) up to date: Yes — All workers insured",
    ],
    sections: [
      {
        title: "2. Operating Hours",
        bullets: [
          "Tours available: Monday to Sunday (no excluded holidays)",
          "Tour hours: 7:00 am — 3:00 pm (last canyon entry: 12:00 pm)",
          "Each tour duration: approximately 3 to 4 hours",
          "Customer service hours: 7:00 am — 8:00 pm every day",
          "Maintenance closure: First Monday of each month (advance notice given)",
          "High season: December–April and July–August (book at least 3 days ahead)",
          "Low season: May, June, September, October, November",
        ],
      },
      {
        title: "3. Pricing & Payment Policy",
        bullets: [
          "Tour price: Per current rates published on the website",
          "Accepted currencies: Costa Rican Colones (CRC) and US Dollars (USD)",
          "Payment methods: Credit/debit card, SINPE Móvil, bank transfer, cash",
          "Required deposit: 50% to confirm booking",
          "Remaining balance: Upon arrival or when booking in full online",
          "Electronic invoice issued for all transactions",
          "Group price (+8 people): Inquire for availability and discount",
          "Resident discount: 15% with valid Costa Rican ID",
        ],
      },
      {
        title: "4. Participation Requirements",
        bullets: [
          "Minimum age: 10 years (minors require written authorization from legal guardian)",
          "Maximum weight: 120 kg per certified equipment technical restriction",
          "Physical condition: No prior training required; basic fitness level",
          "Medical restrictions: Pregnancy, active epilepsy, serious heart conditions without medical clearance",
          "Under-18 without guardian present: Require notarized authorization letter",
          "Participants with disabilities: Evaluate case by case with the team",
        ],
      },
      {
        title: "5. Liability Waiver & Risks",
        paragraphs: [
          "Canyoneering and rappel are adventure activities that involve inherent risks. All participants must read, understand and sign the Liability Waiver Form before starting the tour.",
        ],
        bullets: [
          "Natural risks: River flooding due to rain, landslides, wet rock variations",
          "Physical risks: Bruises, scrapes, sprains, hypothermia in cold water",
          "Disobedience risk: Damage caused by not following guide instructions is not company liability",
          "Personal equipment risk: Company is not responsible for personal items lost in the river or canyon",
          "Pre-existing health risk: Client declares being in suitable health condition for the activity",
          "Activity insurance included in tour price — covers emergency medical attention",
        ],
      },
      {
        title: "6. Conduct & Safety Rules",
        bullets: [
          "Follow the lead guide's instructions at all times",
          "Do not separate from the group without explicit authorization",
          "Alcohol or substance consumption before or during tour is prohibited",
          "Phone use during technical descents is prohibited",
          "Use of all provided protective equipment is mandatory",
          "Respect the flora, fauna and natural surroundings of Río La Vieja",
          "Altering, removing or damaging natural canyon formations is prohibited",
          "Immediately report any injury or discomfort to the guide",
        ],
      },
      {
        title: "7. ICT Regulations — Costa Rican Tourism Institute",
        paragraphs: [
          "La Vieja Adventures operates under ICT supervision and regulation per the Costa Rica Tourism Companies and Activities Regulations. We comply with:",
        ],
        bullets: [
          "Active tourism declaration and ICT registration",
          "Guides certified with valid ICT enabling license",
          "Safety equipment with valid UIAA or CE certification",
          "Active tourist civil liability insurance",
          "Documented and approved emergency protocol",
          "Annual facility and equipment inspections",
          "Maximum capacity declaration per activity",
          "Operations manual available for audit at any time",
        ],
      },
      {
        title: "8. Emergency Protocol",
        bullets: [
          "Costa Rican Red Cross — San Carlos: +506 2460-1111",
          "911 — General emergencies",
          "San Carlos Hospital: +506 2461-1566",
          "Emergency meeting point: Canyon main entrance",
          "Lead guide with radio and backup phone on every tour",
          "Protocol: Assess, secure, communicate, evacuate",
          "Emergency vehicle access: Enabled along the entire tour route",
        ],
      },
    ],
    downloadNote: "This regulation is available in printed format at our facilities and in digital format on this website. Current version: 2024.",
  },
};

export default function ReglamentoOperacionesPage() {
  const { lang } = useLanguage();
  const tr = reglamentoContent[lang];

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
            <ScrollText className="mr-3 inline-block text-emerald-600" size={36} />
            {tr.title}
          </h1>
          <p className="mt-3 max-w-3xl text-lg text-zinc-600 dark:text-zinc-400">{tr.subtitle}</p>
        </section>

        {/* Company info */}
        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-zinc-900 dark:text-white">
            <Building2 size={20} className="text-emerald-600" />
            {tr.companyTitle}
          </h2>
          <ul className="space-y-2">
            {tr.companyItems.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-500" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* Sections */}
        {tr.sections.map((section, idx) => {
          const icons = [Clock, CreditCard, Shield, AlertTriangle, Shield, ScrollText, AlertTriangle];
          const IconComponent = icons[idx] ?? ScrollText;
          const isWarning = idx === 3 || idx === 6;

          return (
            <section
              key={idx}
              className={`rounded-2xl border p-6 shadow-sm ${
                isWarning
                  ? "border-amber-100 bg-amber-50/50 dark:border-amber-800/30 dark:bg-amber-900/10"
                  : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950"
              }`}
            >
              <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-zinc-900 dark:text-white">
                <IconComponent size={20} className={isWarning ? "text-amber-500" : "text-emerald-600"} />
                {section.title}
              </h2>
              {section.paragraphs?.map((p, i) => (
                <p key={i} className="mb-3 text-zinc-700 dark:text-zinc-300">{p}</p>
              ))}
              {section.bullets && (
                <ul className="space-y-2">
                  {section.bullets.map((bullet, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                      <span className={`mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full ${isWarning ? "bg-amber-500" : "bg-emerald-500"}`} />
                      {bullet}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })}

        {/* Footer note */}
        <section className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 text-center shadow-sm dark:border-emerald-800/30 dark:bg-emerald-900/10">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">{tr.downloadNote}</p>
        </section>
      </div>
    </main>
  );
}
