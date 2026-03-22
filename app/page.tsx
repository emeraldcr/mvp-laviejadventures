"use client";

import { JSX, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BedDouble,
  CalendarDays,
  CheckCircle2,
  Globe,
  HeartHandshake,
  ShieldCheck,
  Sparkles,
  Star,
  X,
} from "lucide-react";
import DynamicHeroHeader from "@/app/components/sections/DynamicHeroHeader";
import { HeroCarousel } from "@/app/components/sections/HeroCarousel";
import ErrorBoundary from "@/lib/errorBoundary";
import { useLanguage } from "@/app/context/LanguageContext";

const BOOKING_ENGINE_URL = "https://book.hostelmate.co?pid=18c3858c-c2ce-4774-bccc-c7a0a8fc1f2c";

function BookingModal({
  open,
  onClose,
  title,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
}) {
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [onClose, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 px-3 py-4 backdrop-blur-md md:px-6">
      <button
        type="button"
        aria-label="Close booking modal"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
      />

      <div className="relative z-10 flex h-[92vh] w-full max-w-7xl flex-col overflow-hidden rounded-[28px] border border-white/10 bg-zinc-950 shadow-[0_30px_120px_rgba(0,0,0,0.55)]">
        <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-4 py-4 md:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-300">HostelMate</p>
            <h2 className="mt-1 text-lg font-semibold text-white md:text-2xl">{title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white transition hover:bg-white/10"
          >
            <X size={18} />
          </button>
        </div>

        <iframe
          title="HostelMate Booking Engine"
          src={BOOKING_ENGINE_URL}
          className="min-h-0 flex-1 bg-white"
          allow="fullscreen"
        />
      </div>
    </div>
  );
}

function LandingContent() {
  const { lang } = useLanguage();
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  const copy = useMemo(
    () => ({
      heroBadge: lang === "es" ? "Reserva sin salir de la web" : "Book without leaving the site",
      heroTitle:
        lang === "es"
          ? "Tu próxima estadía en La Vieja, con una experiencia de reserva más clara, moderna y confiable"
          : "Your next stay at La Vieja, with a clearer, more modern, and more trustworthy booking experience",
      heroText:
        lang === "es"
          ? "Rediseñamos la landing para que el huésped entienda rápido qué ofrece el lugar, vea confianza desde el primer segundo y reserve dentro de la misma página con el motor de HostelMate integrado."
          : "We redesigned the landing so guests understand the stay quickly, feel trust from the first second, and book inside the same page with the HostelMate engine embedded.",
      primaryCta: lang === "es" ? "Abrir motor de reservas" : "Open booking engine",
      secondaryCta: lang === "es" ? "Ver reserva integrada" : "See embedded booking",
      trustTitle: lang === "es" ? "Diseñado para convertir visitas en reservas" : "Designed to turn visits into bookings",
      trustText:
        lang === "es"
          ? "Una experiencia enfocada en menos fricción, más confianza visual y una ruta de decisión mucho más simple para el usuario."
          : "An experience focused on less friction, more visual trust, and a much simpler decision path for the guest.",
      inlineTitle: lang === "es" ? "Reserva aquí mismo" : "Book right here",
      inlineText:
        lang === "es"
          ? "El motor de HostelMate queda embebido dentro de tu landing para que el visitante compare fechas, revise disponibilidad y cierre la reserva sin romper el flujo."
          : "The HostelMate engine is embedded inside your landing so visitors can compare dates, review availability, and complete the reservation without breaking the flow.",
      inlineHint:
        lang === "es"
          ? "Tip: también puedes abrirlo en pantalla completa con el botón flotante para una experiencia más inmersiva."
          : "Tip: you can also open it in full-screen mode with the floating button for a more immersive experience.",
    }),
    [lang],
  );

  const highlights = [
    {
      icon: CalendarDays,
      title: lang === "es" ? "Fechas visibles y acción inmediata" : "Visible dates and immediate action",
      text:
        lang === "es"
          ? "El usuario encuentra rápido dónde reservar, sin buscar menús ni cambiar de página."
          : "Users quickly find where to book, without hunting for menus or changing pages.",
    },
    {
      icon: ShieldCheck,
      title: lang === "es" ? "Más confianza al reservar" : "More booking confidence",
      text:
        lang === "es"
          ? "Visuales premium, mensajes de seguridad y estructura clara para reducir abandono."
          : "Premium visuals, security cues, and a clear structure to reduce drop-off.",
    },
    {
      icon: HeartHandshake,
      title: lang === "es" ? "UX pensada para el huésped" : "Guest-centered UX",
      text:
        lang === "es"
          ? "Beneficios, proceso y motor de reserva alineados en un solo recorrido natural."
          : "Benefits, process, and booking engine aligned in one natural flow.",
    },
  ];

  const stats = [
    { value: "01", label: lang === "es" ? "mismo sitio" : "same site" },
    { value: "24/7", label: lang === "es" ? "motor disponible" : "engine available" },
    { value: "UX", label: lang === "es" ? "más limpia" : "cleaner" },
  ];

  const steps = [
    {
      title: lang === "es" ? "Explora" : "Explore",
      text:
        lang === "es"
          ? "El visitante descubre el valor del lugar con una propuesta visual más aspiracional."
          : "Visitors discover the property value through a more aspirational visual story.",
    },
    {
      title: lang === "es" ? "Confirma" : "Confirm",
      text:
        lang === "es"
          ? "Las señales de confianza y el acceso directo al booking reducen dudas antes de pagar."
          : "Trust signals and direct booking access reduce hesitation before paying.",
    },
    {
      title: lang === "es" ? "Reserva" : "Book",
      text:
        lang === "es"
          ? "La reserva sucede dentro de tu experiencia, con modal o bloque embebido dentro de la landing."
          : "The booking happens inside your experience, through a modal or embedded block in the landing.",
    },
  ];

  return (
    <>
      <BookingModal
        open={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        title={lang === "es" ? "Completa tu reserva sin salir de La Vieja" : "Complete your booking without leaving La Vieja"}
      />

      <main className="min-h-screen overflow-x-hidden bg-[#050816] text-white">
        <DynamicHeroHeader />

        <section className="relative isolate overflow-hidden border-b border-white/10 bg-black">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.22),transparent_38%),radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.18),transparent_25%),linear-gradient(180deg,rgba(5,8,22,0.2),rgba(5,8,22,0.88))]" />
          <HeroCarousel
            height="92vh"
            overlay={
              <div className="mx-auto flex w-full max-w-7xl flex-col items-start justify-center px-4 pb-20 pt-32 text-left md:px-8 lg:pt-40">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="max-w-3xl rounded-[32px] border border-white/12 bg-black/35 p-6 shadow-[0_20px_100px_rgba(0,0,0,0.45)] backdrop-blur-xl md:p-10"
                >
                  <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-200">
                    <Sparkles size={14} />
                    {copy.heroBadge}
                  </div>

                  <h1 className="max-w-4xl text-4xl font-black leading-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
                    {copy.heroTitle}
                  </h1>

                  <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-200 md:text-lg">
                    {copy.heroText}
                  </p>

                  <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => setIsBookingOpen(true)}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-400 px-6 py-3.5 text-sm font-bold text-emerald-950 transition hover:-translate-y-0.5 hover:bg-emerald-300"
                    >
                      {copy.primaryCta}
                      <ArrowRight size={16} />
                    </button>
                    <a
                      href="#booking-engine"
                      className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/8 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/14"
                    >
                      {copy.secondaryCta}
                    </a>
                  </div>

                  <div className="mt-8 grid grid-cols-3 gap-3 border-t border-white/10 pt-6">
                    {stats.map((item) => (
                      <div key={item.value} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
                        <p className="text-2xl font-black text-emerald-200 md:text-3xl">{item.value}</p>
                        <p className="mt-1 text-xs uppercase tracking-[0.22em] text-zinc-300">{item.label}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>
            }
          />
        </section>

        <section className="relative px-4 py-16 md:px-8 md:py-24">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 max-w-3xl">
              <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
                <Star size={14} className="fill-cyan-200 text-cyan-200" />
                {copy.trustTitle}
              </p>
              <h2 className="text-3xl font-black text-white md:text-5xl">{copy.trustTitle}</h2>
              <p className="mt-4 text-base leading-7 text-zinc-300 md:text-lg">{copy.trustText}</p>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              {highlights.map(({ icon: Icon, title, text }) => (
                <motion.article
                  key={title}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 shadow-[0_18px_60px_rgba(0,0,0,0.25)] backdrop-blur-sm"
                >
                  <div className="mb-5 inline-flex rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-3 text-emerald-200">
                    <Icon size={22} />
                  </div>
                  <h3 className="text-xl font-bold text-white">{title}</h3>
                  <p className="mt-3 text-sm leading-7 text-zinc-300">{text}</p>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 pb-16 md:px-8 md:pb-24">
          <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-[32px] border border-emerald-400/15 bg-gradient-to-br from-emerald-500/10 via-teal-500/8 to-cyan-500/10 p-7 shadow-[0_20px_80px_rgba(16,185,129,0.08)] md:p-9">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-200">
                {lang === "es" ? "Flujo recomendado" : "Recommended flow"}
              </p>
              <h2 className="mt-3 text-3xl font-black text-white md:text-4xl">
                {lang === "es" ? "Menos pasos mentales, más intención de compra" : "Less mental effort, more purchase intent"}
              </h2>
              <div className="mt-8 grid gap-4">
                {steps.map((step, index) => (
                  <div key={step.title} className="flex gap-4 rounded-3xl border border-white/10 bg-black/20 p-5">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/10 font-black text-emerald-200">
                      0{index + 1}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{step.title}</h3>
                      <p className="mt-1 text-sm leading-7 text-zinc-300">{step.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-7 backdrop-blur-sm md:p-9">
              <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-zinc-200">
                <BedDouble size={14} />
                {lang === "es" ? "Experiencia de reserva" : "Booking experience"}
              </p>
              <ul className="mt-6 space-y-4">
                {[
                  lang === "es" ? "Reserva dentro de la misma landing con iframe integrado." : "Book within the same landing using an embedded iframe.",
                  lang === "es" ? "Modal de pantalla completa para usuarios que prefieren foco total." : "Full-screen modal for users who prefer complete focus.",
                  lang === "es" ? "Jerarquía visual moderna con CTA claros y beneficios antes del motor." : "Modern visual hierarchy with clear CTAs and benefits before the engine.",
                  lang === "es" ? "Señales de confianza y continuidad para mejorar la conversión." : "Trust cues and continuity to improve conversion.",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm leading-7 text-zinc-300">
                    <CheckCircle2 size={18} className="mt-1 shrink-0 text-emerald-300" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8 rounded-3xl border border-cyan-400/15 bg-cyan-400/10 p-5">
                <div className="flex items-start gap-3">
                  <Globe size={18} className="mt-1 shrink-0 text-cyan-200" />
                  <p className="text-sm leading-7 text-cyan-50">
                    {lang === "es"
                      ? "El visitante nunca siente que fue enviado a otra experiencia. Todo ocurre dentro de tu propia interfaz."
                      : "Visitors never feel pushed into another experience. Everything happens inside your own interface."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="booking-engine" className="px-4 pb-24 md:px-8">
          <div className="mx-auto max-w-7xl overflow-hidden rounded-[36px] border border-white/10 bg-white/[0.04] shadow-[0_25px_100px_rgba(0,0,0,0.35)] backdrop-blur-xl">
            <div className="flex flex-col gap-6 border-b border-white/10 px-6 py-6 md:flex-row md:items-end md:justify-between md:px-8">
              <div className="max-w-3xl">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-200">{copy.inlineTitle}</p>
                <h2 className="mt-3 text-3xl font-black text-white md:text-5xl">{copy.inlineTitle}</h2>
                <p className="mt-4 text-base leading-7 text-zinc-300 md:text-lg">{copy.inlineText}</p>
                <p className="mt-3 text-sm leading-7 text-zinc-400">{copy.inlineHint}</p>
              </div>

              <button
                type="button"
                onClick={() => setIsBookingOpen(true)}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-zinc-950 transition hover:-translate-y-0.5 hover:bg-emerald-200"
              >
                {copy.primaryCta}
                <ArrowRight size={16} />
              </button>
            </div>

            <div className="bg-zinc-100 p-2 md:p-3">
              <iframe
                title="Embedded HostelMate booking engine"
                src={BOOKING_ENGINE_URL}
                className="h-[980px] w-full rounded-[28px] bg-white"
                allow="fullscreen"
              />
            </div>
          </div>
        </section>

        <button
          type="button"
          onClick={() => setIsBookingOpen(true)}
          className="fixed bottom-4 right-4 z-50 inline-flex items-center gap-2 rounded-full bg-emerald-400 px-5 py-3 text-sm font-bold text-emerald-950 shadow-[0_16px_40px_rgba(16,185,129,0.35)] transition hover:-translate-y-0.5 hover:bg-emerald-300"
        >
          <CalendarDays size={16} />
          {lang === "es" ? "Reservar ahora" : "Book now"}
        </button>
      </main>
    </>
  );
}

export default function Home(): JSX.Element {
  return (
    <ErrorBoundary
      fallback={
        <div className="flex h-screen items-center justify-center bg-black text-xl text-red-600">
          ⚠️ Critical System Failure: Cannot load the booking engine.
        </div>
      }
    >
      <LandingContent />
    </ErrorBoundary>
  );
}
