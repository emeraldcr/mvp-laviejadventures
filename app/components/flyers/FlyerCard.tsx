import SignLayoutEditor from "../rotulos/layout-editor/SignLayoutEditor";
import type { Lang } from "../rotulos/types";
import FlyerPanel from "./FlyerPanel";
import type { Flyer } from "./types";

type FlyerCardProps = {
  flyer: Flyer;
  lang: Lang;
  /** Solo la primera tarjeta de la cuadrícula: evita el aviso de LCP. */
  eager?: boolean;
};

/** Tarjeta de vista previa: código, formato y el lienzo editable tipo Canva. */
export default function FlyerCard({ flyer, lang, eager }: FlyerCardProps) {
  return (
    <article
      data-flyer-card
      className="flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-zinc-900/40 p-4 shadow-xl shadow-black/30 sm:p-5 xl:rounded-[2rem] xl:p-6"
    >
      <div className="mb-4 flex items-center justify-between gap-2">
        <span className="text-xs font-black uppercase tracking-[0.2em] text-[#65e2d5]">{flyer.code}</span>
        <span className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-300">
          1080 × 1080 · IG
        </span>
      </div>

      <SignLayoutEditor signId={flyer.code} signLabel={flyer.title} lang={lang}>
        <FlyerPanel flyer={flyer} eager={eager} />
      </SignLayoutEditor>
    </article>
  );
}
