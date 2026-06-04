import { corollaPreset } from "./corolla";
import { civic90FgPreset } from "./honda-civic-90-fg";

export const carPresets = {
  corollaSedan: corollaPreset,
  hondaCivic90Fg: civic90FgPreset,
};

export type CarPresetId = keyof typeof carPresets;
