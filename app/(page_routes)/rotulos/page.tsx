"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/LanguageContext";
import QuoteWorkflowCard from "@/app/components/rotulos/QuoteWorkflowCard";
import RotulosDesignGuideDisclosure from "@/app/components/rotulos/RotulosDesignGuideDisclosure";
import RotulosDisclosureList from "@/app/components/rotulos/RotulosDisclosureList";
import RotulosHeader from "@/app/components/rotulos/RotulosHeader";
import RotulosPlanOverview from "@/app/components/rotulos/RotulosPlanOverview";
import RotulosSummaryTable from "@/app/components/rotulos/RotulosSummaryTable";
import { BUSINESS } from "@/app/components/rotulos/constants";
import { ROTULOS } from "@/app/components/rotulos/data";
import {
  createTranslator,
  formatPrice,
  selectionTotals,
} from "@/app/components/rotulos/helpers";
import type { Currency } from "@/app/components/rotulos/types";

/**
 * Plan de señalización: primero alcance y medidas, después diseños desplegables,
 * selección preliminar y finalmente el acceso a las tres cotizaciones.
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
            {t(
              "Plan de rótulos: 6 fichas, 7 láminas físicas y medidas claras",
              "Sign plan: 6 records, 7 physical panels and clear dimensions",
            )}
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-zinc-400 sm:text-base">
            {t(
              "Revise primero el tamaño propuesto, abra únicamente los diseños que quiera comparar y después lleve el mismo alcance a tres empresas cotizadoras.",
              "Review the proposed size first, open only the designs you want to compare, then send the same scope to three quoting companies.",
            )}
          </p>
          <div className="mt-6 grid gap-3 text-sm sm:grid-cols-3">
            <a
              href="#catalogo-rotulos"
              className="rounded-2xl border border-white/10 bg-white/5 p-4 font-bold text-zinc-200 transition hover:border-[#00C4B0]/45 hover:bg-[#00C4B0]/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00C4B0]"
            >
              <span className="block text-[10px] font-black uppercase tracking-[0.16em] text-[#65e2d5]">
                {t("Paso 1", "Step 1")}
              </span>
              <span className="mt-1 block">{t("Medidas y diseños", "Sizes and designs")}</span>
            </a>
            <a
              href="#resumen-seleccion"
              className="rounded-2xl border border-white/10 bg-white/5 p-4 font-bold text-zinc-200 transition hover:border-[#00C4B0]/45 hover:bg-[#00C4B0]/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00C4B0]"
            >
              <span className="block text-[10px] font-black uppercase tracking-[0.16em] text-[#65e2d5]">
                {t("Paso 2", "Step 2")}
              </span>
              <span className="mt-1 block">{t("Selección y total", "Selection and total")}</span>
            </a>
            <Link
              href="/rotulos/cotizacion"
              className="rounded-2xl border border-[#00C4B0]/35 bg-[#00C4B0]/10 p-4 font-bold text-[#c7faf5] transition hover:bg-[#00C4B0]/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00C4B0]"
            >
              <span className="block text-[10px] font-black uppercase tracking-[0.16em] text-[#65e2d5]">
                {t("Paso 3", "Step 3")}
              </span>
              <span className="mt-1 block">{t("Comparar 3 empresas", "Compare 3 companies")}</span>
            </Link>
          </div>
        </div>

        <RotulosPlanOverview rotulos={ROTULOS} lang={lang} t={t} />

        <RotulosDisclosureList
          rotulos={ROTULOS}
          selected={selected}
          lang={lang}
          onToggleSelected={toggleRotulo}
          price={price}
          t={t}
        />

        <details
          id="resumen-seleccion"
          className="group mt-10 scroll-mt-24 overflow-hidden rounded-3xl border border-white/10 bg-zinc-900/60"
        >
          <summary className="flex cursor-pointer list-none flex-col gap-4 p-5 marker:hidden sm:flex-row sm:items-center sm:justify-between sm:p-6 [&::-webkit-details-marker]:hidden">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#65e2d5]">
                {t("Paso 2 · Selección y presupuesto", "Step 2 · Selection and budget")}
              </p>
              <h2 className="mt-1 text-2xl font-black tracking-tight text-white sm:text-3xl">
                {t("Resumen preliminar", "Preliminary summary")}
              </h2>
              <p className="mt-2 text-sm text-zinc-400">
                {totals.count} {t("fichas", "records")} · {totals.panels} {t("láminas", "panels")} · {price(totals.amount)}
              </p>
            </div>
            <span className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#00C4B0]/40 bg-[#00C4B0]/10 px-5 text-sm font-black text-[#9ff5eb]">
              <span className="group-open:hidden">{t("Ver resumen", "View summary")}</span>
              <span className="hidden group-open:inline">{t("Ocultar resumen", "Hide summary")}</span>
            </span>
          </summary>

          <div className="border-t border-white/10 p-4 sm:p-6">
            <RotulosSummaryTable
              rotulos={ROTULOS}
              selected={selected}
              lang={lang}
              total={totals.amount}
              price={price}
              t={t}
            />
            <p className="mt-3 text-xs leading-relaxed text-zinc-500">
              {t(
                "El monto mostrado es una estimación interna: parte de la referencia preliminar de FC Rótulos para adhesivo impreso de 2 × 1 m y calcula los otros tamaños proporcionalmente por área. No es una cotización recibida ni sirve para aprobar el pago; la decisión requiere tres ofertas comparables del mismo alcance.",
                "The displayed amount is an internal estimate: it starts from FC Rótulos' preliminary reference for a 2 × 1 m printed adhesive and calculates other sizes proportionally by area. It is not a received quote and cannot approve payment; the decision requires three comparable offers for the same scope.",
              )}
            </p>
          </div>
        </details>

        <div className="mt-8">
          <QuoteWorkflowCard lang={lang} t={t} />
        </div>

        <RotulosDesignGuideDisclosure lang={lang} />

        <p className="mt-10 text-center text-xs text-zinc-500">
          {BUSINESS.name} &middot; {BUSINESS.place} &middot; {BUSINESS.web}
        </p>
      </section>
    </main>
  );
}
