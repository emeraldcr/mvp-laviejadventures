import Image from "next/image";
import { ARROWS, PICTOGRAMS } from "./constants";
import type { Panel, RotuloKind } from "./types";

type SignPanelProps = {
  panel: Panel;
  kind: Exclude<RotuloKind, "entrada">;
  large?: boolean;
  /** Solo la primera lámina de la página: evita el aviso de LCP. */
  eager?: boolean;
};

const SIGN_THEME: Record<
  Exclude<RotuloKind, "entrada">,
  { background: string; accent: string; eyebrow: string }
> = {
  anticipo: { background: "#5C3B1E", accent: "#F5C518", eyebrow: "Destino turístico" },
  destino: { background: "#0B4EA2", accent: "#F5C518", eyebrow: "Servicios" },
  indicador: { background: "#2E2A25", accent: "#00C4B0", eyebrow: "Orientación interna" },
  par: { background: "#2E2A25", accent: "#00C4B0", eyebrow: "La Vieja Adventures" },
};

/**
 * Lámina de carretera con dos zonas claras: la fotografía conserva todo el
 * protagonismo y la información crítica descansa sobre un fondo sólido.
 * El mensaje promocional completo vive en la ficha, no encima de la imagen.
 */
export default function SignPanel({ panel, kind, large, eager }: SignPanelProps) {
  const Arrow = ARROWS[panel.arrow ?? "right"];
  const Picto = PICTOGRAMS[panel.pictogram];
  const theme = SIGN_THEME[kind];
  const logo = panel.brands[0] === "lva-turquoise" ? "/logo1.jpg" : "/logo2.jpg";

  return (
    <div
      className={`relative flex min-w-0 flex-1 flex-col overflow-hidden border-[6px] border-white bg-[#2E2A25] shadow-[0_24px_50px_-20px_rgba(0,0,0,0.95)] ${
        large
          ? "aspect-[4/5] min-[520px]:aspect-[4/3] lg:aspect-[16/10]"
          : "aspect-[4/5] min-h-[480px] sm:aspect-[4/3] xl:aspect-[4/5]"
      }`}
    >
      <div className="relative min-h-0 flex-[1.35] overflow-hidden bg-zinc-800">
        <div
          className={`grid h-full gap-1 bg-white ${
            panel.photos.length > 1
              ? "grid-cols-[minmax(0,1.7fr)_minmax(90px,0.7fr)]"
              : "grid-cols-1"
          }`}
        >
          {panel.photos.slice(0, 2).map((photo, index) => (
            <div key={photo} className="relative min-h-0 overflow-hidden bg-zinc-800">
              <Image
                src={photo}
                alt=""
                fill
                sizes={
                  large
                    ? index === 0
                      ? "(max-width: 1024px) 70vw, 700px"
                      : "(max-width: 1024px) 28vw, 280px"
                    : "(max-width: 1280px) 46vw, 360px"
                }
                priority={eager && index === 0}
                className="object-cover saturate-[1.04]"
                style={{ objectPosition: index === 0 ? "center 48%" : "center 42%" }}
              />
            </div>
          ))}
        </div>

        {panel.kicker ? (
          <div
            className="absolute left-3 top-3 max-w-[70%] border-l-4 bg-[#2E2A25]/92 px-3 py-2 text-[10px] font-black uppercase tracking-[0.17em] text-white shadow-xl backdrop-blur-sm sm:text-xs"
            style={{ borderColor: theme.accent }}
          >
            {panel.kicker}
          </div>
        ) : null}
      </div>

      <div
        className="relative flex min-h-0 flex-1 flex-col px-4 py-3 text-white sm:px-5 sm:py-4"
        style={{ backgroundColor: theme.background }}
      >
        <div className="absolute inset-x-0 top-0 h-1.5" style={{ backgroundColor: theme.accent }} />

        <div className="flex min-h-0 flex-1 items-center gap-3 sm:gap-4">
          <div
            className={`flex shrink-0 items-center justify-center border-2 border-white/75 ${
              large ? "h-16 w-16 sm:h-20 sm:w-20" : "h-14 w-14 sm:h-16 sm:w-16"
            }`}
          >
            <Picto
              className={large ? "h-11 w-11 sm:h-14 sm:w-14" : "h-10 w-10 sm:h-11 sm:w-11"}
              strokeWidth={2.25}
              aria-hidden
            />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-[9px] font-black uppercase tracking-[0.18em] text-white/70 sm:text-[10px]">
              {theme.eyebrow}
            </p>
            <p
              className={`mt-1 font-black uppercase leading-[0.9] tracking-[-0.035em] text-white ${
                large
                  ? "text-[clamp(1.5rem,4.4vw,4.2rem)]"
                  : "text-[clamp(1.45rem,3vw,2.6rem)]"
              }`}
            >
              {panel.title}
            </p>
            <p
              className={`mt-1.5 font-bold uppercase leading-tight tracking-[0.06em] text-white/75 ${
                large
                  ? "text-[clamp(0.68rem,1.3vw,1.05rem)]"
                  : "text-[10px] sm:text-xs"
              }`}
            >
              {panel.titleEn}
            </p>
            {panel.subtitle ? (
              <p className="mt-2 border-t border-white/25 pt-2 text-[10px] font-bold uppercase leading-tight tracking-[0.08em] text-white/90 sm:text-xs">
                {panel.subtitle}
              </p>
            ) : null}
          </div>

          <div className="flex shrink-0 flex-col items-center justify-center self-stretch border-l border-white/25 pl-3 sm:pl-4">
            <Arrow
              className={large ? "h-16 w-16 sm:h-24 sm:w-24" : "h-14 w-14 sm:h-16 sm:w-16"}
              strokeWidth={3.4}
              aria-hidden
            />
            {panel.distance ? (
              <span
                className={`mt-1 font-black leading-none ${
                  large ? "text-2xl sm:text-4xl" : "text-xl sm:text-2xl"
                }`}
                style={{ color: theme.accent }}
              >
                {panel.distance}
              </span>
            ) : null}
          </div>
        </div>

        <div className="mt-2 flex items-center justify-between gap-3 border-t border-white/20 pt-2">
          <p className="text-[9px] font-black uppercase tracking-[0.14em] text-white/75 sm:text-[10px]">
            laviejaadventures.com
          </p>
          <div className="shrink-0 bg-white p-1">
            <Image
              src={logo}
              alt="La Vieja Adventures"
              width={large ? 42 : 34}
              height={large ? 42 : 34}
              className="h-auto w-8 object-contain sm:w-10"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
