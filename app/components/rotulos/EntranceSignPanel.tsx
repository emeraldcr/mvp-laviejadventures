import Image from "next/image";
import QrCode from "./QrCode";
import { ARROWS, BUSINESS } from "./constants";
import type { Panel } from "./types";

/**
 * Portal principal. Se lee a baja velocidad, por eso admite contacto y QR,
 * pero conserva una mitad completa para mostrar el destino sin obstáculos.
 */
export default function EntranceSignPanel({ panel, eager }: { panel: Panel; eager?: boolean }) {
  const Arrow = ARROWS[panel.arrow ?? "right"];

  return (
    <div className="relative flex-1 overflow-hidden border-[6px] border-white bg-[#2E2A25] p-1.5 shadow-[0_24px_54px_-20px_rgba(0,0,0,0.95)]">
      <div className="grid min-h-[760px] overflow-hidden border-2 border-[#00C4B0] bg-[#2E2A25] lg:min-h-[650px] lg:grid-cols-[minmax(360px,0.84fr)_minmax(0,1.16fr)]">
        <div className="order-2 flex min-w-0 flex-col bg-[#2E2A25] p-5 text-white sm:p-7 lg:order-1 lg:p-8">
          <div className="flex items-start justify-between gap-4">
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
            <Arrow
              className="h-14 w-14 shrink-0 text-[#00C4B0] sm:h-20 sm:w-20"
              strokeWidth={3.2}
              aria-hidden
            />
          </div>

          <div className="my-auto py-8">
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

            <div className="mt-7 bg-[#F5C518] px-4 py-3 text-[#2E2A25]">
              <p className="text-lg font-black uppercase leading-tight sm:text-2xl">
                {panel.cta.es}
              </p>
              <p className="mt-1 text-xs font-bold italic leading-tight text-[#2E2A25]/75 sm:text-sm">
                {panel.cta.en}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-t border-white/20 pt-4">
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

          <p className="mt-4 text-[10px] font-semibold leading-relaxed text-white/60 sm:text-xs">
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
  );
}
