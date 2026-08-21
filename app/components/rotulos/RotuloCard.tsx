"use client";

import { LayoutPanelTop, MapPin } from "lucide-react";
import EntranceSignPanel from "./EntranceSignPanel";
import SignPanel from "./SignPanel";
import { KIND_META } from "./constants";
import { signSubtotal } from "./helpers";
import type { Lang, Rotulo } from "./types";

type RotuloCardProps = {
  rotulo: Rotulo;
  lang: Lang;
  /** Si está incluido en la cotización: si no, la tarjeta se apaga. */
  active: boolean;
  onToggle: (id: number) => void;
  /** Formatea un monto en la moneda que esté puesta arriba. */
  price: (crc: number) => string;
  t: (es: string, en: string) => string;
  /** Solo la primera tarjeta de la página: evita el aviso de LCP. */
  eager?: boolean;
};

/** Tarjeta de un rótulo: la lámina a la izquierda y su ficha a la derecha. */
export default function RotuloCard({
  rotulo,
  lang,
  active,
  onToggle,
  price,
  t,
  eager,
}: RotuloCardProps) {
  const meta = KIND_META[rotulo.kind];
  const Icon = meta.icon;
  const subtotal = signSubtotal(rotulo);

  return (
    <article
      className={`flex flex-col overflow-hidden rounded-3xl border bg-zinc-900/60 shadow-xl shadow-black/40 transition ${
        active ? "border-emerald-300/30" : "border-white/10 opacity-55 grayscale"
      }`}
    >
      <div className="flex items-start justify-between gap-3 border-b border-white/10 px-5 py-4">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-300">
            {rotulo.code}
          </p>
          <h2 className="mt-1 text-xl font-black tracking-tight text-white">
            {rotulo.name}
          </h2>
        </div>
        <button
          type="button"
          onClick={() => onToggle(rotulo.id)}
          aria-pressed={active}
          className={`shrink-0 rounded-full border px-3 py-1 text-xs font-black transition ${
            active
              ? "border-emerald-300/50 bg-emerald-400/20 text-emerald-100 hover:bg-emerald-400/30"
              : "border-white/20 bg-white/5 text-zinc-300 hover:border-emerald-200/50"
          }`}
        >
          {active ? t("Incluido", "Included") : t("Excluido", "Excluded")}
        </button>
      </div>

      <div
        className={`grid gap-5 ${
          rotulo.kind === "entrada"
            ? "p-2 min-[380px]:p-3 sm:p-5"
            : "p-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(260px,0.6fr)]"
        }`}
      >
        <div
          className={`flex flex-col gap-4 rounded-2xl bg-zinc-950/40 xl:flex-row ${
            rotulo.kind === "entrada" ? "p-1 min-[380px]:p-2 sm:p-4" : "p-4"
          }`}
        >
          {rotulo.panels.map((panel, index) =>
            rotulo.kind === "entrada" ? (
              <EntranceSignPanel
                key={`${rotulo.id}-${index}`}
                panel={panel}
                eager={eager}
              />
            ) : (
              <SignPanel
                key={`${rotulo.id}-${index}`}
                panel={panel}
                eager={eager}
              />
            ),
          )}
        </div>

        <div className="flex flex-1 flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-bold ${meta.tone}`}
            >
              <Icon className="h-3.5 w-3.5" aria-hidden />
              {meta.label[lang]}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-bold text-zinc-300">
              <LayoutPanelTop className="h-3.5 w-3.5" aria-hidden />
              {rotulo.panels.length}{" "}
              {rotulo.panels.length === 1
                ? t("lámina", "panel")
                : t("láminas", "panels")}
            </span>
          </div>

          <p className="flex items-start gap-2 text-sm text-zinc-300">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" aria-hidden />
            {rotulo.placement[lang]}
          </p>
          <p className="text-sm leading-relaxed text-zinc-400">{rotulo.purpose[lang]}</p>

          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-300">
              {t("Frase de calle", "Street hook")}
            </p>
            <ul className="mt-1.5 space-y-1.5 text-sm text-zinc-200">
              {rotulo.panels.map((panel, index) => (
                <li key={`${rotulo.id}-cta-${index}`} className="flex gap-2">
                  <span className="text-emerald-300">&rarr;</span>
                  <span>
                    {panel.cta.es}
                    <span className="block text-xs italic text-zinc-400">
                      {panel.cta.en}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-auto flex items-end justify-between border-t border-white/10 pt-3">
            <div className="text-xs text-zinc-400">
              {rotulo.panels.length > 1
                ? rotulo.panels.map((p) => price(p.price)).join(" + ")
                : t("Precio unitario", "Unit price")}
            </div>
            <div className="text-2xl font-black tracking-tight text-white">
              {price(subtotal)}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
