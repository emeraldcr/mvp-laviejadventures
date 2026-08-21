import Image from "next/image";
import QrCode from "./QrCode";
import SocialMark from "./SocialMark";
import {
  ARROWS,
  BUSINESS,
  GLASS,
  GLASS_BASE,
  PHOTO_FOCUS,
  PICTOGRAMS,
  SOCIALS,
  TEXT_SHADOW,
} from "./constants";
import { diagonalBand, diagonalEdge } from "./helpers";
import type { Panel } from "./types";

/**
 * Vista previa de una lámina: la foto va a sangre en toda la lámina y los
 * módulos flotan encima en vidrio. Se mantiene la división en módulos de las
 * propuestas — cada uno dice una sola cosa — pero ahora se ve la imagen debajo.
 */
export default function SignPanel({
  panel,
  large,
  eager,
}: {
  panel: Panel;
  large?: boolean;
  /** Solo la primera lámina de la página: evita el aviso de LCP. */
  eager?: boolean;
}) {
  const Arrow = ARROWS[panel.arrow ?? "right"];
  const Picto = PICTOGRAMS[panel.pictogram];

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border-[6px] border-white/90 bg-emerald-950 shadow-[0_24px_50px_-20px_rgba(0,0,0,0.95)]">
      {/* Foto a sangre: ocupa la lámina entera, cortada en diagonal. */}
      <div className="absolute inset-0">
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
              sizes="(max-width: 1024px) 94vw, 60vw"
              priority={eager && index === 0}
              className="scale-[1.05] object-cover"
              style={{ objectPosition: PHOTO_FOCUS[index % PHOTO_FOCUS.length] }}
            />
          </div>
        ))}
        {panel.photos.slice(0, -1).map((photo, index) => (
          <div
            key={`edge-${photo}`}
            className="absolute inset-0 bg-white/70"
            style={{ clipPath: diagonalEdge(index, panel.photos.length) }}
          />
        ))}
        {/* Velo suave: apenas lo justo para que el vidrio tenga sobre qué apoyarse. */}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,32,24,0.28)_0%,rgba(3,32,24,0.12)_38%,rgba(3,32,24,0.42)_100%)]" />
      </div>

      <div className="relative flex flex-col gap-2 p-2">
        {/* MÓDULO 1 · marca: los logos flotan sobre la foto, sin taparla. */}
        <div className="flex items-start justify-between gap-3 p-1">
          <div className="flex items-center gap-3">
            {panel.brands.map((brand) => (
              <Image
                key={brand}
                src={brand === "lva" ? "/logo2.jpg" : "/logo1.jpg"}
                alt={brand === "lva" ? "La Vieja Adventures" : "La Vieja Organics"}
                width={large ? 150 : 116}
                height={large ? 150 : 116}
                className="rounded-2xl border-[3px] border-white/90 object-cover shadow-2xl shadow-black/70"
              />
            ))}
          </div>
          {panel.kicker ? (
            <span
              className={`${GLASS_BASE} rounded-full px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.2em] text-white md:text-xs`}
              style={{ backgroundColor: GLASS.gray }}
            >
              {panel.kicker}
            </span>
          ) : null}
        </div>

        {/* MÓDULO 2 · destino: el renglón que se lee de lejos, con pictograma. */}
        <div
          className={`${GLASS_BASE} flex items-center gap-4 px-4 py-3`}
          style={{ backgroundColor: GLASS.green }}
        >
          <Picto
            className={`shrink-0 text-white ${TEXT_SHADOW} ${
              large ? "h-20 w-20" : "h-14 w-14"
            }`}
            strokeWidth={2.5}
            aria-hidden
          />
          <div className="min-w-0 flex-1">
            <p
              className={`font-black uppercase leading-[0.92] tracking-tight text-white ${TEXT_SHADOW} ${
                large ? "text-4xl md:text-6xl" : "text-2xl md:text-4xl"
              }`}
            >
              {panel.title}
            </p>
            {/* Bilingüe sutil: el inglés va debajo, más chico y con menos peso. */}
            <p
              className={`mt-1.5 font-semibold uppercase tracking-[0.16em] text-white/80 ${TEXT_SHADOW} ${
                large ? "text-base md:text-lg" : "text-[11px] md:text-sm"
              }`}
            >
              {panel.titleEn}
            </p>
            {panel.subtitle ? (
              <p
                className={`mt-2 border-t border-white/30 pt-2 font-black uppercase tracking-[0.14em] text-white ${TEXT_SHADOW} ${
                  large ? "text-xl md:text-2xl" : "text-sm md:text-lg"
                }`}
              >
                {panel.subtitle}
              </p>
            ) : null}
          </div>
        </div>

        {/* MÓDULO 3 · flecha y distancia en azul, acción en amarillo. */}
        <div className="flex gap-2">
          <div
            className={`${GLASS_BASE} flex shrink-0 flex-col items-center justify-center px-4 py-3`}
            style={{ backgroundColor: GLASS.blue }}
          >
            <Arrow
              className={`text-white ${TEXT_SHADOW} ${large ? "h-24 w-24" : "h-16 w-16"}`}
              strokeWidth={3.5}
              aria-hidden
            />
            {panel.distance ? (
              <span
                className={`mt-1 font-black leading-none text-white ${TEXT_SHADOW} ${
                  large ? "text-3xl" : "text-xl"
                }`}
              >
                {panel.distance}
              </span>
            ) : null}
          </div>

          <div
            className={`${GLASS_BASE} flex min-w-0 flex-1 flex-col justify-center px-4 py-3`}
            style={{ backgroundColor: GLASS.yellow, borderColor: GLASS.yellowEdge }}
          >
            <p
              className={`font-black uppercase leading-tight tracking-tight text-zinc-900 ${
                large ? "text-2xl md:text-3xl" : "text-base md:text-xl"
              }`}
            >
              {panel.cta.es}
            </p>
            <p
              className={`mt-1 font-bold italic leading-tight text-zinc-900/75 ${
                large ? "text-base" : "text-[11px] md:text-sm"
              }`}
            >
              {panel.cta.en}
            </p>
          </div>
        </div>

        {/* MÓDULO 4 · contacto y QR sobre gris muy transparente. */}
        <div
          className={`${GLASS_BASE} flex flex-wrap items-stretch gap-3 p-3`}
          style={{ backgroundColor: GLASS.gray }}
        >
          <div className="flex min-w-[200px] flex-1 flex-col justify-center">
            <p
              className={`truncate font-black leading-none tracking-tight text-white ${TEXT_SHADOW} ${
                large ? "text-3xl md:text-4xl" : "text-xl md:text-2xl"
              }`}
            >
              {BUSINESS.web}
            </p>
            <p
              className={`mt-2.5 truncate font-black leading-tight text-white ${TEXT_SHADOW} ${
                large ? "text-2xl md:text-3xl" : "text-lg md:text-xl"
              }`}
            >
              WhatsApp {BUSINESS.whatsapp}
            </p>
            <p
              className={`truncate font-black leading-tight text-white ${TEXT_SHADOW} ${
                large ? "text-2xl md:text-3xl" : "text-lg md:text-xl"
              }`}
            >
              Tel. {BUSINESS.phone}
            </p>
            <p
              className={`mt-1 truncate font-semibold text-emerald-50/85 ${TEXT_SHADOW} ${
                large ? "text-base" : "text-xs md:text-sm"
              }`}
            >
              {BUSINESS.email}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-white/25 pt-3">
              {SOCIALS.map((social) => (
                <span
                  key={social.label}
                  title={`${social.label} ${social.handle}`}
                  className={`flex items-center justify-center rounded-full bg-white text-emerald-950 shadow-lg shadow-black/40 ${
                    large ? "h-11 w-11" : "h-9 w-9"
                  }`}
                >
                  <SocialMark path={social.path} className={large ? "h-6 w-6" : "h-5 w-5"} />
                </span>
              ))}
              <span
                className={`ml-1 truncate font-black uppercase tracking-[0.12em] text-white ${TEXT_SHADOW} ${
                  large ? "text-lg" : "text-sm"
                }`}
              >
                {BUSINESS.handle}
              </span>
            </div>
          </div>

          {/* El QR sí va opaco: sobre vidrio o foto sencillamente no escanea. */}
          <div className="mx-auto flex shrink-0 flex-col items-center gap-1.5 rounded-xl bg-white p-2.5 shadow-xl shadow-black/50">
            <QrCode className={large ? "h-48 w-48" : "h-36 w-36"} />
            <span
              className={`font-black uppercase leading-none tracking-[0.1em] text-emerald-950 ${
                large ? "text-sm" : "text-xs"
              }`}
            >
              Escanee &middot; Scan
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
