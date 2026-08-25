import Image from "next/image";
import EditableSignCanvas from "../rotulos/layout-editor/EditableSignCanvas";
import MovableGroup from "../rotulos/layout-editor/MovableGroup";
import QrCode from "../rotulos/QrCode";
import SocialMark from "../rotulos/SocialMark";
import { BUSINESS, GLASS_BASE, SOCIALS, TEXT_SHADOW } from "../rotulos/constants";
import { LeafShape } from "../rotulos/SignChrome";
import type { Flyer } from "./types";

type FlyerPanelProps = {
  flyer: Flyer;
  /** Solo la primera tarjeta de la página: evita el aviso de LCP. */
  eager?: boolean;
};

const FEATURED_SOCIALS = SOCIALS.slice(0, 2);

/**
 * Publicación cuadrada tipo Instagram: foto a sangre, degradado para
 * legibilidad y los mismos objetos movibles que un rótulo de carretera,
 * pero pensados para leerse en un feed, no desde un carro a 60 km/h.
 */
export default function FlyerPanel({ flyer, eager }: FlyerPanelProps) {
  const Icon = flyer.icon;

  return (
    <div data-flyer-artwork className="relative w-full">
      <div className="mx-auto w-full max-w-[560px] drop-shadow-[0_28px_45px_rgba(0,0,0,0.5)]">
        <EditableSignCanvas
          panelId={flyer.layoutId}
          revision={1}
          label={{ es: flyer.title, en: flyer.titleEn }}
          className="relative isolate flex aspect-square w-full flex-col overflow-hidden rounded-[22px] border-[6px] border-white bg-[#2E2A25] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.08)]"
        >
          <Image
            src={flyer.photo}
            alt=""
            fill
            sizes="(max-width: 768px) 92vw, 560px"
            priority={eager}
            className="object-cover saturate-[1.05]"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/92 via-black/25 to-black/55" />
          <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.1]">
            <LeafShape className="absolute -right-6 -top-6 h-28 w-24 rotate-[18deg] text-white" />
          </div>

          <div className="relative z-10 flex items-start justify-between gap-3 p-4 sm:p-5">
            <MovableGroup
              groupId="kicker"
              label={{ es: "Encabezado", en: "Eyebrow" }}
              className="flex w-fit max-w-[72%] items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] shadow-lg sm:text-xs"
              style={{ backgroundColor: flyer.accent.bg, color: flyer.accent.text }}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={2.5} aria-hidden />
              <span className="truncate">{flyer.kicker}</span>
            </MovableGroup>

            <MovableGroup
              groupId="logo"
              label={{ es: "Logo", en: "Logo" }}
              className={`shrink-0 p-1.5 ${GLASS_BASE} bg-[rgba(24,24,27,0.45)]`}
            >
              <Image
                src="/logo1.jpg"
                alt="La Vieja Adventures"
                width={64}
                height={64}
                className="h-9 w-9 rounded-md object-contain sm:h-10 sm:w-10"
              />
            </MovableGroup>
          </div>

          <div className="relative z-10 mt-auto flex flex-col gap-3 p-4 sm:gap-4 sm:p-6">
            <MovableGroup
              groupId="copy"
              label={{ es: "Título y detalles", en: "Title and details" }}
              className="w-fit max-w-full [container-type:inline-size]"
            >
              <p className="text-[clamp(1.7rem,8.5cqw,3.2rem)] font-black uppercase leading-[0.92] tracking-[-0.03em] text-white drop-shadow-[0_3px_10px_rgba(0,0,0,0.7)]">
                {flyer.title}
              </p>
              <p className="mt-1.5 text-[clamp(0.7rem,2.6cqw,1rem)] font-bold uppercase tracking-[0.1em] text-white/80">
                {flyer.titleEn}
              </p>
              <p className="mt-2.5 max-w-[92%] text-[clamp(0.78rem,3cqw,1.05rem)] font-bold leading-snug text-white/95">
                {flyer.subtitle}
              </p>
            </MovableGroup>

            <div className="flex items-end justify-between gap-3">
              <MovableGroup
                groupId="cta"
                label={{ es: "Llamado a la acción", en: "Call to action" }}
                className="w-fit max-w-full px-4 py-2.5 text-sm font-black uppercase tracking-[0.03em] shadow-[0_14px_28px_-14px_rgba(0,0,0,0.85)] sm:text-base"
                style={{ backgroundColor: flyer.accent.bg, color: flyer.accent.text }}
              >
                {flyer.cta.es}
                <span className="ml-1.5 font-bold normal-case opacity-80">· {flyer.cta.en}</span>
              </MovableGroup>

              {flyer.showQr ? (
                <MovableGroup
                  groupId="qr"
                  label={{ es: "Código QR", en: "QR code" }}
                  className="w-fit shrink-0 bg-white p-1.5 shadow-xl shadow-black/40"
                >
                  <QrCode className="h-14 w-14 sm:h-16 sm:w-16" />
                </MovableGroup>
              ) : null}
            </div>

            <MovableGroup
              groupId="footer"
              label={{ es: "Contacto y redes", en: "Contact and social" }}
              className="flex w-full items-center justify-between gap-3 border-t border-white/25 pt-3"
            >
              <span
                className={`truncate text-[11px] font-black uppercase tracking-[0.08em] text-white sm:text-xs ${TEXT_SHADOW}`}
              >
                {BUSINESS.handle}
              </span>
              <div className="flex shrink-0 items-center gap-2">
                {FEATURED_SOCIALS.map((social) => (
                  <SocialMark
                    key={social.label}
                    path={social.path}
                    className={`h-4 w-4 text-white/90 ${TEXT_SHADOW}`}
                  />
                ))}
              </div>
            </MovableGroup>
          </div>
        </EditableSignCanvas>
      </div>
    </div>
  );
}
