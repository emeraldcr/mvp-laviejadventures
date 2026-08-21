"use client";

import { useCallback, useMemo, useState } from "react";
import { useLanguage } from "@/lib/LanguageContext";
import RotuloCard from "@/app/components/rotulos/RotuloCard";
import RotulosHeader from "@/app/components/rotulos/RotulosHeader";
import RotulosSummaryTable from "@/app/components/rotulos/RotulosSummaryTable";
import SignProposals from "@/app/components/rotulos/SignProposals";
import { BUSINESS } from "@/app/components/rotulos/constants";
import { ROTULOS } from "@/app/components/rotulos/data";
import {
  createTranslator,
  formatPrice,
  selectionTotals,
} from "@/app/components/rotulos/helpers";
import type { Currency } from "@/app/components/rotulos/types";

/**
 * Cotización de rotulación: las seis láminas, su ficha y el total de lo que
 * quede incluido. Los datos viven en `data.ts` y cada pieza en su componente.
 */
export default function RotulosPage() {
  const { lang, toggle } = useLanguage();
  const [currency, setCurrency] = useState<Currency>("crc");
  const [selected, setSelected] = useState<number[]>(ROTULOS.map((r) => r.id));

  const toggleRotulo = useCallback(
    (id: number) =>
      setSelected((prev) =>
        prev.includes(id)
          ? prev.filter((x) => x !== id)
          : [...prev, id].sort((a, b) => a - b),
      ),
    [],
  );

  const totals = useMemo(() => selectionTotals(ROTULOS, selected), [selected]);

  const price = useCallback((crc: number) => formatPrice(crc, currency), [currency]);
  const t = useMemo(() => createTranslator(lang), [lang]);

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <RotulosHeader
        lang={lang}
        onToggleLang={toggle}
        currency={currency}
        onToggleCurrency={() => setCurrency((c) => (c === "crc" ? "usd" : "crc"))}
        t={t}
      />

      <section className="mx-auto w-full max-w-[1500px] px-2 pb-16 sm:px-4 md:px-8">
        <div className="py-8 sm:py-10">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#00C4B0]">
            Sistema de señalización · La Vieja Adventures
          </p>
          <h1 className="mt-2 max-w-4xl text-3xl font-black tracking-[-0.04em] text-white sm:text-5xl">
            Rótulos claros, memorables y fáciles de leer en movimiento
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-zinc-400 sm:text-base">
            Fotografías despejadas, mensajes cortos y direcciones dominantes. Cada formato se
            adapta al momento real de lectura: carretera, entrada o circulación interna.
          </p>
          <div className="mt-5 flex flex-wrap gap-2 text-[11px] font-black uppercase tracking-[0.12em] text-zinc-200">
            <span className="border border-white/15 bg-white/5 px-3 py-2">Foto protagonista</span>
            <span className="border border-white/15 bg-white/5 px-3 py-2">Mensaje corto</span>
            <span className="border border-white/15 bg-white/5 px-3 py-2">Dirección visible</span>
          </div>
        </div>
        <div className="grid gap-8">
          {ROTULOS.map((rotulo, index) => (
            <RotuloCard
              key={rotulo.id}
              rotulo={rotulo}
              lang={lang}
              active={selected.includes(rotulo.id)}
              onToggle={toggleRotulo}
              price={price}
              t={t}
              eager={index === 0}
            />
          ))}
        </div>

        <RotulosSummaryTable
          rotulos={ROTULOS}
          selected={selected}
          lang={lang}
          total={totals.amount}
          price={price}
          t={t}
        />

        <SignProposals lang={lang} />

        <p className="mt-10 text-center text-xs text-zinc-500">
          {BUSINESS.name} &middot; {BUSINESS.place} &middot; {BUSINESS.web}
        </p>
      </section>
    </main>
  );
}
