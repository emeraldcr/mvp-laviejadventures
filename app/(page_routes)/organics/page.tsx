import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "La Vieja Organics | Healthy Organic Food",
  description:
    "La Vieja Organics, a partner project of La Vieja Adventures, offers high-quality organic food for everyone.",
};

const features = [
  {
    title: "Local & Seasonal",
    description:
      "We source from trusted local growers and prioritize seasonal harvests for peak freshness.",
  },
  {
    title: "100% Organic Commitment",
    description:
      "Our ingredients are selected with strict organic standards to support healthier families and communities.",
  },
  {
    title: "Food for Everyone",
    description:
      "From daily staples to premium produce, we make clean and nutritious food accessible to all.",
  },
];

export default function OrganicsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-950 via-zinc-950 to-black text-white">
      <section className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
        <p className="inline-flex rounded-full border border-emerald-300/30 bg-emerald-400/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">
          New Project Launch
        </p>

        <h1 className="mt-6 max-w-4xl text-4xl font-black leading-tight sm:text-5xl md:text-6xl">
          La Vieja Organics
        </h1>

        <p className="mt-4 max-w-3xl text-lg text-zinc-300 sm:text-xl">
          A partner project of <span className="font-semibold text-emerald-200">La Vieja Adventures</span>,
          built to provide the best organic food for everyone.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {features.map((feature) => (
            <article
              key={feature.title}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
            >
              <h2 className="text-lg font-bold text-emerald-200">{feature.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-zinc-300">{feature.description}</p>
            </article>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap items-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-black transition hover:bg-emerald-400"
          >
            Explore La Vieja Adventures
          </Link>
          <a
            href="mailto:hello@laviejadventures.com"
            className="inline-flex items-center justify-center rounded-xl border border-zinc-600 px-6 py-3 text-sm font-semibold text-zinc-100 transition hover:bg-zinc-800"
          >
            Contact La Vieja Organics
          </a>
        </div>
      </section>
    </main>
  );
}
