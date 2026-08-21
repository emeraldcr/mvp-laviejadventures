import { signSubtotal } from "./helpers";
import type { Lang, Rotulo } from "./types";

type RotulosSummaryTableProps = {
  rotulos: Rotulo[];
  /** Ids incluidos: los excluidos se tachan pero se siguen viendo. */
  selected: number[];
  lang: Lang;
  total: number;
  price: (crc: number) => string;
  t: (es: string, en: string) => string;
};

/** Cierre de la cotización: cada rótulo, su punto y el total de lo incluido. */
export default function RotulosSummaryTable({
  rotulos,
  selected,
  lang,
  total,
  price,
  t,
}: RotulosSummaryTableProps) {
  return (
    <div className="mt-8 overflow-x-auto rounded-3xl border border-white/10 bg-zinc-900/60">
      <table className="w-full min-w-[520px] text-left text-sm">
        <thead className="bg-white/5 text-[11px] uppercase tracking-[0.16em] text-zinc-400">
          <tr>
            <th className="px-4 py-3 font-black">{t("Rótulo", "Sign")}</th>
            <th className="px-4 py-3 font-black">{t("Ubicación", "Location")}</th>
            <th className="px-4 py-3 text-right font-black">{t("Monto", "Amount")}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10">
          {rotulos.map((rotulo) => (
            <tr
              key={rotulo.id}
              className={
                selected.includes(rotulo.id)
                  ? "text-zinc-200"
                  : "text-zinc-500 line-through"
              }
            >
              <td className="px-4 py-3 font-bold">
                <span className="text-emerald-300">{rotulo.code}</span> {rotulo.name}
              </td>
              <td className="px-4 py-3 text-zinc-400">{rotulo.placement[lang]}</td>
              <td className="px-4 py-3 text-right font-black text-white">
                {price(signSubtotal(rotulo))}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot className="bg-emerald-400/10 text-emerald-100">
          <tr>
            <td className="px-4 py-4 font-black uppercase tracking-[0.16em]" colSpan={2}>
              {t("Total seleccionado", "Selected total")}
            </td>
            <td className="px-4 py-4 text-right text-xl font-black text-white">
              {price(total)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
