"use client";

import { useMemo, useState } from "react";
import { Check, Minus, Plus } from "lucide-react";
import {
  BUDGET_CRC,
  BUDGET_PROPOSALS,
  PRICE_PER_M2,
  SIZE_TIERS,
  VENDOR,
  distributionCount,
  distributionTotal,
  type Distribution,
  type SizeKey,
} from "./pricing";
import type { Copy, Lang } from "./types";

type BudgetPlannerProps = {
  lang: Lang;
  price: (crc: number) => string;
  t: (es: string, en: string) => string;
};

const DEFAULT_PROPOSAL = BUDGET_PROPOSALS.find((p) => p.recommended) ?? BUDGET_PROPOSALS[0];

/**
 * Presupuesto de ¢300.000 repartido en tres propuestas fijas más una
 * calculadora libre: el admin escoge cuántos rótulos de cada tamaño quiere
 * (2 grandes, 2 medianos...) y ve el total y lo que queda del presupuesto
 * en vivo.
 */
export default function BudgetPlanner({ lang, price, t }: BudgetPlannerProps) {
  const tc = (copy: Copy) => copy[lang];
  const [distribution, setDistribution] = useState<Distribution>(DEFAULT_PROPOSAL.distribution);
  const [activePreset, setActivePreset] = useState<string | null>(DEFAULT_PROPOSAL.id);

  const total = useMemo(() => distributionTotal(distribution), [distribution]);
  const count = useMemo(() => distributionCount(distribution), [distribution]);
  const remaining = BUDGET_CRC - total;
  const usedPct = Math.min(100, Math.round((total / BUDGET_CRC) * 100));

  const applyPreset = (id: string) => {
    const preset = BUDGET_PROPOSALS.find((p) => p.id === id);
    if (!preset) return;
    setDistribution(preset.distribution);
    setActivePreset(id);
  };

  const adjust = (key: SizeKey, delta: number) => {
    setActivePreset(null);
    setDistribution((prev) => ({ ...prev, [key]: Math.max(0, (prev[key] ?? 0) + delta) }));
  };

  return (
    <section className="mt-14 border-t border-white/10 pt-10">
      <p className="text-[11px] font-black uppercase tracking-[0.24em] text-emerald-300">
        {t("Presupuesto y distribución", "Budget & distribution")}
      </p>
      <h2 className="mt-3 text-3xl font-black tracking-tight text-white md:text-4xl">
        {t("Tres formas de repartir ₡300.000", "Three ways to split ₡300,000")}
      </h2>
      <p className="mt-4 max-w-3xl text-sm leading-relaxed text-zinc-300 md:text-base">
        {t(
          `Cálculo interno a partir de la referencia preliminar de ${VENDOR}: adhesivo impreso, lámina de 2 × 1 m = ₡25.000 + IVA. Repartida proporcionalmente por área, esa cifra da ₡${Math.round(
            PRICE_PER_M2,
          ).toLocaleString("es-CR")}/m² + IVA. Los tamaños de abajo son estimaciones matemáticas no cotizadas y no autorizan una compra.`,
          `Internal calculation based on ${VENDOR}'s preliminary reference: printed adhesive, 2 × 1 m panel = ₡25,000 + tax. Distributed proportionally by area, that gives ₡${Math.round(
            PRICE_PER_M2,
          ).toLocaleString("es-CR")}/m² + tax. The sizes below are unquoted mathematical estimates and cannot authorize a purchase.`,
        )}
      </p>

      {/* Tarifas por tamaño */}
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {SIZE_TIERS.map((tier) => (
          <div key={tier.key} className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm font-black uppercase tracking-[0.14em] text-emerald-300">
              {tc(tier.label)}
            </p>
            <p className="mt-1 text-xs text-zinc-400">
              {tier.width.toFixed(2)} × {tier.height.toFixed(2)} m &middot; {(tier.width * tier.height).toFixed(2)} m²
            </p>
            <p className="mt-3 text-2xl font-black text-white">{price(tier.total)}</p>
            <p className="text-[11px] text-zinc-500">
              {price(tier.base)} + {t("IVA", "tax")} &middot; {t("estimación interna", "internal estimate")}
            </p>
          </div>
        ))}
      </div>

      {/* Tres propuestas */}
      <div className="mt-8 grid gap-5 lg:grid-cols-3">
        {BUDGET_PROPOSALS.map((proposal) => {
          const pTotal = distributionTotal(proposal.distribution);
          const pRemaining = BUDGET_CRC - pTotal;
          const pUsed = Math.min(100, Math.round((pTotal / BUDGET_CRC) * 100));
          const isActive = activePreset === proposal.id;

          return (
            <div
              key={proposal.id}
              className={`flex flex-col rounded-3xl border p-5 ${
                proposal.recommended ? "border-emerald-300/40 bg-emerald-400/5" : "border-white/10 bg-zinc-900/60"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-lg font-black text-white">{tc(proposal.name)}</h3>
                {proposal.recommended ? (
                  <span className="shrink-0 rounded-full border border-emerald-300/50 bg-emerald-400/20 px-2.5 py-1 text-[10px] font-black text-emerald-100">
                    {t("Distribución sugerida", "Suggested mix")}
                  </span>
                ) : null}
              </div>
              <p className="mt-2 text-sm text-zinc-400">{tc(proposal.description)}</p>

              <ul className="mt-3 space-y-1 text-sm text-zinc-300">
                {SIZE_TIERS.map((tier) => {
                  const n = proposal.distribution[tier.key] ?? 0;
                  if (!n) return null;
                  return (
                    <li key={tier.key} className="flex items-center justify-between gap-2">
                      <span>
                        {n} &times; {tc(tier.label)}
                      </span>
                      <span className="text-zinc-500">{price(n * tier.total)}</span>
                    </li>
                  );
                })}
              </ul>

              <div className="mt-auto border-t border-white/10 pt-4">
                <div className="flex items-end justify-between">
                  <span className="text-xs text-zinc-500">
                    {distributionCount(proposal.distribution)} {t("rótulos", "signs")}
                  </span>
                  <span className="text-xl font-black text-white">{price(pTotal)}</span>
                </div>
                <div className="mt-2 h-1.5 rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-emerald-400" style={{ width: `${pUsed}%` }} />
                </div>
                <p className="mt-1 text-[11px] text-zinc-500">
                  {pUsed}% {t("del presupuesto", "of budget")} &middot; {t("quedan", "remaining")}{" "}
                  {price(Math.max(0, pRemaining))}
                </p>
              </div>

              <button
                type="button"
                onClick={() => applyPreset(proposal.id)}
                className={`mt-4 inline-flex items-center justify-center gap-1.5 rounded-full border px-3 py-2 text-xs font-black transition ${
                  isActive
                    ? "border-emerald-300/60 bg-emerald-400/20 text-emerald-100"
                    : "border-white/20 bg-white/5 text-zinc-200 hover:border-emerald-200/50"
                }`}
              >
                {isActive ? (
                  <>
                    <Check className="h-3.5 w-3.5" aria-hidden />
                    {t("Aplicada abajo", "Applied below")}
                  </>
                ) : (
                  t("Usar esta distribución", "Use this distribution")
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Calculadora libre */}
      <div className="mt-8 rounded-3xl border border-white/10 bg-zinc-900/60 p-5 md:p-6">
        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-300">
          {t("Arme su propia distribución", "Build your own mix")}
        </p>
        <p className="mt-2 text-sm text-zinc-400">
          {t(
            "Escoja cuántos rótulos de cada tamaño quiere: por ejemplo, 2 grandes y 2 medianos.",
            "Choose how many signs of each size you want: for example, 2 large and 2 medium.",
          )}
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {SIZE_TIERS.map((tier) => (
            <div key={tier.key} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm font-black text-white">{tc(tier.label)}</p>
              <p className="text-[11px] text-zinc-500">
                {price(tier.total)} {t("c/u", "each")}
              </p>
              <div className="mt-3 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => adjust(tier.key, -1)}
                  aria-label={t("Restar", "Decrease")}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 text-white transition hover:border-emerald-200/50"
                >
                  <Minus className="h-4 w-4" aria-hidden />
                </button>
                <span className="text-xl font-black tabular-nums text-white">
                  {distribution[tier.key] ?? 0}
                </span>
                <button
                  type="button"
                  onClick={() => adjust(tier.key, 1)}
                  aria-label={t("Sumar", "Increase")}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 text-white transition hover:border-emerald-200/50"
                >
                  <Plus className="h-4 w-4" aria-hidden />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap items-end justify-between gap-3 border-t border-white/10 pt-4">
          <div>
            <p className="text-xs text-zinc-500">
              {count} {t("rótulos seleccionados", "signs selected")}
            </p>
            <p className="text-2xl font-black text-white">{price(total)}</p>
          </div>
          <div className="text-right">
            <p className={`text-sm font-black ${remaining < 0 ? "text-rose-400" : "text-emerald-300"}`}>
              {remaining < 0
                ? `${t("Excede el presupuesto por", "Over budget by")} ${price(Math.abs(remaining))}`
                : `${t("Quedan", "Remaining")} ${price(remaining)}`}
            </p>
            <p className="text-[11px] text-zinc-500">
              {t("Presupuesto", "Budget")}: {price(BUDGET_CRC)}
            </p>
          </div>
        </div>
        <div className="mt-2 h-2 rounded-full bg-white/10">
          <div
            className={`h-full rounded-full transition-all ${remaining < 0 ? "bg-rose-400" : "bg-emerald-400"}`}
            style={{ width: `${usedPct}%` }}
          />
        </div>
      </div>
    </section>
  );
}
