import type { CarDesignSchema, CarParams } from "../../auto-types";
import type { RenderableCarPreset } from "../shared/blockout-types";
import {
  baseSedanVisualControls,
  createDerivedVehicleSchema,
} from "../shared/sedan-base";
import {
  teslaEvBlockoutConfig,
  teslaEvDimensionsM,
  teslaEvSourceSpecsM,
} from "./source";

export const teslaEvDesignSchema = createDerivedVehicleSchema({
  metadata: {
    id: "teslaEv",
    make: "Tesla-inspired",
    model: "Model Y-style EV",
    year: 2026,
    bodyStyle: "compact electric crossover fastback",
    sourceNote: "Approximate Model Y-inspired reusable EV source, not an official Tesla CAD scan.",
  },
  dimensions: {
    ...teslaEvDimensionsM,
    sourceMm: {
      length: teslaEvSourceSpecsM.overallLength * 1000,
      widthNoMirrors: teslaEvSourceSpecsM.overallWidth * 1000,
      height: teslaEvSourceSpecsM.visualHeight * 1000,
      wheelbase: teslaEvSourceSpecsM.wheelbase * 1000,
    },
    derivedRatios: {
      lengthToWidth: teslaEvSourceSpecsM.overallLength / teslaEvSourceSpecsM.overallWidth,
      lengthToHeight: teslaEvSourceSpecsM.overallLength / teslaEvSourceSpecsM.visualHeight,
      wheelbaseToLength: teslaEvSourceSpecsM.wheelbase / teslaEvSourceSpecsM.overallLength,
    },
  },
  silhouetteCurves: {
    roofHeight: 0.16,
    roofCurve: 1.08,
    bodyTaper: 0.14,
    sourceCurvesMm: {
      roofline: [
        { x: 1080, z: 1380 },
        { x: 1320, z: 1500 },
        { x: 1710, z: 1605 },
        { x: 2240, z: 1568 },
        { x: 2580, z: 1450 },
        { x: 2860, z: 1325 },
      ],
      beltline: [
        { x: 720, z: 940 },
        { x: 1260, z: 970 },
        { x: 1660, z: 1010 },
        { x: 2250, z: 1000 },
        { x: 2960, z: 1070 },
      ],
      rocker: [
        { x: -620, z: 330 },
        { x: 0, z: 330 },
        { x: 1600, z: 330 },
        { x: 2891, z: 342 },
        { x: 3700, z: 365 },
      ],
    },
  },
  wheelGeometry: {
    radius: teslaEvSourceSpecsM.wheelRadius,
    width: teslaEvSourceSpecsM.wheelWidth,
  },
}) satisfies CarDesignSchema;

export const teslaEvParams = {
  wheelbase: teslaEvSourceSpecsM.wheelbase,
  overallLength: teslaEvSourceSpecsM.overallLength,
  width: teslaEvSourceSpecsM.overallWidth,
  bodyHeight: teslaEvSourceSpecsM.visualHeight,
  roofHeight: 0.16,
  frontOverhang: teslaEvSourceSpecsM.frontOverhang,
  rearOverhang: teslaEvSourceSpecsM.rearOverhang,
  groundClearance: 0.17,
  wheelRadius: teslaEvSourceSpecsM.wheelRadius,
  wheelWidth: teslaEvSourceSpecsM.wheelWidth,
  bodyTaper: 0.14,
  roofCurve: 1.08,
  cabinLengthRatio: 0.72,
  frontLightHeight: 0.72,
  rearLightHeight: 0.85,
  hasFastback: true,
  bodyStyle: "teslaEv",
  scale: 1,
} satisfies CarParams;

export const teslaEvPreset = {
  name: "Model Y-style EV",
  params: teslaEvParams,
  designSchema: teslaEvDesignSchema,
  visualControls: baseSedanVisualControls,
  blockoutConfig: teslaEvBlockoutConfig,
  blockoutStyle: "teslaEv",
} satisfies RenderableCarPreset;
