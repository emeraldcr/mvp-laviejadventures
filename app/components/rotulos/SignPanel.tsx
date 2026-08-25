import Image from "next/image";
import { ARROWS, PHOTO_FOCUS, PICTOGRAMS } from "./constants";
import { diagonalBand, diagonalEdge } from "./helpers";
import { GroundShadow, LeafShape, LeafSprig, SignPosts, WaveSeam } from "./SignChrome";
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
 *
 * La lámina se monta sobre dos postes y proyecta su propia sombra recortada
 * a la silueta redondeada -no la caja rectangular del componente-, y lleva
 * un acento de hoja discreto junto al pictograma y la flecha. La flecha en
 * sí se mantiene limpia a propósito: a 60 km/h no hay tiempo para decorarla.
 */
export default function SignPanel({ panel, kind, large, eager }: SignPanelProps) {
  const Arrow = ARROWS[panel.arrow ?? "right"];
  const Picto = PICTOGRAMS[panel.pictogram];
  const theme = SIGN_THEME[kind];
  const logo = panel.brands[0] === "lva-turquoise" ? "/logo1.jpg" : "/logo2.jpg";
  const hasPhotos = panel.photos.length > 0;
  const aspectClass =
    panel.size === "grande"
      ? "aspect-[4/5] min-h-[480px] min-[520px]:aspect-[4/3] lg:aspect-[16/10] 2xl:aspect-[2/1] 2xl:min-h-0 print:aspect-[2/1] print:min-h-0"
      : panel.size === "mediano"
        ? "aspect-[4/5] min-h-[480px] sm:aspect-[4/3] 2xl:aspect-[3/2] 2xl:min-h-0 print:aspect-[3/2] print:min-h-0"
        : "aspect-[4/5] min-h-[480px] sm:aspect-[4/3] xl:aspect-square xl:min-h-0 print:aspect-square print:min-h-0";

  return (
    <div data-sign-artwork className="relative flex min-w-0 flex-1 flex-col items-center pb-7 sm:pb-9 xl:pb-12 print:pb-0">
      <div className="w-full drop-shadow-[0_26px_30px_rgba(0,0,0,0.5)] print:drop-shadow-none">
        <div
          data-sign-artboard
          data-panel-size={panel.size}
          className={`relative flex w-full flex-col overflow-hidden rounded-[26px] border-[7px] border-white bg-[#2E2A25] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)] xl:rounded-[34px] xl:border-[10px] print:rounded-none ${aspectClass}`}
        >
          {hasPhotos ? (
            <div className="relative min-h-0 flex-[1.1] overflow-hidden bg-zinc-800">
              {panel.photos.length > 2 ? (
                <div className="relative h-full w-full bg-white">
                  {panel.photos.map((photo, index) => (
                    <div
                      key={photo}
                      className="absolute inset-0"
                      style={{ clipPath: diagonalBand(index, panel.photos.length) }}
                    >
                      <Image
                        src={photo}
                        alt=""
                        fill
                        sizes={large ? "(max-width: 1280px) 94vw, 1500px" : "(max-width: 1280px) 94vw, 760px"}
                        priority={eager && index === 0}
                        className="object-cover saturate-[1.04]"
                        style={{ objectPosition: PHOTO_FOCUS[index % PHOTO_FOCUS.length] }}
                      />
                    </div>
                  ))}
                  {panel.photos.slice(0, -1).map((photo, index) => (
                    <div
                      key={`edge-${photo}`}
                      className="pointer-events-none absolute inset-0 bg-white/85 blur-md"
                      style={{ clipPath: diagonalEdge(index, panel.photos.length) }}
                    />
                  ))}
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <div className="rounded-2xl border-2 border-white bg-white/95 p-3 shadow-[0_20px_45px_-18px_rgba(0,0,0,0.55)] sm:p-4">
                      <Image
                        src={logo}
                        alt="La Vieja Adventures"
                        width={large ? 120 : 96}
                        height={large ? 120 : 96}
                        className="h-auto w-20 object-contain sm:w-24 lg:w-28 xl:w-32"
                      />
                    </div>
                  </div>
                </div>
              ) : (
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
                              ? "(max-width: 1280px) 94vw, 1500px"
                              : "(max-width: 1280px) 34vw, 520px"
                            : "(max-width: 1280px) 46vw, 760px"
                        }
                        priority={eager && index === 0}
                        className="object-cover saturate-[1.04]"
                        style={{ objectPosition: index === 0 ? "center 48%" : "center 42%" }}
                      />
                    </div>
                  ))}
                </div>
              )}

              {panel.kicker ? (
                <div
                  className="absolute left-3 top-3 max-w-[70%] border-l-4 bg-[#2E2A25]/92 px-3 py-2 text-[10px] font-black uppercase tracking-[0.17em] text-white shadow-xl backdrop-blur-sm sm:text-xs xl:left-6 xl:top-6 xl:px-5 xl:py-3 xl:text-sm"
                  style={{ borderColor: theme.accent }}
                >
                  {panel.kicker}
                </div>
              ) : null}

              <WaveSeam
                fill={theme.background}
                className="pointer-events-none absolute inset-x-0 -bottom-px h-7 w-full sm:h-9 xl:h-10"
              />
            </div>
          ) : null}

          <div
            className={`relative flex min-h-0 flex-1 flex-col px-4 py-3 text-white sm:px-5 sm:py-4 xl:px-8 xl:py-5 2xl:px-10 2xl:py-7 ${
              hasPhotos ? "" : "justify-center"
            }`}
            style={{ backgroundColor: theme.background }}
          >
            <div
              className="absolute inset-x-0 top-0 h-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]"
              style={{ backgroundColor: theme.accent }}
            />
            <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.08]">
              <LeafShape className="absolute -right-4 -top-5 h-24 w-20 rotate-[16deg] text-white xl:h-48 xl:w-40" />
              <LeafShape className="absolute -bottom-8 left-4 h-20 w-16 rotate-[-22deg] text-white xl:h-36 xl:w-28" />
            </div>

            {!hasPhotos && panel.kicker ? (
              <p className="relative mb-4 text-xs font-black uppercase tracking-[0.22em] text-white/75 xl:mb-5 xl:text-base 2xl:mb-7 2xl:text-lg">
                {panel.kicker}
              </p>
            ) : null}

            <div className="relative flex min-h-0 flex-1 items-center gap-3 sm:gap-4 xl:gap-6 2xl:gap-8">
              <div
                className={`relative flex shrink-0 items-center justify-center border-2 border-white/75 ${
                  large
                    ? "h-16 w-16 sm:h-20 sm:w-20 xl:h-24 xl:w-24 2xl:h-28 2xl:w-28"
                    : "h-14 w-14 sm:h-16 sm:w-16 xl:h-20 xl:w-20 2xl:h-24 2xl:w-24"
                }`}
              >
                <Picto
                  className={
                    large
                      ? "h-11 w-11 sm:h-14 sm:w-14 xl:h-16 xl:w-16 2xl:h-20 2xl:w-20"
                      : "h-10 w-10 sm:h-11 sm:w-11 xl:h-14 xl:w-14 2xl:h-16 2xl:w-16"
                  }
                  strokeWidth={2.25}
                  aria-hidden
                />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-white/70 sm:text-[10px] xl:text-xs 2xl:text-sm">
                  {theme.eyebrow}
                </p>
                <p
                  className={`mt-1 font-black uppercase leading-[0.9] tracking-[-0.035em] text-white ${
                    large
                      ? hasPhotos
                        ? "text-[clamp(1.8rem,4.1vw,4.75rem)]"
                        : "text-[clamp(2.3rem,5.4vw,6rem)]"
                      : "text-[clamp(1.45rem,3vw,3.1rem)]"
                  }`}
                >
                  {panel.title}
                </p>
                <p
                  className={`mt-1.5 font-bold uppercase leading-tight tracking-[0.06em] text-white/75 ${
                    large
                      ? "text-[clamp(0.7rem,1.2vw,1.2rem)]"
                      : "text-[10px] sm:text-xs xl:text-sm 2xl:text-base"
                  }`}
                >
                  {panel.titleEn}
                </p>
                {panel.subtitle ? (
                  <p className="mt-2 border-t border-white/25 pt-2 text-[10px] font-bold uppercase leading-tight tracking-[0.08em] text-white/90 sm:text-xs xl:mt-3 xl:pt-3 xl:text-base 2xl:mt-4 2xl:pt-4 2xl:text-lg">
                    {panel.subtitle}
                  </p>
                ) : null}
              </div>

              <div className="relative flex shrink-0 flex-col items-center justify-center self-stretch border-l border-white/25 pl-3 sm:pl-4 xl:pl-6 2xl:pl-8">
                <LeafSprig
                  className={`pointer-events-none absolute text-white/50 ${
                    large
                      ? "-top-3 right-1 h-9 w-12 sm:h-11 sm:w-14 xl:h-14 xl:w-16 2xl:h-16 2xl:w-20"
                      : "-top-2 right-0 h-8 w-10 xl:h-12 xl:w-14 2xl:h-14 2xl:w-16"
                  }`}
                />
                <Arrow
                  className={
                    large
                      ? "h-16 w-16 sm:h-24 sm:w-24 xl:h-28 xl:w-28 2xl:h-32 2xl:w-32"
                      : "h-14 w-14 sm:h-16 sm:w-16 xl:h-20 xl:w-20 2xl:h-24 2xl:w-24"
                  }
                  strokeWidth={3.4}
                  aria-hidden
                />
                {panel.distance ? (
                  <span
                    className={`mt-1 font-black leading-none ${
                      large
                        ? "text-2xl sm:text-4xl xl:text-4xl 2xl:text-5xl"
                        : "text-xl sm:text-2xl xl:text-2xl 2xl:text-3xl"
                    }`}
                    style={{ color: theme.accent }}
                  >
                    {panel.distance}
                  </span>
                ) : null}
              </div>
            </div>

            <div className="relative mt-2 flex items-center justify-between gap-3 border-t border-white/20 pt-2 xl:mt-3 xl:pt-3 2xl:mt-5 2xl:pt-4">
              <p className="text-[9px] font-black uppercase tracking-[0.14em] text-white/75 sm:text-[10px] xl:text-xs 2xl:text-sm">
                laviejaadventures.com
              </p>
              <div className="shrink-0 bg-white p-1">
                <Image
                  src={logo}
                  alt="La Vieja Adventures"
                  width={large ? 42 : 34}
                  height={large ? 42 : 34}
                  className="h-auto w-8 object-contain sm:w-10 xl:w-12 2xl:w-14"
                />
              </div>
            </div>
          </div>
        </div>

        <SignPosts color={theme.background} className="print:hidden" />
      </div>
      <GroundShadow className="mt-1 h-2 w-24 sm:w-32 xl:w-44 print:hidden" />
    </div>
  );
}
