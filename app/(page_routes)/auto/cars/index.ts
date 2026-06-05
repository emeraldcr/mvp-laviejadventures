import { corollaPreset } from "./corolla";
import { civic90FgPreset } from "./honda-civic-90-fg";
import { adventureTruckPreset } from "./adventure-truck";
import { teslaEvPreset } from "./tesla-ev";
import { urbanSuvPreset } from "./urban-suv";
import type { RenderableCarPreset } from "./shared/blockout-types";

export const carPresets = {
  corollaSedan: corollaPreset,
  hondaCivic90Fg: civic90FgPreset,
  urbanSuv: urbanSuvPreset,
  adventureTruck: adventureTruckPreset,
  teslaEv: teslaEvPreset,
} satisfies Record<string, RenderableCarPreset>;

export type CarPresetId = keyof typeof carPresets;
