import type { CarDesignSchema, CarParams } from "../../auto-types";
import type { RenderableCarPreset } from "../shared/blockout-types";
import {
  baseSedanVisualControls,
  createDerivedVehicleSchema,
} from "../shared/sedan-base";
import {
  urbanSuvBlockoutConfig,
  urbanSuvDimensionsM,
  urbanSuvSourceSpecsM,
} from "./source";

export const urbanSuvDesignSchema = createDerivedVehicleSchema({
  metadata: {
    id: "urbanSuv",
    make: "Reusable",
    model: "Urban SUV",
    year: 2026,
    bodyStyle: "compact SUV",
    sourceNote: "Approximate reusable SUV source derived from shared blockout math, not an official CAD scan.",
  },
  dimensions: {
    ...urbanSuvDimensionsM,
    sourceMm: {
      length: urbanSuvSourceSpecsM.overallLength * 1000,
      widthNoMirrors: urbanSuvSourceSpecsM.overallWidth * 1000,
      height: urbanSuvSourceSpecsM.visualHeight * 1000,
      wheelbase: urbanSuvSourceSpecsM.wheelbase * 1000,
    },
    derivedRatios: {
      lengthToWidth: urbanSuvSourceSpecsM.overallLength / urbanSuvSourceSpecsM.overallWidth,
      lengthToHeight: urbanSuvSourceSpecsM.overallLength / urbanSuvSourceSpecsM.visualHeight,
      wheelbaseToLength: urbanSuvSourceSpecsM.wheelbase / urbanSuvSourceSpecsM.overallLength,
    },
  },
  silhouetteCurves: {
    roofHeight: 0.14,
    roofCurve: 1.02,
    bodyTaper: 0.28,
  },
  wheelGeometry: {
    radius: urbanSuvSourceSpecsM.wheelRadius,
    width: urbanSuvSourceSpecsM.wheelWidth,
  },
}) satisfies CarDesignSchema;

export const urbanSuvParams = {
  wheelbase: urbanSuvSourceSpecsM.wheelbase,
  overallLength: urbanSuvSourceSpecsM.overallLength,
  width: urbanSuvSourceSpecsM.overallWidth,
  bodyHeight: urbanSuvSourceSpecsM.visualHeight,
  roofHeight: 0.14,
  frontOverhang: urbanSuvSourceSpecsM.frontOverhang,
  rearOverhang: urbanSuvSourceSpecsM.rearOverhang,
  groundClearance: 0.19,
  wheelRadius: urbanSuvSourceSpecsM.wheelRadius,
  wheelWidth: urbanSuvSourceSpecsM.wheelWidth,
  bodyTaper: 0.28,
  roofCurve: 1.02,
  cabinLengthRatio: 0.66,
  frontLightHeight: 0.72,
  rearLightHeight: 0.78,
  hasFastback: false,
  bodyStyle: "suv",
  scale: 1,
} satisfies CarParams;

export const urbanSuvPreset = {
  name: "Urban SUV",
  params: urbanSuvParams,
  designSchema: urbanSuvDesignSchema,
  visualControls: baseSedanVisualControls,
  blockoutConfig: urbanSuvBlockoutConfig,
  blockoutStyle: "suv",
} satisfies RenderableCarPreset;
