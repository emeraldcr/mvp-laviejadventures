"use client";

import DynamicHeroHeader from "@/app/components/sections/DynamicHeroHeader";
import { useLanguage } from "@/app/context/LanguageContext";
import { TrendingUp, Globe, Star, Camera, Mail, Target } from "lucide-react";

const content = {
  es: {
    title: "Plan de Mercadeo",
    subtitle: "Estrategia digital y experiencia del cliente de La Vieja Adventures.",
    badgeLabel: "Estrategia Comercial",
    objectivesTitle: "Objetivos de Mercadeo",
    objectives: [
      "Posicionar a La Vieja Adventures como la operadora de cañonismo #1 en San Carlos, Costa Rica",
      "Aumentar reservas directas desde el sitio web en un 40% anual",
      "Alcanzar y mantener una calificación de 4.8+ estrellas en Google y TripAdvisor",
      "Crecer la audiencia en redes sociales en un 25% trimestral",
      "Desarrollar canales B2B con agencias y hoteles nacionales e internacionales",
    ],
    channelsTitle: "Canales Digitales",
    channels: [
      {
        icon: "globe",
        title: "Sitio Web",
        tactics: [
          "SEO para keywords: 'cañonismo Costa Rica', 'rappel San Carlos', 'tour aventura Arenal'",
          "Blog de contenido sobre biodiversidad y aventura",
          "Sistema de reservas en línea 24/7",
          "Chat en vivo y WhatsApp Business integrado",
          "Versiones en español e inglés",
        ],
      },
      {
        icon: "camera",
        title: "Redes Sociales",
        tactics: [
          "Instagram: fotos y reels del tour, naturaleza y clientes",
          "TikTok: videos virales de rappel y aventura",
          "Facebook: comunidad, promociones y reseñas",
          "YouTube: videos completos del recorrido y testimoniales",
          "Estrategia de contenido: 3 publicaciones semanales mínimo",
        ],
      },
      {
        icon: "star",
        title: "Reputación Online",
        tactics: [
          "Solicitud sistemática de reseñas en Google post-tour",
          "Gestión activa de TripAdvisor Listing",
          "Respuesta profesional a todas las reseñas (positivas y negativas)",
          "Programa de referidos con descuento para clientes que traen amigos",
          "Reconocimiento en redes a clientes que comparten fotos",
        ],
      },
      {
        icon: "mail",
        title: "Email Marketing",
        tactics: [
          "Boletín mensual con noticias del río y ofertas especiales",
          "Secuencia post-reserva: confirmación, recordatorio 48h, seguimiento post-tour",
          "Segmentación por idioma (ES/EN) y tipo de cliente",
          "Campañas de temporada baja con incentivos especiales",
          "Newsletter con actualizaciones de conservación del río",
        ],
      },
    ],
    experienceTitle: "Experiencia del Cliente",
    experienceItems: [
      { stage: "Pre-tour", actions: ["Confirmación inmediata de reserva", "Email con instrucciones detalladas 48h antes", "WhatsApp de bienvenida con ubicación y FAQ"] },
      { stage: "Durante el tour", actions: ["Fotografía y video incluido", "Materiales de seguridad explicados claramente", "Guías bilingües y apasionados"] },
      { stage: "Post-tour", actions: ["Fotos enviadas en 24h por WhatsApp", "Solicitud de reseña personalizada", "Oferta especial para segunda visita"] },
    ],
    kpisTitle: "Indicadores Clave (KPIs)",
    kpis: [
      { metric: "Tasa de conversión web", target: "> 3.5%" },
      { metric: "Calificación Google", target: "≥ 4.8 ★" },
      { metric: "Tasa de reseñas post-tour", target: "> 40%" },
      { metric: "Costo por adquisición (CPA)", target: "< $8 USD" },
      { metric: "Net Promoter Score (NPS)", target: "> 70" },
      { metric: "Reservas directas vs agencias", target: "70% / 30%" },
    ],
  },
  en: {
    title: "Marketing Plan",
    subtitle: "Digital strategy and customer experience at La Vieja Adventures.",
    badgeLabel: "Business Strategy",
    objectivesTitle: "Marketing Objectives",
    objectives: [
      "Position La Vieja Adventures as the #1 canyoneering operator in San Carlos, Costa Rica",
      "Increase direct website bookings by 40% annually",
      "Achieve and maintain a 4.8+ star rating on Google and TripAdvisor",
      "Grow social media audience by 25% quarterly",
      "Develop B2B channels with national and international agencies and hotels",
    ],
    channelsTitle: "Digital Channels",
    channels: [
      {
        icon: "globe",
        title: "Website",
        tactics: [
          "SEO for keywords: 'canyoneering Costa Rica', 'rappel San Carlos', 'adventure tour Arenal'",
          "Content blog about biodiversity and adventure",
          "24/7 online booking system",
          "Integrated live chat and WhatsApp Business",
          "Spanish and English versions",
        ],
      },
      {
        icon: "camera",
        title: "Social Media",
        tactics: [
          "Instagram: tour photos and reels, nature and customers",
          "TikTok: viral rappel and adventure videos",
          "Facebook: community, promotions and reviews",
          "YouTube: full tour videos and testimonials",
          "Content strategy: minimum 3 posts per week",
        ],
      },
      {
        icon: "star",
        title: "Online Reputation",
        tactics: [
          "Systematic post-tour Google review requests",
          "Active TripAdvisor Listing management",
          "Professional response to all reviews (positive and negative)",
          "Referral program with discount for clients who bring friends",
          "Social media recognition for clients who share photos",
        ],
      },
      {
        icon: "mail",
        title: "Email Marketing",
        tactics: [
          "Monthly newsletter with river news and special offers",
          "Post-booking sequence: confirmation, 48h reminder, post-tour follow-up",
          "Segmentation by language (ES/EN) and client type",
          "Low season campaigns with special incentives",
          "Newsletter with river conservation updates",
        ],
      },
    ],
    experienceTitle: "Customer Experience",
    experienceItems: [
      { stage: "Pre-tour", actions: ["Immediate booking confirmation", "Detailed instructions email 48h before", "Welcome WhatsApp with location and FAQ"] },
      { stage: "During tour", actions: ["Photography and video included", "Safety materials clearly explained", "Bilingual and passionate guides"] },
      { stage: "Post-tour", actions: ["Photos sent within 24h via WhatsApp", "Personalized review request", "Special offer for second visit"] },
    ],
    kpisTitle: "Key Performance Indicators (KPIs)",
    kpis: [
      { metric: "Web conversion rate", target: "> 3.5%" },
      { metric: "Google rating", target: "≥ 4.8 ★" },
      { metric: "Post-tour review rate", target: "> 40%" },
      { metric: "Cost per acquisition (CPA)", target: "< $8 USD" },
      { metric: "Net Promoter Score (NPS)", target: "> 70" },
      { metric: "Direct vs agency bookings", target: "70% / 30%" },
    ],
  },
};

const iconMap: Record<string, React.ReactNode> = {
  globe: <Globe size={18} className="text-emerald-600" />,
  camera: <Camera size={18} className="text-emerald-600" />,
  star: <Star size={18} className="text-emerald-600" />,
  mail: <Mail size={18} className="text-emerald-600" />,
};

export default function PlanMercadeoPage() {
  const { lang } = useLanguage();
  const tr = content[lang];

  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50 via-zinc-50 to-white px-4 py-10 dark:from-black dark:via-zinc-950 dark:to-zinc-900">
      <DynamicHeroHeader showHeroSlider={false} />

      <div className="mx-auto w-full max-w-6xl space-y-6 pt-6">
        {/* Hero */}
        <section className="rounded-3xl border border-emerald-100 bg-white/90 p-8 shadow-xl backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/90 md:p-10">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1 text-sm font-semibold text-emerald-700 dark:border-emerald-800/70 dark:bg-emerald-900/20 dark:text-emerald-300">
            <TrendingUp size={14} />
            {tr.badgeLabel}
          </span>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-900 dark:text-white md:text-4xl">
            <TrendingUp className="mr-3 inline-block text-emerald-600" size={36} />
            {tr.title}
          </h1>
          <p className="mt-3 max-w-3xl text-lg text-zinc-600 dark:text-zinc-400">{tr.subtitle}</p>
        </section>

        {/* Objectives */}
        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-zinc-900 dark:text-white">
            <Target size={20} className="text-emerald-600" />
            {tr.objectivesTitle}
          </h2>
          <ul className="space-y-2">
            {tr.objectives.map((obj, i) => (
              <li key={i} className="flex items-start gap-3 rounded-xl bg-zinc-50 p-3 dark:bg-zinc-900">
                <span className="flex-shrink-0 rounded-full bg-emerald-600 px-2 py-0.5 text-xs font-bold text-white">{i + 1}</span>
                <span className="text-sm text-zinc-700 dark:text-zinc-300">{obj}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Channels */}
        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-zinc-900 dark:text-white">
            <Globe size={20} className="text-emerald-600" />
            {tr.channelsTitle}
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {tr.channels.map((ch, i) => (
              <div key={i} className="rounded-xl border border-zinc-100 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
                <h3 className="mb-3 flex items-center gap-2 font-semibold text-zinc-900 dark:text-white">
                  {iconMap[ch.icon]}
                  {ch.title}
                </h3>
                <ul className="space-y-1.5">
                  {ch.tactics.map((t, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-500" />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Customer experience */}
        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-zinc-900 dark:text-white">
            <Star size={20} className="text-emerald-600" />
            {tr.experienceTitle}
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            {tr.experienceItems.map((stage, i) => (
              <div key={i} className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4 dark:border-emerald-800/30 dark:bg-emerald-900/10">
                <p className="mb-3 font-bold text-emerald-700 dark:text-emerald-300">{stage.stage}</p>
                <ul className="space-y-1.5">
                  {stage.actions.map((a, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-500" />
                      {a}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* KPIs */}
        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-zinc-900 dark:text-white">
            <TrendingUp size={20} className="text-emerald-600" />
            {tr.kpisTitle}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {tr.kpis.map((kpi, i) => (
              <div key={i} className="flex items-center justify-between rounded-xl border border-zinc-100 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900">
                <span className="text-sm text-zinc-700 dark:text-zinc-300">{kpi.metric}</span>
                <span className="ml-2 flex-shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                  {kpi.target}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
