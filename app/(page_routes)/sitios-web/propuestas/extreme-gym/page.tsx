import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck,
  CheckCircle2,
  CreditCard,
  Dumbbell,
  Flame,
  MapPin,
  Medal,
  Smartphone,
  Users,
  Zap,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Xtreme Gym | Landing + App de miembros",
  description:
    "Landing comercial de Xtreme Gym con app para reservas, membresias, ocupacion, rutinas y progreso.",
};

const BENEFITS = [
  {
    icon: Flame,
    title: "Rachas que motivan",
    text: "Cada entreno suma constancia y mantiene a la gente volviendo.",
  },
  {
    icon: CalendarCheck,
    title: "Reservas con cupo real",
    text: "El socio reserva una clase y Mongo baja el contador disponible.",
  },
  {
    icon: CreditCard,
    title: "Membresia visible",
    text: "Plan, proximo cobro, dias restantes y aviso si ya toca renovar.",
  },
];

const APP_PREVIEW = [
  { label: "Racha", value: "7 dias", icon: Flame },
  { label: "Cupos", value: "8/12", icon: CalendarCheck },
  { label: "Ocupacion", value: "Media", icon: Users },
];

export default function ExtremeGymLandingPage() {
  return (
    <main className="min-h-screen bg-[#080808] text-white selection:bg-lime-300 selection:text-black">
      <section className="relative overflow-hidden border-b border-white/10 px-5 py-20 sm:px-8 lg:py-24">
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(239,68,68,.34),transparent_34%),linear-gradient(300deg,rgba(190,242,100,.22),transparent_44%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1fr_.85fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 border border-lime-300/30 bg-lime-300/10 px-3 py-2 text-xs font-black uppercase tracking-[0.22em] text-lime-200">
              <MapPin className="h-4 w-4" />
              Ciudad Quesada, San Carlos
            </div>
            <h1 className="mt-7 max-w-3xl text-5xl font-black uppercase leading-[0.92] tracking-tight sm:text-7xl">
              Xtreme Gym ahora tiene motor digital
            </h1>
            <p className="mt-6 max-w-2xl text-lg font-semibold text-white/62">
              Una landing para captar miembros y una app aparte para reservar clases,
              ver membresia, medir progreso y mantener la racha viva.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/sitios-web/propuestas/extreme-gym/app"
                className="inline-flex items-center gap-2 bg-lime-300 px-6 py-4 font-black uppercase text-black transition hover:bg-white"
              >
                Abrir app de miembros
                <ArrowRight className="h-5 w-5" />
              </Link>
              <a
                href="#landing"
                className="inline-flex items-center gap-2 border border-white/15 bg-white/[0.04] px-6 py-4 font-black uppercase text-white transition hover:border-white/35"
              >
                Ver propuesta
              </a>
            </div>
          </div>

          <div className="border border-white/12 bg-white/[0.05] p-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center bg-white text-black">
                  <Dumbbell className="h-6 w-6" />
                </span>
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-300">Live preview</p>
                  <h2 className="font-black uppercase">Xtreme Streaks</h2>
                </div>
              </div>
              <Smartphone className="h-6 w-6 text-lime-300" />
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {APP_PREVIEW.map((item) => (
                <div key={item.label} className="border border-white/10 bg-black/35 p-4">
                  <item.icon className="h-5 w-5 text-lime-300" />
                  <div className="mt-4 text-2xl font-black">{item.value}</div>
                  <div className="text-xs font-bold uppercase tracking-[0.16em] text-white/45">{item.label}</div>
                </div>
              ))}
            </div>

            <div className="mt-5 border border-lime-300/25 bg-lime-300/[0.08] p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-lime-300">Entreno activo</p>
                  <h3 className="mt-1 text-xl font-black uppercase">HIIT Quemador</h3>
                  <p className="mt-1 text-sm font-semibold text-white/55">6:00 PM - 35 min - Cupos 8/12</p>
                </div>
                <Zap className="h-9 w-9 text-orange-300" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="landing" className="px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-6 md:grid-cols-3">
            {BENEFITS.map((benefit) => (
              <div key={benefit.title} className="border border-white/10 bg-white/[0.04] p-6">
                <benefit.icon className="h-8 w-8 text-lime-300" />
                <h2 className="mt-5 text-xl font-black uppercase">{benefit.title}</h2>
                <p className="mt-3 text-sm font-semibold text-white/55">{benefit.text}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[.75fr_1.25fr]">
            <div className="border border-white/10 bg-white/[0.04] p-6">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-300">Landing</p>
              <h2 className="mt-3 text-3xl font-black uppercase">La cara publica del gym</h2>
              <p className="mt-4 text-white/58">
                Mensaje claro, identidad fuerte y acceso directo a la app. La landing vende;
                la app retiene.
              </p>
              <ul className="mt-6 space-y-3 text-sm font-semibold text-white/62">
                {["Branding Xtreme", "CTA a WhatsApp o app", "Secciones para planes, clases y ubicacion"].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-lime-300" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="border border-white/10 bg-white/[0.04] p-6">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-lime-300">App aparte</p>
              <h2 className="mt-3 text-3xl font-black uppercase">Producto para miembros</h2>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {[
                  "Registro con PIN",
                  "Reservas con cupo real",
                  "Estado de membresia",
                  "Ocupacion del gym",
                  "Rutinas guiadas",
                  "Progreso corporal",
                  "Recordatorios",
                  "Invita a un amigo",
                  "Datos persistidos en Mongo",
                ].map((item) => (
                  <div key={item} className="border border-white/10 bg-black/25 p-4 font-bold text-white/72">
                    {item}
                  </div>
                ))}
              </div>
              <Link
                href="/sitios-web/propuestas/extreme-gym/app"
                className="mt-6 inline-flex items-center gap-2 bg-white px-5 py-3 font-black uppercase text-black transition hover:bg-lime-300"
              >
                Ir al app
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="mt-8 border border-orange-300/25 bg-orange-300/[0.08] p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-300">Propuesta premium</p>
                <h2 className="mt-2 text-2xl font-black uppercase">Sitio + app, no solo pagina bonita</h2>
              </div>
              <Medal className="h-10 w-10 text-orange-300" />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
