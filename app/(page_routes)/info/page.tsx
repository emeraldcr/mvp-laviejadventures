import DynamicHeroHeader from "@/app/components/sections/DynamicHeroHeader";
import {
  ArrowRight,
  Bird,
  CalendarClock,
  Compass,
  Mail,
  MapPin,
  Mountain,
  Phone,
  ShieldCheck,
  Sparkles,
  TreePine,
} from "lucide-react";
import React from "react";

const tours = [
  "Ciudad Esmeralda – nuestro tour estrella en el cañón del río.",
  "Cuadra-tours por senderos privados.",
  "Caminatas a cascadas escondidas.",
  "Tour gastronómico con cocina local.",
  'Experiencia "Lluvia en la Naturaleza".',
  "Avistamiento de aves.",
  "Tour nocturno.",
  "Rapel en cañón.",
  "Caminata a volcanes dormidos.",
];

const socialLinks = [
  {
    label: "WhatsApp",
    href: "https://wa.me/50662332535",
    className:
      "bg-green-600 hover:bg-green-700 focus-visible:ring-green-300 dark:focus-visible:ring-green-700",
    featured: true,
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/laviejaadventures",
    className:
      "bg-blue-700 hover:bg-blue-800 focus-visible:ring-blue-300 dark:focus-visible:ring-blue-700",
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/laviejaadventures",
    className:
      "bg-pink-600 hover:bg-pink-700 focus-visible:ring-pink-300 dark:focus-visible:ring-pink-700",
  },
  {
    label: "TikTok",
    href: "https://www.tiktok.com/@la.vieja.adventur",
    className:
      "bg-black hover:bg-zinc-800 focus-visible:ring-zinc-300 dark:focus-visible:ring-zinc-700",
  },
  {
    label: "X (Twitter)",
    href: "https://x.com/adventuresvieja",
    className:
      "bg-zinc-900 hover:bg-black focus-visible:ring-zinc-300 dark:focus-visible:ring-zinc-700",
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/@laviejaadventures",
    className:
      "bg-red-600 hover:bg-red-700 focus-visible:ring-red-300 dark:focus-visible:ring-red-700",
  },
];

export default function InfoPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50 via-zinc-50 to-white px-4 py-10 dark:from-black dark:via-zinc-950 dark:to-zinc-900">
      <DynamicHeroHeader />

      <div className="mx-auto w-full max-w-6xl space-y-6">
        <section className="rounded-3xl border border-emerald-100 bg-white/90 p-8 shadow-xl backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/90 md:p-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-3xl space-y-4">
              <p className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1 text-sm font-semibold text-emerald-700 dark:border-emerald-800/70 dark:bg-emerald-900/20 dark:text-emerald-300">
                <Sparkles size={16} />
                Experiencias auténticas en Costa Rica
              </p>
              <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white md:text-4xl">
                Información General - La Vieja Adventures
              </h1>
              <p className="text-base leading-relaxed text-zinc-700 dark:text-zinc-300">
                Somos una empresa dedicada a experiencias de naturaleza en la zona norte de Costa Rica. Operamos tours guiados en el Cañón del Río La Vieja, Ciudad Esmeralda, volcanes dormidos del Parque Nacional del Agua Juan Castro Blanco y más.
              </p>
            </div>

            <div className="grid w-full gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900 md:max-w-xs">
              <a
                href="https://wa.me/50662332535"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-center text-sm font-semibold text-white shadow-lg shadow-emerald-800/20 transition hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 dark:focus-visible:ring-emerald-700"
              >
                Reservar por WhatsApp
                <ArrowRight size={16} />
              </a>
              <a
                href="tel:+50686430807"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-300 px-4 py-3 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                <Phone size={16} />
                Llamar ahora
              </a>
            </div>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <article className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="mb-4 flex items-center gap-2 text-2xl font-semibold text-zinc-900 dark:text-white">
              <Compass size={20} className="text-emerald-600" />
              Tours Principales
            </h2>
            <ul className="space-y-3 text-zinc-700 dark:text-zinc-300">
              {tours.map((tour) => (
                <li key={tour} className="flex gap-2">
                  <span className="mt-2 h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
                  <span>{tour}</span>
                </li>
              ))}
            </ul>
          </article>

          <article className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="mb-4 flex items-center gap-2 text-2xl font-semibold text-zinc-900 dark:text-white">
              <CalendarClock size={20} className="text-emerald-600" />
              Tarifas y Condiciones
            </h2>
            <div className="space-y-5 text-zinc-700 dark:text-zinc-300">
              <p>
                Todos los tours tienen un rango de precios entre <strong>₡19.990</strong> (fines de semana en grupos) y <strong>₡34.990</strong> (reservas individuales entre semana).
              </p>
              <p>
                Los tours dependen del clima para garantizar seguridad. En caso de lluvias fuertes, crecientes del río o inestabilidad en el terreno, podríamos mover, reprogramar o cancelar la experiencia.
              </p>
              <p>
                Cada tour cuenta con su propia política de reembolso según tipo de actividad y logística requerida; usualmente aplican opciones de reprogramación, créditos o reembolsos parciales.
              </p>
            </div>
          </article>
        </section>

        <section className="grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
          <article className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="mb-5 flex items-center gap-2 text-2xl font-semibold text-zinc-900 dark:text-white">
              <ShieldCheck size={20} className="text-emerald-600" />
              ¿Por qué elegirnos?
            </h2>
            <div className="grid gap-4 text-zinc-700 dark:text-zinc-300 sm:grid-cols-2">
              <p className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-900">
                <TreePine size={18} className="mb-2 text-emerald-600" />
                Guías certificados, equipo de operaciones especializado y atención personalizada.
              </p>
              <p className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-900">
                <Mountain size={18} className="mb-2 text-emerald-600" />
                Rutas auténticas en cañones, cascadas y volcanes dormidos.
              </p>
              <p className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-900">
                <Bird size={18} className="mb-2 text-emerald-600" />
                Experiencias para todo nivel: aventura, fotografía y naturaleza.
              </p>
              <p className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-900">
                <MapPin size={18} className="mb-2 text-emerald-600" />
                Ubicación estratégica en la zona norte de Costa Rica.
              </p>
            </div>
          </article>

          <article className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="mb-3 text-2xl font-semibold text-zinc-900 dark:text-white">Contacto y Redes</h2>
            <ul className="mb-6 space-y-2 text-zinc-700 dark:text-zinc-300">
              <li className="flex items-start gap-2"><Phone size={16} className="mt-1 text-emerald-600" /> <span><strong>Teléfono:</strong> +506 8643-0807</span></li>
              <li className="flex items-start gap-2"><Mail size={16} className="mt-1 text-emerald-600" /> <span><strong>Email:</strong> ciudadesmeraldacr@gmail.com</span></li>
              <li className="flex items-start gap-2"><MapPin size={16} className="mt-1 text-emerald-600" /> <span><strong>Ubicación:</strong> Zona Norte, Costa Rica</span></li>
            </ul>

            <div className="grid gap-3 sm:grid-cols-2">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center justify-center rounded-xl px-4 py-3 text-center font-semibold text-white shadow-md transition focus-visible:outline-none focus-visible:ring-2 ${social.className} ${social.featured ? "sm:col-span-2" : ""}`}
                >
                  {social.label}
                </a>
              ))}
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}
