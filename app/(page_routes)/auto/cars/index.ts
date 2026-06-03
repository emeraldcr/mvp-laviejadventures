import { corollaPreset } from "./corolla";

export const carPresets = {
  corollaSedan: corollaPreset,
};

export type CarPresetId = keyof typeof carPresets;
