"use client";

import DynamicHeroHeader, { HeroCarousel } from "@/app/components/sections/DynamicHeroHeader";
import {
  Bike,
  Waves,
  UtensilsCrossed,
  CloudRain,
  Binoculars,
  Moon,
  MountainSnow,
  Flame,
  Clock,
  ChevronRight,
  Star,
} from "lucide-react";
import Link from "next/link";

const difficultyConfig: Record<string, { label: string; color: string }> = {
  "Fácil": { label: "Fácil", color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
  "Intermedio": { label: "Intermedio", color: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
  "Moderado": { label: "Moderado", color: "bg-orange-500/20 text-orange-300 border-orange-500/30" },
  "Intermedio a avanzado": { label: "Avanzado", color: "bg-red-500/20 text-red-300 border-red-500/30" },
};

const tours = [
  {
    icon: Bike,
    title: "Cuadra-Tours Aventura",
    description: "Recorre senderos exclusivos en cuadra, atravesando bosques, fincas y miradores naturales de la zona norte.",
    duration: "1.5 – 2 horas",
    difficulty: "Intermedio",
    price: "19.990",
    tag: "Adrenalina",
    accent: "from-amber-900/40 to-amber-950/60",
    border: "border-amber-700/30 hover:border-amber-500/60",
  },
  {
    icon: Waves,
    title: "Cascadas Secretas del Río La Vieja",
    description: "Caminata guiada hacia hermosas cascadas escondidas, perfectas para fotografías y para conectar con la naturaleza.",
    duration: "2 – 3 horas",
    difficulty: "Moderado",
    price: "19.990",
    tag: "Naturaleza",
    accent: "from-cyan-900/40 to-cyan-950/60",
    border: "border-cyan-700/30 hover:border-cyan-500/60",
  },
  {
    icon: UtensilsCrossed,
    title: "Tour Gastronómico Local",
    description: "Una experiencia culinaria completa probando platillos tradicionales preparados por cocineros locales.",
    duration: "1.5 horas",
    difficulty: "Fácil",
    price: "24.990",
    tag: "Cultura",
    accent: "from-rose-900/40 to-rose-950/60",
    border: "border-rose-700/30 hover:border-rose-500/60",
  },
  {
    icon: CloudRain,
    title: "Lluvia en la Naturaleza",
    description: "Explora el bosque bajo la magia de la lluvia con equipo especial. Una experiencia sensorial inolvidable.",
    duration: "1 hora",
    difficulty: "Fácil",
    price: "19.990",
    tag: "Sensorial",
    accent: "from-indigo-900/40 to-indigo-950/60",
    border: "border-indigo-700/30 hover:border-indigo-500/60",
  },
  {
    icon: Binoculars,
    title: "Avistamiento de Aves Norteño",
    description: "Observa especies únicas del corredor biológico del Parque Nacional del Agua Juan Castro Blanco.",
    duration: "2 horas",
    difficulty: "Fácil",
    price: "22.990",
    tag: "Fauna",
    accent: "from-lime-900/40 to-lime-950/60",
    border: "border-lime-700/30 hover:border-lime-500/60",
  },
  {
    icon: Moon,
    title: "Tour Nocturno La Vieja Adventures",
    description: "Descubre la vida nocturna del bosque: insectos, anfibios, mamíferos y sonidos de la montaña.",
    duration: "1.5 horas",
    difficulty: "Fácil",
    price: "22.990",
    tag: "Nocturno",
    accent: "from-violet-900/40 to-violet-950/60",
    border: "border-violet-700/30 hover:border-violet-500/60",
  },
  {
    icon: MountainSnow,
    title: "Rapel en Cañón del Río",
    description: "Descenso controlado en secciones del cañón con guías certificados y equipo profesional.",
    duration: "2 horas",
    difficulty: "Intermedio a avanzado",
    price: "29.990",
    tag: "Extremo",
    accent: "from-red-900/40 to-red-950/60",
    border: "border-red-700/30 hover:border-red-500/60",
  },
  {
    icon: Flame,
    title: "Caminata a Volcanes Dormidos",
    description: "Explora cráteres antiguos y miradores únicos del Parque Nacional del Agua Juan Castro Blanco.",
    duration: "3 – 4 horas",
    difficulty: "Moderado",
    price: "34.990",
    tag: "Volcanes",
    accent: "from-orange-900/40 to-orange-950/60",
    border: "border-orange-700/30 hover:border-orange-500/60",
  },
];

export default function ToursPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <DynamicHeroHeader />

      {/* Page header */}
      <section className="relative pt-24 pb-16 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-teal-950/30 to-black pointer-events-none" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <span className="inline-block text-xs font-bold tracking-[0.25em] uppercase text-teal-400 mb-4">
            La Vieja Adventures
          </span>
          <h1 className="text-5xl sm:text-6xl font-black mb-5 bg-gradient-to-br from-white via-white to-teal-200 bg-clip-text text-transparent">
            Nuestros Tours
          </h1>
          <p className="text-zinc-400 text-lg max-w-xl mx-auto">
            Cada aventura es única. Elige la experiencia que más resuene contigo y vívela con guías certificados.
          </p>
        </div>
      </section>

      {/* Tour estrella */}
      <section className="max-w-6xl mx-auto px-4 mb-16">
        <div className="relative rounded-3xl overflow-hidden border border-teal-500/30 bg-gradient-to-br from-teal-900/50 via-teal-950/80 to-black shadow-[0_0_80px_rgba(20,184,166,0.15)]">
          <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 p-8 sm:p-12 flex flex-col sm:flex-row items-start sm:items-center gap-8">
            <div className="flex-shrink-0">
              <div className="w-20 h-20 rounded-2xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center shadow-lg shadow-teal-900/50">
                <Star className="w-10 h-10 text-teal-300" strokeWidth={1.5} />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs font-bold tracking-widest uppercase text-teal-400">Tour Estrella</span>
                <span className="px-2 py-0.5 rounded-full bg-teal-500/20 border border-teal-500/40 text-teal-300 text-xs font-semibold">
                  Más Reservado
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-white mb-3">
                Ciudad Esmeralda
              </h2>
              <p className="text-zinc-300 text-base max-w-lg">
                Nuestro tour insignia a través del Cañón del Río La Vieja. Una jornada de aventura, agua y naturaleza virgen que no olvidarás.
              </p>
            </div>
            <div className="flex-shrink-0 text-right">
              <p className="text-zinc-400 text-sm mb-1">Desde</p>
              <p className="text-4xl font-black text-white">
                <span className="text-teal-400 text-2xl">₡</span>19.990
              </p>
              <p className="text-zinc-500 text-xs mt-1">por persona</p>
              <Link
                href="/#calendar"
                className="mt-4 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-teal-500 hover:bg-teal-400 text-black font-bold text-sm transition-all duration-200 shadow-lg shadow-teal-900/40"
              >
                Reservar ahora <ChevronRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Tours grid */}
      <section className="max-w-6xl mx-auto px-4 pb-24">
        <div className="flex items-center gap-4 mb-10">
          <h2 className="text-2xl font-bold text-white">Tours Alternativos</h2>
          <div className="flex-1 h-px bg-gradient-to-r from-zinc-700 to-transparent" />
          <span className="text-zinc-500 text-sm">{tours.length} experiencias</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {tours.map((tour, idx) => {
            const Icon = tour.icon;
            const diff = difficultyConfig[tour.difficulty] ?? difficultyConfig["Fácil"];

            return (
              <article
                key={idx}
                className={[
                  "group relative rounded-2xl border transition-all duration-300",
                  "bg-gradient-to-b",
                  tour.accent,
                  tour.border,
                  "hover:shadow-[0_8px_40px_rgba(0,0,0,0.6)] hover:-translate-y-1",
                  "flex flex-col overflow-hidden",
                ].join(" ")}
              >
                {/* Top bar */}
                <div className="px-5 pt-6 pb-4 flex items-start justify-between gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-white/15 transition-colors">
                    <Icon className="w-6 h-6 text-white/80" strokeWidth={1.5} />
                  </div>
                  <span className="text-xs font-semibold tracking-wide uppercase px-2.5 py-1 rounded-full bg-white/10 text-white/60 border border-white/10 mt-1">
                    {tour.tag}
                  </span>
                </div>

                {/* Content */}
                <div className="px-5 flex-1">
                  <h3 className="text-lg font-bold text-white leading-snug mb-2">
                    {tour.title}
                  </h3>
                  <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                    {tour.description}
                  </p>
                </div>

                {/* Meta */}
                <div className="px-5 pb-2 flex flex-wrap gap-2">
                  <span className="flex items-center gap-1.5 text-xs text-zinc-400">
                    <Clock size={12} className="text-zinc-500" />
                    {tour.duration}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${diff.color}`}>
                    {diff.label}
                  </span>
                </div>

                {/* Footer */}
                <div className="px-5 pt-4 pb-5 mt-3 border-t border-white/10 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs text-zinc-500">Desde</p>
                    <p className="text-xl font-black text-white">
                      <span className="text-emerald-400 text-sm">₡</span>
                      {tour.price}
                    </p>
                  </div>
                  <Link
                    href="/#calendar"
                    className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-semibold transition-all duration-200 flex items-center gap-1.5 flex-shrink-0"
                  >
                    Reservar <ChevronRight size={14} />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
