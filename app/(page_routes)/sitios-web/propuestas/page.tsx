import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Croissant, Dumbbell, Fish } from "lucide-react";

export const metadata: Metadata = {
  title: "Propuestas de sitios web",
  description: "Demos de sitios web modernos para negocios locales.",
};

type Proposal = {
  slug: string;
  name: string;
  category: string;
  location: string;
  accent: string;
  icon: typeof Dumbbell;
};

const PROPOSALS: Proposal[] = [
  {
    slug: "extreme-gym",
    name: "Xtreme Gym",
    category: "Gimnasio",
    location: "Ciudad Quesada, San Carlos",
    accent: "from-red-500 to-orange-500",
    icon: Dumbbell,
  },
  {
    slug: "panaderia-inocente-hidalgo",
    name: "Panadería Inocente Hidalgo",
    category: "Panadería",
    location: "Ciudad Quesada, San Carlos",
    accent: "from-amber-500 to-orange-600",
    icon: Croissant,
  },
  {
    slug: "cevicheria-beta-azul",
    name: "Cevichería Beta Azul",
    category: "Cevichería",
    location: "Costa Rica",
    accent: "from-cyan-500 to-blue-600",
    icon: Fish,
  },
];

export default function ProposalsPage() {
  return (
    <main className="min-h-screen bg-neutral-950 px-5 py-20 text-neutral-100 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-400">
          Propuestas
        </p>
        <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
          Sitios web para negocios
        </h1>
        <p className="mt-4 max-w-2xl text-neutral-400">
          Cada tarjeta es una demo real y navegable, lista para presentar al cliente.
        </p>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PROPOSALS.map((p) => (
            <Link
              key={p.slug}
              href={`/sitios-web/propuestas/${p.slug}`}
              className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-7 transition hover:border-white/25 hover:bg-white/[0.06]"
            >
              <span
                className={`grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br ${p.accent} shadow-lg`}
              >
                <p.icon className="h-7 w-7 text-white" />
              </span>
              <div className="mt-6">
                <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  {p.category}
                </span>
                <h2 className="mt-1 text-xl font-bold">{p.name}</h2>
                <p className="mt-1 text-sm text-neutral-400">{p.location}</p>
              </div>
              <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-white">
                Ver demo
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
