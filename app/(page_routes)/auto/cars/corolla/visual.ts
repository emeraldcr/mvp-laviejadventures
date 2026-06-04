import {
  corollaBaseDimensions,
} from "./visual-base";
import {
  corollaMaterials,
  corollaPaintSurface,
} from "./visual-materials";
import {
  corollaBodyShell,
  corollaBodyVolumes,
  corollaCharacterLines,
  corollaLightingProfile,
  corollaMotionProfile,
  corollaSmallParts,
  corollaWheelProfile,
  corollaWindowProfile,
} from "./visual-layout";

export {
  corollaBaseDimensions,
  corollaVisualDerived,
  corollaVisualParams,
} from "./visual-base";
export {
  corollaMaterials,
  corollaPaintSurface,
} from "./visual-materials";
export {
  corollaBodyShell,
  corollaBodyVolumes,
  corollaCharacterLines,
  corollaLightingProfile,
  corollaMotionProfile,
  corollaSmallParts,
  corollaWheelProfile,
  corollaWindowProfile,
} from "./visual-layout";

export const corollaVisualControls = {
  baseDimensions: corollaBaseDimensions,
  paintSurface: corollaPaintSurface,
  materials: corollaMaterials,
  bodyVolumes: corollaBodyVolumes,
  bodyShell: corollaBodyShell,
  windows: corollaWindowProfile,
  characterLines: corollaCharacterLines,
  lighting: corollaLightingProfile,
  smallParts: corollaSmallParts,
  wheels: corollaWheelProfile,
  motion: corollaMotionProfile,
} as const;
