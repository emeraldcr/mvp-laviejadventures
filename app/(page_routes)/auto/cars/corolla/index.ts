import type { CarParams } from "../../auto-types";
import type { RenderableCarPreset } from "../shared/blockout-types";
import { baseBlockoutVisualControls } from "../shared/blockout-visuals";
import { corollaBlockoutConfig, corollaDesignSchema } from "./source";

export { carDesignSchema, corollaDesignSchema } from "./source";

export const corollaParams = {
  wheelbase: Number(corollaDesignSchema.dimensions.wheelbase),
  overallLength: Number(corollaDesignSchema.dimensions.overallLength),
  width: Number(corollaDesignSchema.dimensions.width),
  bodyHeight: Number(corollaDesignSchema.dimensions.visualHeight),
  roofHeight: Number(corollaDesignSchema.silhouetteCurves.roofHeight),
  frontOverhang: Number(corollaDesignSchema.dimensions.frontOverhang),
  rearOverhang: Number(corollaDesignSchema.dimensions.rearOverhang),
  groundClearance: Number(corollaDesignSchema.dimensions.groundClearance),
  wheelRadius: Number(corollaDesignSchema.wheelGeometry.radius),
  wheelWidth: Number(corollaDesignSchema.wheelGeometry.width),
  bodyTaper: Number(corollaDesignSchema.silhouetteCurves.bodyTaper),
  roofCurve: Number(corollaDesignSchema.silhouetteCurves.roofCurve),
  cabinLengthRatio: Number(corollaDesignSchema.dimensions.cabinLengthRatio),
  frontLightHeight: Number(corollaDesignSchema.headlights.centerY),
  rearLightHeight: Number(corollaDesignSchema.taillights.centerY),
  hasFastback: false,
  scale: Number(corollaDesignSchema.coordinateSystem.scale),
} satisfies CarParams;

export const corollaPreset = {
  name: `${corollaDesignSchema.metadata.make} ${corollaDesignSchema.metadata.model} ${corollaDesignSchema.metadata.year}`,
  params: corollaParams,
  designSchema: corollaDesignSchema,
  visualControls: baseBlockoutVisualControls,
  blockoutConfig: corollaBlockoutConfig,
  blockoutStyle: "sedan",
} satisfies RenderableCarPreset;
