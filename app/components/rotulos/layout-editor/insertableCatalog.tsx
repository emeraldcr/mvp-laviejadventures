import type { LucideIcon } from "lucide-react";

import { ARROWS, PICTOGRAMS } from "../constants";
import type {
  AddedCanvasElement,
  AddedTextStyle,
  InsertableIconKey,
  Lang,
} from "./types";

export type InsertableOptionLabel = Readonly<{
  es: string;
  en: string;
}>;

export const INSERTABLE_ICON_OPTIONS = [
  { key: "canon", label: { es: "Cañón", en: "Canyon" } },
  { key: "cascada", label: { es: "Cascada", en: "Waterfall" } },
  { key: "rio", label: { es: "Río", en: "River" } },
  { key: "comida", label: { es: "Restaurante", en: "Restaurant" } },
  { key: "parqueo", label: { es: "Parqueo", en: "Parking" } },
  { key: "mirador", label: { es: "Mirador", en: "Lookout" } },
  { key: "sendero", label: { es: "Sendero", en: "Trail" } },
  { key: "wifi", label: { es: "Wi-Fi", en: "Wi-Fi" } },
  { key: "banos", label: { es: "Baños", en: "Restrooms" } },
  { key: "arrow-left", label: { es: "Flecha izquierda", en: "Left arrow" } },
  { key: "arrow-right", label: { es: "Flecha derecha", en: "Right arrow" } },
  { key: "arrow-down-right", label: { es: "Flecha abajo a la derecha", en: "Down-right arrow" } },
] as const satisfies ReadonlyArray<{
  key: InsertableIconKey;
  label: InsertableOptionLabel;
}>;

export const TEXT_STYLE_OPTIONS = [
  { key: "title", label: { es: "Título", en: "Title" } },
  { key: "subtitle", label: { es: "Subtítulo", en: "Subtitle" } },
  { key: "label", label: { es: "Etiqueta", en: "Label" } },
  { key: "cta", label: { es: "Llamado a la acción", en: "Call to action" } },
] as const satisfies ReadonlyArray<{
  key: AddedTextStyle;
  label: InsertableOptionLabel;
}>;

const INSERTABLE_ICONS: Record<InsertableIconKey, LucideIcon> = {
  canon: PICTOGRAMS.canon,
  cascada: PICTOGRAMS.cascada,
  rio: PICTOGRAMS.rio,
  comida: PICTOGRAMS.comida,
  parqueo: PICTOGRAMS.parqueo,
  mirador: PICTOGRAMS.mirador,
  sendero: PICTOGRAMS.sendero,
  wifi: PICTOGRAMS.wifi,
  banos: PICTOGRAMS.banos,
  "arrow-left": ARROWS.left,
  "arrow-right": ARROWS.right,
  "arrow-down-right": ARROWS["down-right"],
};

export function localizeInsertableLabel(label: InsertableOptionLabel, lang: Lang): string {
  return label[lang];
}

/** Etiqueta estable para el selector, el foco de teclado y los avisos del editor. */
export function getInsertedElementLabel(element: AddedCanvasElement): InsertableOptionLabel {
  if (element.kind === "icon") {
    return (
      INSERTABLE_ICON_OPTIONS.find((option) => option.key === element.icon)?.label ?? {
        es: "Ícono agregado",
        en: "Added icon",
      }
    );
  }

  const styleLabel =
    TEXT_STYLE_OPTIONS.find((option) => option.key === element.style)?.label ??
    ({ es: "Texto", en: "Text" } as const);

  return {
    es: `${styleLabel.es}: ${element.text}`,
    en: `${styleLabel.en}: ${element.text}`,
  };
}

type InsertedElementArtworkProps = {
  element: AddedCanvasElement;
  textOverride?: string;
};

/**
 * Arte puro de un elemento creado desde el editor. Movimiento, tamaño y
 * selección pertenecen al lienzo para que este componente también sirva en
 * impresión y en miniaturas sin arrastrar estado interactivo.
 */
export function InsertedElementArtwork({
  element,
  textOverride,
}: InsertedElementArtworkProps) {
  if (element.kind === "icon") {
    const Icon = INSERTABLE_ICONS[element.icon];

    return (
      <span className="flex h-24 w-24 items-center justify-center rounded-2xl border-2 border-[#00C4B0] bg-[#2E2A25] p-4 text-[#00C4B0] shadow-[0_12px_24px_-12px_rgba(0,0,0,0.8)]">
        <Icon className="h-full w-full" strokeWidth={2.6} aria-hidden />
      </span>
    );
  }

  const text = textOverride ?? element.text;

  if (element.style === "title") {
    return (
      <span className="block max-w-[28rem] whitespace-pre-wrap break-words font-display text-5xl font-black uppercase leading-[0.82] tracking-[-0.055em] text-white drop-shadow-[0_3px_7px_rgba(0,0,0,0.78)]">
        {text}
      </span>
    );
  }

  if (element.style === "subtitle") {
    return (
      <span className="block max-w-[28rem] whitespace-pre-wrap break-words text-2xl font-black uppercase leading-tight tracking-[0.08em] text-white drop-shadow-[0_2px_5px_rgba(0,0,0,0.78)]">
        {text}
      </span>
    );
  }

  if (element.style === "label") {
    return (
      <span className="inline-flex max-w-[24rem] whitespace-pre-wrap break-words rounded-md bg-[#00C4B0] px-4 py-2 text-base font-black uppercase leading-tight tracking-[0.14em] text-[#17332F] shadow-[0_8px_18px_-10px_rgba(0,0,0,0.75)]">
        {text}
      </span>
    );
  }

  return (
    <span className="inline-flex max-w-[28rem] whitespace-pre-wrap break-words bg-[#F5C518] px-5 py-3 font-display text-2xl font-black uppercase leading-none tracking-[-0.02em] text-[#2E2A25] shadow-[inset_0_2px_0_rgba(255,255,255,0.4),0_10px_20px_-12px_rgba(0,0,0,0.8)]">
      {text}
    </span>
  );
}
