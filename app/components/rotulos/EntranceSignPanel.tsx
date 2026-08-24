import Image from "next/image";
import QrCode from "./QrCode";
import { ARROWS, BUSINESS } from "./constants";
import { GroundShadow, LeafShape, LeafSprig, SignPosts } from "./SignChrome";
import type { Panel } from "./types";

/**
 * Portal principal. Se lee a baja velocidad, por eso admite contacto y QR,
 * pero conserva una mitad completa para mostrar el destino sin obstáculos.
 *
 * Es el único rótulo del set que se ve de cerca y con tiempo, así que es
 * también el único con textura de hoja de verdad (no un guiño discreto) y
 * el marco montado sobre postes que lo saca del rectángulo plano.
 */
export default function EntranceSignPanel({ panel, eager }: { panel: Panel; eager?: boolean }) {
  const Arrow = ARROWS[panel.arrow ?? "right"];

  return (
    <div className="relative flex flex-1 flex-col items-center pb-8 sm:pb-11">
      <div className="w-full drop-shadow-[0_34px_40px_rgba(0,0,0,0.55)]">
        <div className="relative overflow-hidden rounded-[30px] border-[8px] border-white bg-[#2E2A25] p-1.5">
          <div className="grid min-h-[760px] overflow-hidden rounded-[20px] border-2 border-[#00C4B0] bg-[#2E2A25] lg:min-h-[650px] lg:grid-cols-[minmax(360px,0.84fr)_minmax(0,1.16fr)]">
            <div className="relative order-2 flex min-w-0 flex-col overflow-hidden bg-[#2E2A25] p-5 text-white sm:p-7 lg:order-1 lg:p-8">
              <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.14]">
                <LeafShape veins className="absolute -right-10 -top-10 h-56 w-48 rotate-[22deg] text-[#00C4B0]" />
                <LeafShape veins className="absolute -bottom-16 -left-10 h-64 w-52 rotate-[-18deg] text-white" />
                <LeafShape veins className="absolute bottom-16 right-2 h-32 w-28 rotate-[8deg] text-[#00C4B0]" />
              </div>

              <div className="relative flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  {panel.brands.map((brand) => (
                    <div key={brand} className="bg-white p-1.5 shadow-xl shadow-black/30">
                      <Image
                        src={brand === "lva" ? "/logo2.jpg" : "/logo1.jpg"}
                        alt={
                          brand === "lva"
                            ? "La Vieja Adventures, logo oscuro"
                            : "La Vieja Adventures, logo turquesa"
                        }
                        width={92}
                        height={92}
                        className="h-16 w-16 object-contain sm:h-20 sm:w-20"
                        priority={eager}
                      />
                    </div>
                  ))}
                </div>
                <div className="relative shrink-0">
                  <Arrow
                    className="h-14 w-14 text-[#00C4B0] sm:h-20 sm:w-20"
                    strokeWidth={3.2}
                    aria-hidden
                  />
                  <LeafSprig className="pointer-events-none absolute -bottom-3 -left-4 h-11 w-14 text-[#7DE7DC] sm:h-14 sm:w-16" />
                </div>
              </div>

              <div className="relative my-auto py-8">
                {panel.kicker ? (
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-[#7DE7DC] sm:text-sm">
                    {panel.kicker}
                  </p>
                ) : null}
                <p className="mt-3 text-[clamp(2.25rem,5.5vw,5.1rem)] font-black uppercase leading-[0.87] tracking-[-0.055em] text-white">
                  {panel.title}
                </p>
                <p className="mt-3 text-sm font-bold uppercase tracking-[0.12em] text-[#A8F0E8] sm:text-lg">
                  {panel.titleEn}
                </p>
                {panel.subtitle ? (
                  <p className="mt-3 border-l-4 border-[#00C4B0] pl-3 text-base font-black uppercase tracking-[0.1em] text-white/90 sm:text-xl">
                    {panel.subtitle}
                  </p>
                ) : null}

                <div className="mt-7 bg-[#F5C518] px-4 py-3 text-[#2E2A25] shadow-[inset_0_2px_0_rgba(255,255,255,0.45)]">
                  <p className="text-lg font-black uppercase leading-tight sm:text-2xl">
                    {panel.cta.es}
                  </p>
                  <p className="mt-1 text-xs font-bold italic leading-tight text-[#2E2A25]/75 sm:text-sm">
                    {panel.cta.en}
                  </p>
                </div>
              </div>

              <div className="relative grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-t border-white/20 pt-4">
                <div className="min-w-0">
                  <p className="break-words text-lg font-black tracking-[-0.03em] text-white sm:text-2xl">
                    {BUSINESS.web}
                  </p>
                  <p className="mt-1 text-sm font-bold text-[#A8F0E8] sm:text-lg">
                    WhatsApp {BUSINESS.whatsapp}
                  </p>
                  <p className="text-xs font-semibold text-white/75 sm:text-sm">Tel. {BUSINESS.phone}</p>
                </div>
                <div className="flex shrink-0 flex-col items-center bg-white p-2 shadow-xl shadow-black/35">
                  <QrCode className="h-24 w-24 sm:h-28 sm:w-28" />
                  <span className="mt-1 text-[9px] font-black uppercase tracking-[0.1em] text-[#2E2A25]">
                    Escanee · Scan
                  </span>
                </div>
              </div>

              <p className="relative mt-4 text-[10px] font-semibold leading-relaxed text-white/60 sm:text-xs">
                Tours sujetos al clima, nivel del río y valoración del guía · Tours subject to
                weather, river level and guide assessment.
              </p>
            </div>

            <div className="relative order-1 min-h-[390px] overflow-hidden bg-zinc-800 lg:order-2 lg:min-h-full">
              <Image
                src={panel.photos[0]}
                alt="Visitante explorando el Cañón del Río La Vieja"
                fill
                sizes="(max-width: 1024px) 94vw, 62vw"
                priority={eager}
                className="object-cover saturate-[1.04]"
                style={{ objectPosition: "50% 48%" }}
              />
              <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/55 to-transparent" />
              <p className="absolute bottom-5 left-5 border-l-4 border-[#00C4B0] bg-[#2E2A25]/85 px-3 py-2 text-xs font-black uppercase tracking-[0.16em] text-white backdrop-blur-sm sm:text-sm">
                Cañón del Río La Vieja · San Carlos
              </p>
            </div>
          </div>
        </div>

        <SignPosts color="#2E2A25" className="scale-125 sm:scale-150" />
      </div>
      <GroundShadow className="mt-2 h-3 w-40 sm:w-56" />
    </div>
  );
}
