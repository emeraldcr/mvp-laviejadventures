import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, Leaf, Recycle, Sprout, Utensils } from "lucide-react";
import HomeNav from "@/app/components/home/HomeNav";

export const metadata: Metadata = {
  title: "La Vieja Organics | Sostenibilidad organica local",
  description:
    "La Vieja Organics is a local organic sustainability project by La Vieja Adventures, created to support the restaurant with seasonal ingredients, compost practices, and a closer relationship with the land.",
};

const pillars = [
  {
    icon: Sprout,
    title: "Huerta y temporada",
    body: "Sembramos y seleccionamos con ritmo local para que la cocina trabaje con ingredientes frescos y de temporada.",
  },
  {
    icon: Recycle,
    title: "Menos desperdicio",
    body: "Aprovechamos residuos organicos del restaurante para compost y practicas que devuelven vida al suelo.",
  },
  {
    icon: Utensils,
    title: "Restaurante primero",
    body: "De momento no es tienda ni canal de venta: es una base sostenible para alimentar nuestra experiencia gastronomica.",
  },
];

const practices = [
  "Ingredientes de temporada para cocina local",
  "Compostaje y mejor uso de residuos organicos",
  "Relaciones con productores cercanos",
  "Educacion ambiental ligada a la experiencia La Vieja",
];

export default function OrganicsPage() {
  return (
    <main className="min-h-screen bg-[#f4f1ea] text-stone-950 dark:bg-[#0b0a09] dark:text-stone-50">
      <HomeNav />
      <section className="relative flex min-h-[82svh] items-end overflow-hidden bg-stone-950 px-4 pb-12 pt-28 sm:px-6 lg:px-8">
        <Image
          src="/ads/IMG_5670.jpg"
          alt="Cocina local de La Vieja Organics"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/88 via-black/32 to-black/45" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.72),rgba(0,0,0,0.18)_55%,rgba(0,0,0,0.05))]" />

        <div className="relative mx-auto w-full max-w-7xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/30 bg-emerald-300/12 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-emerald-100 backdrop-blur-md">
            <Leaf size={14} />
            Nuevo proyecto
          </span>
          <h1 className="font-display mt-5 max-w-4xl text-balance text-[clamp(3rem,7vw,7rem)] font-black leading-[0.9] tracking-tight text-white">
            La Vieja Organics
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/82 md:text-xl">
            Proyecto local de sostenibilidad organica para nuestro restaurante: huerta, temporada, compost y cocina con mas raiz de la zona.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="#proyecto"
              className="group inline-flex items-center gap-2 rounded-full bg-emerald-400 px-7 py-4 text-sm font-black uppercase tracking-wide text-emerald-950 shadow-[0_20px_55px_rgba(52,211,153,0.28)] transition-all hover:-translate-y-0.5 hover:bg-white"
            >
              Conocer el proyecto
              <ArrowRight size={17} />
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/8 px-7 py-4 text-sm font-bold text-white backdrop-blur-md transition-all hover:border-white/50 hover:bg-white/14"
            >
              Volver a Adventures
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <section id="proyecto" className="py-16 md:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-emerald-700 dark:text-emerald-300">
              Estado actual
            </p>
            <h2 className="font-display text-balance text-4xl font-black leading-[0.98] tracking-tight md:text-6xl">
              Estamos sembrando una cocina mas sostenible
            </h2>
            <p className="mt-5 text-base leading-relaxed text-stone-600 dark:text-stone-300 md:text-lg">
              La Vieja Organics nace para apoyar nuestro restaurante, no para vender canastas. La meta es bajar desperdicio, acercar la cocina a productores y huerta local, y que cada plato tenga mas historia de San Carlos. Si la lluvia baja el rio, tambien nos recuerda que todo aqui se trabaja con respeto por el clima y la tierra.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {pillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <article
                  key={pillar.title}
                  className="rounded-[1.5rem] border border-stone-200 bg-white p-6 shadow-[0_18px_50px_rgba(30,24,16,0.08)] dark:border-white/10 dark:bg-white/[0.04]"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
                    <Icon size={20} />
                  </span>
                  <h3 className="mt-5 font-display text-xl font-black tracking-tight">{pillar.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-stone-600 dark:text-stone-300">{pillar.body}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-white py-16 dark:bg-white/[0.03] md:py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-stone-900 shadow-[0_28px_90px_rgba(30,24,16,0.16)]">
            <Image
              src="/ads/IMG_5667.jpg"
              alt="Restaurante local de La Vieja"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            <span className="absolute bottom-5 left-5 rounded-full bg-white px-4 py-2 text-xs font-black uppercase tracking-wide text-emerald-900 shadow-lg">
              Del suelo al plato
            </span>
          </div>

          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-emerald-700 dark:text-emerald-300">
              Del suelo al plato
            </p>
            <h2 className="font-display text-balance text-4xl font-black leading-[0.98] tracking-tight md:text-6xl">
              Una cocina con mas raiz local, mae
            </h2>
            <p className="mt-5 text-base leading-relaxed text-stone-600 dark:text-stone-300 md:text-lg">
              El proyecto busca que el restaurante use mejor lo que produce la zona: ingredientes frescos cuando hay temporada, compost para cerrar ciclos y una relacion mas cercana con familias productoras. Pura vida, pero con tierra en las manos.
            </p>

            <ul className="mt-7 grid gap-3 sm:grid-cols-2">
              {practices.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm font-medium text-stone-700 dark:text-stone-200">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/50">
                    <Check size={12} className="text-emerald-700 dark:text-emerald-300" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/info"
                className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/25 transition-all hover:-translate-y-0.5 hover:bg-emerald-500"
              >
                Ver experiencia local
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/tours"
                className="inline-flex items-center gap-2 rounded-full border border-stone-300 px-7 py-3.5 text-sm font-bold text-stone-800 transition-colors hover:border-emerald-600 hover:text-emerald-700 dark:border-stone-600 dark:text-stone-200 dark:hover:border-emerald-400 dark:hover:text-emerald-300"
              >
                Explorar tours
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
