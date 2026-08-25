"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/LanguageContext";
import QuoteWorkflowCard from "@/app/components/rotulos/QuoteWorkflowCard";
import RotulosBudgetStatus from "@/app/components/rotulos/RotulosBudgetStatus";
import RotulosDesignGuideDisclosure from "@/app/components/rotulos/RotulosDesignGuideDisclosure";
import RotulosDisclosureList from "@/app/components/rotulos/RotulosDisclosureList";
import RotulosHeader from "@/app/components/rotulos/RotulosHeader";
import RotulosPlanOverview from "@/app/components/rotulos/RotulosPlanOverview";
import RotulosSummaryTable from "@/app/components/rotulos/RotulosSummaryTable";
import presentationStyles from "@/app/components/rotulos/RotulosPresentation.module.css";
import { BUSINESS } from "@/app/components/rotulos/constants";
import { ROTULOS } from "@/app/components/rotulos/data";
import {
  createTranslator,
  formatPrice,
  selectionBreakdown,
  selectionTotals,
} from "@/app/components/rotulos/helpers";
import { planMeasurementStats } from "@/app/components/rotulos/measurements";
import { BUDGET_CRC } from "@/app/components/rotulos/pricing";
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
  const breakdown = useMemo(() => selectionBreakdown(ROTULOS, selected), [selected]);

  /** Lleva la selección actual al comparador, para que su alcance no dependa de un default aparte. */
  const cotizacionHref = useMemo(() => {
    const chosen = ROTULOS.filter((rotulo) => selected.includes(rotulo.id));
    const bySize = planMeasurementStats(chosen).bySize;
    const params = new URLSearchParams({
      large: String(bySize.grande),
      medium: String(bySize.mediano),
      small: String(bySize.pequeno),
    });
    return `/rotulos/cotizacion?${params.toString()}`;
  }, [selected]);

  const price = useCallback((crc: number) => formatPrice(crc, currency), [currency]);
  const t = useMemo(() => createTranslator(lang), [lang]);

  return (
    <main className={`${presentationStyles.page} min-h-screen bg-zinc-950 text-white print:bg-white print:text-black`}>
      <RotulosHeader
        lang={lang}
        onToggleLang={toggle}
        currency={currency}
        onToggleCurrency={() => setCurrency((c) => (c === "crc" ? "usd" : "crc"))}
        t={t}
      />

      <section className="mx-auto w-full max-w-[1920px] px-3 pb-20 sm:px-6 lg:px-10 xl:px-14 2xl:px-20 print:max-w-none print:p-0">
        <div className="py-10 sm:py-12 xl:py-20 2xl:py-24 print:hidden">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#00C4B0]">
            Sistema de señalización · La Vieja Adventures
          </p>
          <h1 className="mt-3 max-w-6xl text-3xl font-black tracking-[-0.04em] text-white sm:text-5xl xl:text-6xl 2xl:text-7xl">
            {t(
              "Siete láminas en una vista amplia para revisar cada detalle",
              "Seven panels in a wide view for reviewing every detail",
            )}
          </h1>
          <p className="mt-5 max-w-4xl text-sm leading-relaxed text-zinc-400 sm:text-base xl:text-lg">
            {t(
              "Los rótulos aparecen abiertos y a gran escala para una revisión cómoda en escritorio. Debajo de cada arte quedan sus medidas, función y estimación para cotizar el mismo alcance con tres empresas.",
              "Signs open at a large scale for comfortable desktop review. Dimensions, purpose and estimate remain below each artwork so three companies can quote the same scope.",
            )}
          </p>
          <div className="mt-8 grid gap-4 text-sm sm:grid-cols-3 xl:mt-12 xl:gap-6 xl:text-base">
            <a
              href="#catalogo-rotulos"
              className="rounded-2xl border border-white/10 bg-white/5 p-4 font-bold text-zinc-200 transition hover:border-[#00C4B0]/45 hover:bg-[#00C4B0]/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00C4B0] xl:rounded-3xl xl:p-6"
            >
              <span className="block text-[10px] font-black uppercase tracking-[0.16em] text-[#65e2d5]">
                {t("Paso 1", "Step 1")}
              </span>
              <span className="mt-1 block">{t("Medidas y diseños", "Sizes and designs")}</span>
            </a>
            <a
              href="#resumen-seleccion"
              className="rounded-2xl border border-white/10 bg-white/5 p-4 font-bold text-zinc-200 transition hover:border-[#00C4B0]/45 hover:bg-[#00C4B0]/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00C4B0] xl:rounded-3xl xl:p-6"
            >
              <span className="block text-[10px] font-black uppercase tracking-[0.16em] text-[#65e2d5]">
                {t("Paso 2", "Step 2")}
              </span>
              <span className="mt-1 block">{t("Selección y total", "Selection and total")}</span>
            </a>
            <Link
              href={cotizacionHref}
              className="rounded-2xl border border-[#00C4B0]/35 bg-[#00C4B0]/10 p-4 font-bold text-[#c7faf5] transition hover:bg-[#00C4B0]/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00C4B0] xl:rounded-3xl xl:p-6"
            >
              <span className="block text-[10px] font-black uppercase tracking-[0.16em] text-[#65e2d5]">
                {t("Paso 3", "Step 3")}
              </span>
              <span className="mt-1 block">{t("Comparar 3 empresas", "Compare 3 companies")}</span>
            </Link>
          </div>
        </div>

        <div className="print:hidden">
          <RotulosPlanOverview rotulos={ROTULOS} lang={lang} t={t} />
        </div>

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
          className="group mt-16 scroll-mt-24 overflow-hidden rounded-3xl border border-white/10 bg-zinc-900/60 xl:mt-24 print:hidden"
        >
          <summary className="flex cursor-pointer list-none flex-col gap-4 p-5 marker:hidden sm:flex-row sm:items-center sm:justify-between sm:p-6 [&::-webkit-details-marker]:hidden">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#65e2d5]">
                {t("Paso 2 · Selección y presupuesto", "Step 2 · Selection and budget")}
              </p>
              <h2 className="mt-1 text-2xl font-black tracking-tight text-white sm:text-3xl">
                {t("Resumen preliminar", "Preliminary summary")}
              </h2>
              <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-2 text-sm text-zinc-400">
                <span>
                  {totals.count} {t("fichas", "records")} · {totals.panels} {t("láminas", "panels")} · {price(totals.amount)}
                </span>
                <RotulosBudgetStatus
                  amount={totals.amount}
                  baseAmount={breakdown.base}
                  budgetCrc={BUDGET_CRC}
                  price={price}
                  t={t}
                  variant="pill"
                />
              </div>
            </div>
            <span className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#00C4B0]/40 bg-[#00C4B0]/10 px-5 text-sm font-black text-[#9ff5eb]">
              <span className="group-open:hidden">{t("Ver resumen", "View summary")}</span>
              <span className="hidden group-open:inline">{t("Ocultar resumen", "Hide summary")}</span>
            </span>
          </summary>

          <div className="border-t border-white/10 p-4 sm:p-6">
            <RotulosBudgetStatus
              amount={totals.amount}
              baseAmount={breakdown.base}
              budgetCrc={BUDGET_CRC}
              price={price}
              t={t}
              variant="card"
            />
            <div className="mt-4">
              <RotulosSummaryTable
                rotulos={ROTULOS}
                selected={selected}
                lang={lang}
                total={totals.amount}
                price={price}
                t={t}
              />
            </div>
            <p className="mt-3 text-xs leading-relaxed text-zinc-500">
              {t(
                "El monto mostrado es una estimación interna: parte de la referencia preliminar de FC Rótulos para adhesivo impreso de 2 × 1 m y calcula los otros tamaños proporcionalmente por área. No es una cotización recibida ni sirve para aprobar el pago; la decisión requiere tres ofertas comparables del mismo alcance.",
                "The displayed amount is an internal estimate: it starts from FC Rótulos' preliminary reference for a 2 × 1 m printed adhesive and calculates other sizes proportionally by area. It is not a received quote and cannot approve payment; the decision requires three comparable offers for the same scope.",
              )}
            </p>
          </div>
        </details>

        <div className="mt-12 xl:mt-16 print:hidden">
          <QuoteWorkflowCard lang={lang} t={t} href={cotizacionHref} />
        </div>

        <div className="print:hidden">
          <RotulosDesignGuideDisclosure lang={lang} />
        </div>

        <p className="mt-12 text-center text-xs text-zinc-500 print:hidden">
          {BUSINESS.name} &middot; {BUSINESS.place} &middot; {BUSINESS.web}
        </p>
      </section>
    </main>
  );
}
