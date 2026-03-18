"use client";

import DynamicHeroHeader from "@/app/components/sections/DynamicHeroHeader";
import { useLanguage } from "@/app/context/LanguageContext";
import { HeartHandshake, RefreshCw, MessageSquare, Star, Phone, CheckCircle2 } from "lucide-react";

const content = {
  es: {
    title: "Servicio al Cliente",
    subtitle: "Políticas, garantía de satisfacción y manejo de quejas de La Vieja Adventures.",
    badgeLabel: "Excelencia en Servicio",
    promiseTitle: "Nuestra Promesa de Servicio",
    promiseParagraph:
      "En La Vieja Adventures nos comprometemos a brindar una experiencia de aventura excepcional, segura y memorable. Si por alguna razón no cumplimos con tus expectativas, queremos saberlo y corregirlo.",
    policiesTitle: "Políticas de Servicio",
    policies: [
      {
        title: "Reservas y Cancelaciones",
        items: [
          "Reserva confirmada con el 50% de anticipo o pago completo en línea",
          "Cancelación gratuita hasta 48 horas antes del tour",
          "Cancelación entre 24–48h: reembolso del 50% o reprogramación sin costo",
          "Cancelación con menos de 24h: sin reembolso (puede reprogramar con cargo de $10)",
          "Cancelación por mal tiempo o emergencia: reembolso completo o reprogramación",
          "No show sin aviso: sin reembolso",
        ],
      },
      {
        title: "Modificaciones de Reserva",
        items: [
          "Cambio de fecha: gratuito hasta 48h antes (sujeto a disponibilidad)",
          "Cambio de número de participantes: gratuito hasta 24h antes",
          "Cambio de nombre de participante: gratuito en cualquier momento",
          "Reprogramación por lluvia o condiciones adversas: sin cargo, prioridad de fecha",
        ],
      },
      {
        title: "Durante el Tour",
        items: [
          "Equipo completo incluido: arnés, casco, cuerda, guantes, neopreno",
          "Fotografía y video del tour incluidos en el precio",
          "Tiempo de tour: 3–4 horas (puede variar según condiciones y grupo)",
          "Máximo 8 personas por grupo para garantizar atención personalizada",
          "Guía bilingüe (ES/EN) incluido",
          "Seguro de actividad incluido en el precio",
        ],
      },
    ],
    guaranteeTitle: "Garantía de Satisfacción",
    guaranteeItems: [
      "Si el tour no cumple lo prometido en nuestra descripción, ofrecemos reprogramación gratuita",
      "Si hay falla de equipo que impida completar el tour, reembolso completo",
      "Si las condiciones climáticas no son seguras, cancelamos y reembolsamos al 100%",
      "Evaluamos cada queja individualmente con transparencia y buena fe",
    ],
    complaintsTitle: "Proceso de Manejo de Quejas",
    complaintsSteps: [
      { step: "1", title: "Recepción", description: "Recibimos tu queja por WhatsApp, email o en persona. Confirmamos recepción en menos de 2 horas hábiles." },
      { step: "2", title: "Evaluación", description: "El coordinador de operaciones evalúa la queja y recaba información en un plazo de 24 horas." },
      { step: "3", title: "Respuesta", description: "Te ofrecemos una solución concreta: disculpa, reembolso, reprogramación o compensación según el caso." },
      { step: "4", title: "Seguimiento", description: "Contactamos al cliente 7 días después para verificar satisfacción con la solución." },
    ],
    contactTitle: "Canales de Contacto",
    contacts: [
      { method: "WhatsApp", value: "+506 8643-0807", note: "Lunes a Domingo, 7am–8pm" },
      { method: "Email", value: "info@laviejadventures.com", note: "Respuesta en menos de 12h" },
      { method: "Instagram", value: "@laviejadventures", note: "Mensajes directos" },
    ],
    ratingTitle: "Calificación Actual",
    ratingNote: "Mantenemos un promedio de 4.9 estrellas basado en más de 150 reseñas verificadas.",
  },
  en: {
    title: "Customer Service",
    subtitle: "Policies, satisfaction guarantee and complaint handling at La Vieja Adventures.",
    badgeLabel: "Service Excellence",
    promiseTitle: "Our Service Promise",
    promiseParagraph:
      "At La Vieja Adventures we are committed to providing an exceptional, safe and memorable adventure experience. If for any reason we fall short of your expectations, we want to know and make it right.",
    policiesTitle: "Service Policies",
    policies: [
      {
        title: "Bookings & Cancellations",
        items: [
          "Booking confirmed with 50% deposit or full payment online",
          "Free cancellation up to 48 hours before the tour",
          "Cancellation between 24–48h: 50% refund or free rescheduling",
          "Cancellation less than 24h: no refund (can reschedule with $10 fee)",
          "Cancellation due to bad weather or emergency: full refund or rescheduling",
          "No show without notice: no refund",
        ],
      },
      {
        title: "Booking Modifications",
        items: [
          "Date change: free up to 48h before (subject to availability)",
          "Participant number change: free up to 24h before",
          "Participant name change: free at any time",
          "Rescheduling due to rain or adverse conditions: no charge, date priority",
        ],
      },
      {
        title: "During the Tour",
        items: [
          "Full equipment included: harness, helmet, rope, gloves, wetsuit",
          "Tour photography and video included in price",
          "Tour duration: 3–4 hours (may vary depending on conditions and group)",
          "Maximum 8 people per group for personalized attention",
          "Bilingual guide (ES/EN) included",
          "Activity insurance included in price",
        ],
      },
    ],
    guaranteeTitle: "Satisfaction Guarantee",
    guaranteeItems: [
      "If the tour does not deliver what our description promised, we offer free rescheduling",
      "If equipment failure prevents completing the tour, full refund",
      "If weather conditions are not safe, we cancel and refund 100%",
      "We evaluate each complaint individually with transparency and good faith",
    ],
    complaintsTitle: "Complaint Handling Process",
    complaintsSteps: [
      { step: "1", title: "Receipt", description: "We receive your complaint via WhatsApp, email or in person. We confirm receipt within 2 business hours." },
      { step: "2", title: "Evaluation", description: "The operations coordinator evaluates the complaint and gathers information within 24 hours." },
      { step: "3", title: "Response", description: "We offer a concrete solution: apology, refund, rescheduling or compensation as appropriate." },
      { step: "4", title: "Follow-up", description: "We contact the client 7 days later to verify satisfaction with the solution." },
    ],
    contactTitle: "Contact Channels",
    contacts: [
      { method: "WhatsApp", value: "+506 8643-0807", note: "Monday to Sunday, 7am–8pm" },
      { method: "Email", value: "info@laviejadventures.com", note: "Response within 12h" },
      { method: "Instagram", value: "@laviejadventures", note: "Direct messages" },
    ],
    ratingTitle: "Current Rating",
    ratingNote: "We maintain a 4.9 star average based on over 150 verified reviews.",
  },
};

export default function ServicioAlClientePage() {
  const { lang } = useLanguage();
  const tr = content[lang];

  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50 via-zinc-50 to-white px-4 py-10 dark:from-black dark:via-zinc-950 dark:to-zinc-900">
      <DynamicHeroHeader showHeroSlider={false} />

      <div className="mx-auto w-full max-w-6xl space-y-6 pt-6">
        {/* Hero */}
        <section className="rounded-3xl border border-emerald-100 bg-white/90 p-8 shadow-xl backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/90 md:p-10">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1 text-sm font-semibold text-emerald-700 dark:border-emerald-800/70 dark:bg-emerald-900/20 dark:text-emerald-300">
            <HeartHandshake size={14} />
            {tr.badgeLabel}
          </span>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-900 dark:text-white md:text-4xl">
            <HeartHandshake className="mr-3 inline-block text-emerald-600" size={36} />
            {tr.title}
          </h1>
          <p className="mt-3 max-w-3xl text-lg text-zinc-600 dark:text-zinc-400">{tr.subtitle}</p>
        </section>

        {/* Promise */}
        <section className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-6 shadow-sm dark:border-emerald-800/30 dark:bg-emerald-900/10">
          <h2 className="mb-3 text-xl font-bold text-zinc-900 dark:text-white">{tr.promiseTitle}</h2>
          <p className="text-zinc-700 dark:text-zinc-300">{tr.promiseParagraph}</p>
        </section>

        {/* Policies */}
        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-zinc-900 dark:text-white">
            <CheckCircle2 size={20} className="text-emerald-600" />
            {tr.policiesTitle}
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {tr.policies.map((policy, idx) => (
              <div key={idx} className="rounded-xl border border-zinc-100 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
                <h3 className="mb-3 font-semibold text-zinc-900 dark:text-white">{policy.title}</h3>
                <ul className="space-y-1.5">
                  {policy.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-zinc-700 dark:text-zinc-300">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Guarantee */}
        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-zinc-900 dark:text-white">
            <RefreshCw size={20} className="text-emerald-600" />
            {tr.guaranteeTitle}
          </h2>
          <ul className="space-y-3">
            {tr.guaranteeItems.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-zinc-700 dark:text-zinc-300">
                <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0 text-emerald-500" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* Complaints */}
        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-zinc-900 dark:text-white">
            <MessageSquare size={20} className="text-emerald-600" />
            {tr.complaintsTitle}
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {tr.complaintsSteps.map((step, i) => (
              <div key={i} className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4 dark:border-emerald-800/30 dark:bg-emerald-900/10">
                <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white">
                  {step.step}
                </div>
                <p className="mb-1 font-semibold text-zinc-900 dark:text-white">{step.title}</p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">{step.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Contact + Rating */}
        <div className="grid gap-6 md:grid-cols-2">
          <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-zinc-900 dark:text-white">
              <Phone size={20} className="text-emerald-600" />
              {tr.contactTitle}
            </h2>
            <ul className="space-y-3">
              {tr.contacts.map((c, i) => (
                <li key={i} className="rounded-xl border border-zinc-100 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900">
                  <p className="font-semibold text-zinc-900 dark:text-white">{c.method}: <span className="font-normal text-emerald-600 dark:text-emerald-400">{c.value}</span></p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">{c.note}</p>
                </li>
              ))}
            </ul>
          </section>

          <section className="flex flex-col items-center justify-center rounded-2xl border border-yellow-100 bg-yellow-50 p-6 shadow-sm dark:border-yellow-800/30 dark:bg-yellow-900/10">
            <h2 className="mb-2 text-xl font-bold text-zinc-900 dark:text-white">{tr.ratingTitle}</h2>
            <div className="mb-2 flex items-center gap-1">
              {[1,2,3,4,5].map(s => <Star key={s} size={28} className="fill-yellow-400 text-yellow-400" />)}
            </div>
            <p className="text-4xl font-bold text-zinc-900 dark:text-white">4.9</p>
            <p className="mt-2 text-center text-sm text-zinc-600 dark:text-zinc-400">{tr.ratingNote}</p>
          </section>
        </div>
      </div>
    </main>
  );
}
