import Image from "next/image";
import QrCode from "./QrCode";
import SocialMark from "./SocialMark";
import { ARROWS, BUSINESS, SOCIALS } from "./constants";
import type { Panel } from "./types";

/**
 * El portal de entrada se consulta con el carro lento o detenido. Puede usar
 * una sola foto amplia, más aire y datos completos sin copiar el formato de
 * los anticipos que se leen a velocidad.
 */
export default function EntranceSignPanel({ panel, eager }: { panel: Panel; eager?: boolean }) {
  const Arrow = ARROWS[panel.arrow ?? "right"];

  return (
    <div className="relative flex-1 overflow-hidden rounded-[22px] border-[6px] border-white/95 bg-[#2E2A25] p-1.5 shadow-[0_24px_54px_-20px_rgba(0,0,0,0.95)]">
      <div className="relative flex min-h-[840px] overflow-hidden rounded-[14px] border-2 border-[#00C4B0]/80 sm:min-h-[760px] lg:min-h-[690px]">
        <Image
          src={panel.photos[0]}
          alt=""
          fill
          sizes="(max-width: 1024px) 94vw, 1180px"
          priority={eager}
          className="object-cover brightness-[1.08] saturate-[1.08]"
          style={{ objectPosition: "48% 50%" }}
        />

        {/* El degradado cambia de dirección para conservar la toma en cada formato. */}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(46,42,37,0.32)_0%,rgba(46,42,37,0.08)_27%,rgba(46,42,37,0.52)_58%,rgba(46,42,37,0.86)_86%)] lg:hidden" />
        <div className="absolute inset-0 hidden bg-[linear-gradient(90deg,rgba(46,42,37,0.84)_0%,rgba(46,42,37,0.58)_43%,rgba(46,42,37,0.16)_73%,rgba(46,42,37,0.02)_100%)] lg:block" />
        <div className="absolute inset-x-0 bottom-0 h-[40%] bg-gradient-to-t from-[#2E2A25]/72 to-transparent" />

        <div className="relative flex w-full flex-col p-3 min-[380px]:p-5 sm:p-7 lg:p-9">
          {/* La flecha queda absoluta para no empujar los logos fuera del centro. */}
          <div className="relative flex min-h-[104px] items-start justify-center sm:min-h-[132px]">
            <div className="flex items-center gap-3 min-[380px]:gap-4 sm:gap-5">
              {panel.brands.map((brand) => (
                <Image
                  key={brand}
                  src={brand === "lva" ? "/logo2.jpg" : "/logo1.jpg"}
                  alt={
                    brand === "lva"
                      ? "La Vieja Adventures, logo oscuro"
                      : "La Vieja Adventures, logo turquesa"
                  }
                  width={128}
                  height={128}
                  className="h-16 w-16 rounded-xl border-[3px] border-white object-cover shadow-xl shadow-black/60 min-[380px]:h-20 min-[380px]:w-20 sm:h-28 sm:w-28 lg:h-32 lg:w-32"
                />
              ))}
            </div>

            {panel.arrow ? (
              <Arrow
                className="absolute right-0 top-[70px] h-8 w-8 text-white drop-shadow-[0_3px_8px_rgba(0,0,0,0.75)] min-[380px]:top-1 min-[380px]:h-9 min-[380px]:w-9 sm:h-14 sm:w-14 lg:h-16 lg:w-16"
                strokeWidth={3.25}
                aria-hidden
              />
            ) : null}
          </div>

          <div className="mt-5 max-w-[680px] rounded-2xl bg-[#2E2A25]/52 p-4 shadow-lg shadow-black/25 backdrop-blur-md sm:p-5 lg:mt-3 lg:max-w-[59%] lg:rounded-2xl lg:bg-[#2E2A25]/38 lg:p-5 lg:shadow-lg lg:backdrop-blur-md">
            {panel.kicker ? (
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#7DE7DC] min-[380px]:text-xs min-[380px]:tracking-[0.2em] sm:text-sm">
                {panel.kicker}
              </p>
            ) : null}
            <p className="mt-2 text-2xl font-black uppercase leading-[0.94] tracking-tight text-white drop-shadow-[0_2px_7px_rgba(0,0,0,0.65)] min-[380px]:text-3xl sm:text-4xl lg:text-5xl">
              {panel.title}
            </p>
            <p className="mt-2 text-xs font-bold uppercase tracking-[0.02em] text-[#A8F0E8] min-[380px]:text-sm min-[380px]:tracking-[0.08em] sm:text-base lg:text-lg">
              {panel.titleEn}
            </p>
            {panel.subtitle ? (
              <p className="mt-2 text-sm font-black uppercase tracking-[0.06em] text-white/90 min-[380px]:text-base min-[380px]:tracking-[0.12em] lg:text-lg">
                {panel.subtitle}
              </p>
            ) : null}

            <p className="mt-5 block w-full max-w-2xl rounded-lg bg-[#F5C518] px-3 py-3 text-base font-black uppercase leading-tight tracking-tight text-[#2E2A25] shadow-lg shadow-black/25 min-[380px]:inline-block min-[380px]:w-auto min-[380px]:px-4 min-[380px]:text-lg sm:text-xl lg:text-2xl">
              {panel.cta.es}
            </p>
            <p className="mt-2 break-words text-xs font-semibold italic text-white/90 min-[380px]:text-sm sm:text-base lg:text-lg">
              {panel.cta.en}
            </p>
          </div>

          {/* Sin truncate: sitio, teléfonos y usuario quedan completos. */}
          <div className="mt-7 grid grid-cols-1 items-center gap-5 rounded-2xl border border-white/25 bg-[#2E2A25]/58 p-3 shadow-2xl shadow-black/45 backdrop-blur-lg min-[380px]:p-5 sm:grid-cols-[minmax(0,1fr)_auto] lg:mt-auto lg:p-6">
            <div className="min-w-0">
              <p className="break-all text-lg font-black leading-none tracking-[-0.04em] text-white min-[380px]:break-words min-[380px]:text-[clamp(1.35rem,4vw,2.75rem)] lg:whitespace-nowrap">
                {BUSINESS.web}
              </p>

              <div className="mt-3 grid gap-1 lg:grid-cols-2 lg:gap-5">
                <p className="text-base font-black leading-tight text-white sm:text-xl lg:text-2xl">
                  WhatsApp {BUSINESS.whatsapp}
                </p>
                <p className="text-base font-black leading-tight text-white sm:text-xl lg:text-2xl">
                  Tel. {BUSINESS.phone}
                </p>
              </div>

              <p className="mt-2 break-all text-[10px] font-semibold text-[#A8F0E8] min-[380px]:break-words min-[380px]:text-xs sm:text-base">
                {BUSINESS.email}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-1 border-t border-white/15 pt-4 min-[380px]:gap-1.5 sm:gap-2.5">
                {SOCIALS.map((social) => (
                  <span
                    key={social.label}
                    title={`${social.label} ${social.handle}`}
                    className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-[#2E2A25] shadow-sm min-[380px]:h-7 min-[380px]:w-7 sm:h-10 sm:w-10"
                  >
                    <SocialMark path={social.path} className="h-3.5 w-3.5 min-[380px]:h-4 min-[380px]:w-4 sm:h-6 sm:w-6" />
                  </span>
                ))}
                <span className="basis-full break-words text-xs font-black uppercase tracking-[0.1em] text-white sm:text-sm md:ml-1 md:basis-auto">
                  {BUSINESS.handle}
                </span>
              </div>
            </div>

            <div className="mx-auto flex shrink-0 flex-col items-center gap-2 rounded-xl bg-white p-3 shadow-xl shadow-black/40">
              <QrCode className="h-36 w-36 lg:h-40 lg:w-40" />
              <span className="text-[10px] font-black uppercase leading-none tracking-[0.12em] text-[#2E2A25] lg:text-xs">
                Escanee &middot; Scan
              </span>
            </div>

            <p className="border-t border-white/15 pt-3 text-[10px] font-semibold leading-relaxed text-white/70 sm:col-span-2 sm:text-xs">
              Tours sujetos al clima, nivel del río y valoración del guía &middot; Tours subject
              to weather, river level and guide assessment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
