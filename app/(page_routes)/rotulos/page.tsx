"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { ImageIcon } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import QuoteWorkflowCard from "@/app/components/rotulos/QuoteWorkflowCard";
import RotulosBudgetStatus from "@/app/components/rotulos/RotulosBudgetStatus";
import RotulosDesignGuideDisclosure from "@/app/components/rotulos/RotulosDesignGuideDisclosure";
import RotulosDisclosureList from "@/app/components/rotulos/RotulosDisclosureList";
import RotulosHeader from "@/app/components/rotulos/RotulosHeader";
import RotulosSummaryTable from "@/app/components/rotulos/RotulosSummaryTable";
import presentationStyles from "@/app/components/rotulos/RotulosPresentation.module.css";
import { BUSINESS } from "@/app/components/rotulos/constants";
import { ROTULOS } from "@/app/components/rotulos/data";
import { createTranslator, formatPrice, selectionBreakdown } from "@/app/components/rotulos/helpers";
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
  const breakdown = useMemo(() => selectionBreakdown(ROTULOS, selected), [selected]);

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
        <RotulosSummaryTable
          rotulos={ROTULOS}
          selected={selected}
          lang={lang}
          price={price}
          t={t}
        />

        <div className="mt-4 print:hidden">
          <RotulosBudgetStatus
            amount={breakdown.total}
            baseAmount={breakdown.base}
            budgetCrc={BUDGET_CRC}
            price={price}
            t={t}
          />
        </div>

        <RotulosDisclosureList
          rotulos={ROTULOS}
          selected={selected}
          lang={lang}
          onToggleSelected={toggleRotulo}
          price={price}
          t={t}
        />

        <div className="mt-12 flex justify-end print:hidden">
          <Link
            href="/flyers"
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[#00C4B0]/45 bg-[#00C4B0]/10 px-4 text-sm font-black text-[#9ff5eb] transition hover:bg-[#00C4B0]/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00C4B0]"
          >
            <ImageIcon className="h-4 w-4" aria-hidden />
            {t("Ver flyers para Instagram", "View Instagram flyers")}
          </Link>
        </div>

        <div className="mt-6 xl:mt-8 print:hidden">
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
