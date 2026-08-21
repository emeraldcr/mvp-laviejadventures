"use client";

import Image from "next/image";
import Link from "next/link";
import { Printer } from "lucide-react";
import type { Currency, Lang } from "./types";

type RotulosHeaderProps = {
  lang: Lang;
  onToggleLang: () => void;
  currency: Currency;
  onToggleCurrency: () => void;
  t: (es: string, en: string) => string;
};

/** Barra pegajosa: volver al sitio, imprimir, moneda e idioma. */
export default function RotulosHeader({
  lang,
  onToggleLang,
  currency,
  onToggleCurrency,
  t,
}: RotulosHeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-zinc-950/85 backdrop-blur-2xl print:hidden">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 md:px-8">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo2.jpg"
            alt="La Vieja Adventures Logo"
            width={40}
            height={40}
            className="object-contain shadow-md shadow-black/30"
            priority
          />
          <span className="hidden text-sm font-black tracking-tight text-white sm:inline md:text-base">
            La Vieja Adventures
          </span>
        </Link>

        <nav className="flex items-center gap-2 text-xs font-semibold text-zinc-200 md:gap-4 md:text-sm">
          <button
            type="button"
            onClick={() => window.print()}
            className="hidden items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1 transition hover:border-emerald-200 hover:text-white sm:inline-flex"
          >
            <Printer className="h-4 w-4" aria-hidden />
            {t("Imprimir", "Print")}
          </button>
          <button
            type="button"
            onClick={onToggleCurrency}
            className="min-w-14 rounded-full border border-emerald-300/40 bg-emerald-400/10 px-3 py-1 font-bold text-emerald-200 transition hover:bg-emerald-400/20"
            aria-label={t("Cambiar moneda", "Switch currency")}
          >
            {currency === "crc" ? "₡ CRC" : "$ USD"}
          </button>
          <button
            type="button"
            onClick={onToggleLang}
            className="min-w-10 rounded-full border border-zinc-500/80 bg-white/10 px-3 py-1 text-center font-bold text-white transition hover:border-emerald-200 hover:bg-emerald-400/20"
            aria-label={lang === "es" ? "Switch to English" : "Cambiar a Español"}
          >
            {lang === "es" ? "EN" : "ES"}
          </button>
        </nav>
      </div>
    </header>
  );
}
