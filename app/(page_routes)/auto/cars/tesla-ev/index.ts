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
    make: "Reusable",
    model: "Tesla-style EV",
    year: 2026,
    bodyStyle: "smooth EV fastback sedan",
    sourceNote: "Approximate Tesla-inspired reusable EV source, not an official Tesla CAD scan.",
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
    roofHeight: 0.09,
    roofCurve: 1.34,
    bodyTaper: 0.2,
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
  roofHeight: 0.09,
  frontOverhang: teslaEvSourceSpecsM.frontOverhang,
  rearOverhang: teslaEvSourceSpecsM.rearOverhang,
  groundClearance: 0.14,
  wheelRadius: teslaEvSourceSpecsM.wheelRadius,
  wheelWidth: teslaEvSourceSpecsM.wheelWidth,
  bodyTaper: 0.2,
  roofCurve: 1.34,
  cabinLengthRatio: 0.7,
  frontLightHeight: 0.64,
  rearLightHeight: 0.72,
  hasFastback: true,
  bodyStyle: "teslaEv",
  scale: 1,
} satisfies CarParams;

export const teslaEvPreset = {
  name: "Tesla-style EV",
  params: teslaEvParams,
  designSchema: teslaEvDesignSchema,
  visualControls: baseSedanVisualControls,
  blockoutConfig: teslaEvBlockoutConfig,
  blockoutStyle: "teslaEv",
} satisfies RenderableCarPreset;
