import { Check, LayoutPanelTop, Ruler, X } from "lucide-react";
import { signSubtotal } from "./helpers";
import { formatAreaM2, rotuloMeasurementSummary, rotuloTotalAreaM2 } from "./measurements";
import type { Lang, Rotulo } from "./types";

type RotulosSummaryTableProps = {
  rotulos: Rotulo[];
  selected: number[];
  lang: Lang;
  total: number;
  price: (crc: number) => string;
  t: (es: string, en: string) => string;
};

/** Resumen en tarjetas para móvil y tabla ampliada para pantallas grandes. */
export default function RotulosSummaryTable({
  rotulos,
  selected,
  lang,
  total,
  price,
  t,
}: RotulosSummaryTableProps) {
  return (
    <div className="mt-4">
      <div className="space-y-3 sm:hidden">
        {rotulos.map((rotulo) => {
          const included = selected.includes(rotulo.id);
          return (
            <article
              key={rotulo.id}
              className={`rounded-2xl border p-4 ${
                included
                  ? "border-[#00C4B0]/30 bg-[#00C4B0]/10"
                  : "border-white/10 bg-white/[0.03]"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#65e2d5]">
                    {rotulo.code}
                  </p>
                  <h3 className="mt-1 font-black text-white">{rotulo.name}</h3>
                </div>
                <span className={`inline-flex shrink-0 items-center gap-1 text-xs font-black ${included ? "text-[#9ff5eb]" : "text-zinc-500"}`}>
                  {included ? <Check className="h-3.5 w-3.5" aria-hidden /> : <X className="h-3.5 w-3.5" aria-hidden />}
                  {included ? t("Incluido", "Included") : t("Excluido", "Excluded")}
                </span>
              </div>
              <p className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-zinc-300">
                <Ruler className="mt-0.5 h-4 w-4 shrink-0 text-[#00C4B0]" aria-hidden />
                {rotuloMeasurementSummary(rotulo, lang)}
              </p>
              <div className="mt-3 flex items-end justify-between gap-3 border-t border-white/10 pt-3">
                <p className="flex items-center gap-1.5 text-xs text-zinc-400">
                  <LayoutPanelTop className="h-4 w-4" aria-hidden />
                  {rotulo.panels.length} {rotulo.panels.length === 1 ? t("lámina", "panel") : t("láminas", "panels")} · {formatAreaM2(rotuloTotalAreaM2(rotulo), lang)}
                </p>
                <p className="font-black text-white">{price(signSubtotal(rotulo))}</p>
              </div>
            </article>
          );
        })}

        <div className="flex items-end justify-between gap-3 rounded-2xl border border-[#00C4B0]/35 bg-[#00C4B0]/15 p-4">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-[#9ff5eb]">
            {t("Estimación interna seleccionada", "Selected internal estimate")}
          </p>
          <p className="text-xl font-black text-white">{price(total)}</p>
        </div>
      </div>

      <div className="hidden overflow-x-auto rounded-3xl border border-white/10 bg-zinc-900/60 sm:block">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead className="bg-white/5 text-[11px] uppercase tracking-[0.14em] text-zinc-400">
            <tr>
              <th className="px-4 py-3 font-black">{t("Rótulo", "Sign")}</th>
              <th className="px-4 py-3 font-black">{t("Ubicación", "Location")}</th>
              <th className="px-4 py-3 font-black">{t("Cantidad y medida", "Quantity and size")}</th>
              <th className="px-4 py-3 text-right font-black">{t("Estimación interna", "Internal estimate")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {rotulos.map((rotulo) => {
              const included = selected.includes(rotulo.id);
              return (
                <tr key={rotulo.id} className={included ? "text-zinc-200" : "bg-black/10 text-zinc-500"}>
                  <td className="px-4 py-4 font-bold">
                    <span className="text-[#65e2d5]">{rotulo.code}</span> {rotulo.name}
                    <span className={`mt-1 flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.12em] ${included ? "text-[#9ff5eb]" : "text-zinc-600"}`}>
                      {included ? <Check className="h-3 w-3" aria-hidden /> : <X className="h-3 w-3" aria-hidden />}
                      {included ? t("Incluido", "Included") : t("Excluido", "Excluded")}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-zinc-400">{rotulo.placement[lang]}</td>
                  <td className="px-4 py-4">
                    <p className="font-bold text-zinc-200">
                      {rotulo.panels.length} {rotulo.panels.length === 1 ? t("lámina", "panel") : t("láminas", "panels")}
                    </p>
                    <p className="mt-1 max-w-[340px] text-xs leading-relaxed text-zinc-400">
                      {rotuloMeasurementSummary(rotulo, lang)} · {formatAreaM2(rotuloTotalAreaM2(rotulo), lang)} {t("total", "total")}
                    </p>
                  </td>
                  <td className="px-4 py-4 text-right font-black text-white">
                    {price(signSubtotal(rotulo))}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="bg-[#00C4B0]/10 text-[#c7faf5]">
            <tr>
              <td className="px-4 py-4 font-black uppercase tracking-[0.14em]" colSpan={3}>
                {t("Estimación interna seleccionada", "Selected internal estimate")}
              </td>
              <td className="px-4 py-4 text-right text-xl font-black text-white">{price(total)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
