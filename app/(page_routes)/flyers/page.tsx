"use client";

import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import FlyerCard from "@/app/components/flyers/FlyerCard";
import { FLYERS } from "@/app/components/flyers/data";
import { BUSINESS } from "@/app/components/rotulos/constants";
import { createTranslator } from "@/app/components/rotulos/helpers";

/**
 * Diez publicaciones cuadradas para Instagram, con el mismo editor movible
 * tipo Canva que los rótulos: cada tarjeta trae su propio "Editar objetos".
 */
export default function FlyersPage() {
  const { lang, toggle } = useLanguage();
  const t = useMemo(() => createTranslator(lang), [lang]);

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-zinc-950/85 backdrop-blur-2xl">
        <div className="mx-auto flex h-16 w-full max-w-[1920px] items-center justify-between gap-3 px-4 md:px-8 xl:h-20 xl:px-14 2xl:px-20">
          <Link
            href="/rotulos"
            className="inline-flex items-center gap-2 text-xs font-bold text-zinc-300 transition hover:text-white sm:text-sm"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            {t("Rótulos", "Signage")}
          </Link>

          <div className="flex min-w-0 items-center gap-3">
            <Image
              src="/logo2.jpg"
              alt="La Vieja Adventures Logo"
              width={36}
              height={36}
              className="shrink-0 object-contain shadow-md shadow-black/30"
              priority
            />
            <span className="hidden truncate text-sm font-black tracking-tight text-white sm:inline md:text-base">
              {t("Flyers · Instagram", "Flyers · Instagram")}
            </span>
          </div>

          <button
            type="button"
            onClick={toggle}
            className="min-w-10 shrink-0 rounded-full border border-zinc-500/80 bg-white/10 px-3 py-1 text-center text-xs font-bold text-white transition hover:border-[#00C4B0]/60 hover:bg-[#00C4B0]/20 sm:text-sm"
            aria-label={lang === "es" ? "Switch to English" : "Cambiar a Español"}
          >
            {lang === "es" ? "EN" : "ES"}
          </button>
        </div>
      </header>

      <section className="mx-auto w-full max-w-[1920px] px-4 pb-24 pt-10 sm:px-6 xl:px-14 2xl:px-20">
        <div className="max-w-3xl">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#65e2d5]">
            {t("Contenido para redes sociales", "Social media content")}
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-[-0.03em] text-white sm:text-4xl xl:text-5xl">
            {t("Flyers para Instagram", "Instagram Flyers")}
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-zinc-300 sm:text-base">
            {t(
              'Diez publicaciones listas en formato vertical 2:3. Descargue cada una en alta calidad con el botón "Descargar HQ", o active "Editar objetos" para mover, redimensionar, agregar texto o íconos y borrar — igual que en el editor de rótulos.',
              'Ten ready-to-post vertical 2:3 flyers. Download each one in high quality with the "Download HQ" button, or turn on "Edit objects" to move, resize, add text or icons, and delete — the same editor used for the road signs.',
            )}
          </p>
        </div>

        <div className="mt-10 grid gap-8 sm:grid-cols-2 xl:mt-14 xl:grid-cols-3 xl:gap-10">
          {FLYERS.map((flyer, index) => (
            <FlyerCard key={flyer.id} flyer={flyer} lang={lang} eager={index === 0} />
          ))}
        </div>

        <p className="mt-14 text-center text-xs text-zinc-500">
          {BUSINESS.name} &middot; {BUSINESS.place} &middot; {BUSINESS.web}
        </p>
      </section>
    </main>
  );
}
