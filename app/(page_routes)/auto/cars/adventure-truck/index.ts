import type { CarDesignSchema, CarParams } from "../../auto-types";
import type { RenderableCarPreset } from "../shared/blockout-types";
import {
  baseSedanVisualControls,
  createDerivedVehicleSchema,
} from "../shared/sedan-base";
import {
  adventureTruckBlockoutConfig,
  adventureTruckDimensionsM,
  adventureTruckSourceSpecsM,
} from "./source";

export const adventureTruckDesignSchema = createDerivedVehicleSchema({
  metadata: {
    id: "adventureTruck",
    make: "Reusable",
    model: "Adventure Truck",
    year: 2026,
    bodyStyle: "crew-cab pickup truck",
    sourceNote: "Approximate reusable truck source with cabin/bed blockout separation, not an official CAD scan.",
  },
  dimensions: {
    ...adventureTruckDimensionsM,
    sourceMm: {
      length: adventureTruckSourceSpecsM.overallLength * 1000,
      widthNoMirrors: adventureTruckSourceSpecsM.overallWidth * 1000,
      height: adventureTruckSourceSpecsM.visualHeight * 1000,
      wheelbase: adventureTruckSourceSpecsM.wheelbase * 1000,
    },
    derivedRatios: {
      lengthToWidth: adventureTruckSourceSpecsM.overallLength / adventureTruckSourceSpecsM.overallWidth,
      lengthToHeight: adventureTruckSourceSpecsM.overallLength / adventureTruckSourceSpecsM.visualHeight,
      wheelbaseToLength: adventureTruckSourceSpecsM.wheelbase / adventureTruckSourceSpecsM.overallLength,
    },
  },
  silhouetteCurves: {
    roofHeight: 0.16,
    roofCurve: 0.94,
    bodyTaper: 0.22,
  },
  wheelGeometry: {
    radius: adventureTruckSourceSpecsM.wheelRadius,
    width: adventureTruckSourceSpecsM.wheelWidth,
  },
}) satisfies CarDesignSchema;

export const adventureTruckParams = {
  wheelbase: adventureTruckSourceSpecsM.wheelbase,
  overallLength: adventureTruckSourceSpecsM.overallLength,
  width: adventureTruckSourceSpecsM.overallWidth,
  bodyHeight: adventureTruckSourceSpecsM.visualHeight,
  roofHeight: 0.16,
  frontOverhang: adventureTruckSourceSpecsM.frontOverhang,
  rearOverhang: adventureTruckSourceSpecsM.rearOverhang,
  groundClearance: 0.22,
  wheelRadius: adventureTruckSourceSpecsM.wheelRadius,
  wheelWidth: adventureTruckSourceSpecsM.wheelWidth,
  bodyTaper: 0.22,
  roofCurve: 0.94,
  cabinLengthRatio: 0.54,
  frontLightHeight: 0.76,
  rearLightHeight: 0.74,
  hasFastback: false,
  bodyStyle: "truck",
  scale: 1,
} satisfies CarParams;

export const adventureTruckPreset = {
  name: "Adventure Truck",
  params: adventureTruckParams,
  designSchema: adventureTruckDesignSchema,
  visualControls: baseSedanVisualControls,
  blockoutConfig: adventureTruckBlockoutConfig,
  blockoutStyle: "truck",
} satisfies RenderableCarPreset;
