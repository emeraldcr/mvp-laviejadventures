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
    sourceCurvesMm: {
      roofline: [
        { x: 700, z: 1320 },
        { x: 1080, z: 1565 },
        { x: 1780, z: 1600 },
        { x: 2500, z: 1515 },
        { x: 3000, z: 1320 },
      ],
      beltline: [
        { x: 680, z: 960 },
        { x: 1460, z: 1020 },
        { x: 2100, z: 1025 },
        { x: 2700, z: 1040 },
        { x: 3060, z: 1040 },
      ],
      rocker: [
        { x: -620, z: 340 },
        { x: 0, z: 340 },
        { x: 1460, z: 340 },
        { x: 2660, z: 350 },
        { x: 3600, z: 365 },
      ],
    },
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
