import type { CarDesignSchema, CarParams, CarPreset } from "../../auto-types";
import {
  baseSedanDesignSchema,
  baseSedanVisualControls,
  createDerivedSedanSchema,
} from "../shared/sedan-base";

const civicDimensions = {
  overallLength: 3.75,
  width: 1.675,
  visualHeight: 1.24,
  wheelbase: 2.35,
  frontOverhang: 0.62,
  rearOverhang: 0.52,
  groundClearance: 0.1,
  cabinLengthRatio: 0.58,
} as const;

export const civic90FgDesignSchema = createDerivedSedanSchema({
  metadata: {
    id: "hondaCivic90Fg",
    make: "Honda",
    model: "Civic",
    year: 1990,
    generation: "EF-inspired FG project",
    bodyStyle: "compact 2-door boxy sedan/hatchback",
    sourceNote: "Shared blockout renderer reuse with approximate 1990 EF Civic-inspired proportions.",
  },
  dimensions: {
    ...civicDimensions,
    sourceMm: {
      length: 3750,
      widthNoMirrors: 1675,
      height: 1240,
      wheelbase: 2350,
      frontTrack: 1450,
      rearTrack: 1455,
      groundClearanceNominal: 100,
      groundClearanceMin: 90,
      groundClearanceMax: 115,
    },
    derivedRatios: {
      lengthToWidth: civicDimensions.overallLength / civicDimensions.width,
      lengthToHeight: civicDimensions.overallLength / civicDimensions.visualHeight,
      wheelbaseToLength: civicDimensions.wheelbase / civicDimensions.overallLength,
    },
  },
  silhouetteCurves: {
    roofHeight: 0.065,
    roofCurve: 1.06,
    bodyTaper: 0.42,
  },
  wheelGeometry: {
    radius: 0.318,
    width: 0.185,
  },
}) satisfies CarDesignSchema;

export const civic90FgParams = {
  wheelbase: civicDimensions.wheelbase,
  overallLength: civicDimensions.overallLength,
  width: civicDimensions.width,
  bodyHeight: civicDimensions.visualHeight,
  roofHeight: Number(civic90FgDesignSchema.silhouetteCurves.roofHeight),
  frontOverhang: civicDimensions.frontOverhang,
  rearOverhang: civicDimensions.rearOverhang,
  groundClearance: civicDimensions.groundClearance,
  wheelRadius: Number(civic90FgDesignSchema.wheelGeometry.radius),
  wheelWidth: Number(civic90FgDesignSchema.wheelGeometry.width),
  bodyTaper: Number(civic90FgDesignSchema.silhouetteCurves.bodyTaper),
  roofCurve: Number(civic90FgDesignSchema.silhouetteCurves.roofCurve),
  cabinLengthRatio: civicDimensions.cabinLengthRatio,
  frontLightHeight: Number(baseSedanDesignSchema.headlights.centerY),
  rearLightHeight: Number(baseSedanDesignSchema.taillights.centerY),
  hasFastback: false,
  bodyStyle: "boxyCompact",
  scale: Number(civic90FgDesignSchema.coordinateSystem.scale),
} satisfies CarParams;

export const civic90FgPreset = {
  name: "Honda Civic 90 FG",
  params: civic90FgParams,
  designSchema: civic90FgDesignSchema,
  visualControls: baseSedanVisualControls,
} satisfies CarPreset;
