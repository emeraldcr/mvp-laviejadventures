"use client";

import { useMemo, useState } from "react";
import { ChevronsDown, ChevronsUp, Eye } from "lucide-react";
import RotuloCard from "./RotuloCard";
import type { Lang, Rotulo } from "./types";

type RotulosDisclosureListProps = {
  rotulos: Rotulo[];
  selected: number[];
  lang: Lang;
  onToggleSelected: (id: number) => void;
  price: (crc: number) => string;
  t: (es: string, en: string) => string;
};

export default function RotulosDisclosureList({
  rotulos,
  selected,
  lang,
  onToggleSelected,
  price,
  t,
}: RotulosDisclosureListProps) {
  const [expandedIds, setExpandedIds] = useState<number[]>([]);
  const allIds = useMemo(() => rotulos.map((rotulo) => rotulo.id), [rotulos]);
  const allExpanded = expandedIds.length === allIds.length;

  const toggleExpanded = (id: number) => {
    setExpandedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id].sort((a, b) => a - b),
    );
  };

  return (
    <section id="catalogo-rotulos" aria-labelledby="catalogo-rotulos-title" className="mt-10 scroll-mt-24">
      <div className="flex flex-col gap-5 rounded-3xl border border-white/10 bg-zinc-900/45 p-5 sm:p-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#65e2d5]">
            {t("Paso 1 · Rótulos y medidas", "Step 1 · Signs and dimensions")}
          </p>
          <h2 id="catalogo-rotulos-title" className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">
            {t("Abra solamente el rótulo que quiera revisar", "Open only the sign you want to review")}
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-zinc-400 sm:text-base">
            {t(
              "Las seis fichas empiezan cerradas. La medida, ubicación, cantidad y área siempre quedan visibles; el botón abre la maqueta grande y sus detalles.",
              "All six records start closed. Size, location, quantity and area remain visible; the button opens the large mockup and its details.",
            )}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setExpandedIds(allIds)}
            disabled={allExpanded}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#00C4B0]/45 bg-[#00C4B0]/10 px-4 text-sm font-black text-[#9ff5eb] transition hover:bg-[#00C4B0]/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00C4B0] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronsDown className="h-4 w-4" aria-hidden />
            {t("Ver todos", "View all")}
          </button>
          <button
            type="button"
            onClick={() => setExpandedIds([])}
            disabled={expandedIds.length === 0}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 text-sm font-black text-zinc-200 transition hover:border-[#00C4B0]/45 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00C4B0] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronsUp className="h-4 w-4" aria-hidden />
            {t("Cerrar todos", "Close all")}
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 px-1 text-xs font-bold text-zinc-400" aria-live="polite">
        <span className="inline-flex items-center gap-2">
          <Eye className="h-4 w-4 text-[#00C4B0]" aria-hidden />
          {expandedIds.length} {t("abiertos de", "open of")} {rotulos.length}
        </span>
        <span>
          {selected.length} {t("fichas incluidas en el cálculo", "records included in calculation")}
        </span>
      </div>

      <div className="mt-4 grid gap-4">
        {rotulos.map((rotulo, index) => {
          const expanded = expandedIds.includes(rotulo.id);
          return (
            <RotuloCard
              key={rotulo.id}
              rotulo={rotulo}
              lang={lang}
              active={selected.includes(rotulo.id)}
              onToggle={onToggleSelected}
              expanded={expanded}
              onToggleExpanded={toggleExpanded}
              price={price}
              t={t}
              eager={index === 0 && expanded}
            />
          );
        })}
      </div>
    </section>
  );
}
