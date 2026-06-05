import { corollaBlockoutConfig } from "../corolla/source";
import {
  createBlockoutDimensionsM,
  createScaledBlockoutConfig,
} from "../shared/blockout-source-factory";
import type { CarBlockoutConfig } from "../shared/blockout-types";

export const urbanSuvSourceSpecsM = {
  overallLength: 4.55,
  overallWidth: 1.86,
  visualHeight: 1.68,
  wheelbase: 2.66,
  frontOverhang: 0.86,
  rearOverhang: 1.03,
  wheelRadius: 0.365,
  wheelWidth: 0.225,
  trackHalfWidthMm: 845,
  wheelCenterZMm: 365,
} as const;

export const urbanSuvDimensionsM = createBlockoutDimensionsM(urbanSuvSourceSpecsM);

const scaledUrbanSuvConfig = createScaledBlockoutConfig({
  base: corollaBlockoutConfig,
  dimensionsM: urbanSuvDimensionsM,
  materialOverrides: {
    body: {
      roughness: 0.3,
      metalness: 0.16,
    },
    wheelWell: {
      color: "#101419",
      roughness: 0.78,
    },
  },
  builderOverrides: {
    bodySideInsetMm: 42,
    bodyArchMidMinZ: 560,
    bodyArchMidBaseZ: 455,
    bodyArchTopGapMm: 26,
    hoodCrownMm: 8,
    roofCrownMm: 14,
    trunkCrownMm: 2,
    frontBumper: {
      cornerRetreatMm: 58,
      topShoulderSoftnessMm: 14,
      bottomShoulderSoftnessMm: 22,
    },
  },
});

export const urbanSuvBlockoutConfig = {
  ...scaledUrbanSuvConfig,
  geometryMm: {
    ...scaledUrbanSuvConfig.geometryMm,
    wheelCenterZ: urbanSuvSourceSpecsM.wheelCenterZMm,
    wheelArchRadius: 470,
  },
  sceneMm: {
    ...scaledUrbanSuvConfig.sceneMm,
    wheels: {
      ...scaledUrbanSuvConfig.sceneMm.wheels,
      radius: urbanSuvSourceSpecsM.wheelRadius * 1000,
      width: urbanSuvSourceSpecsM.wheelWidth * 1000,
      centers: scaledUrbanSuvConfig.sceneMm.wheels.centers.map((center) => ({
        ...center,
        y: Math.sign(center.y) * urbanSuvSourceSpecsM.trackHalfWidthMm,
        z: urbanSuvSourceSpecsM.wheelCenterZMm,
      })),
    },
    upperGrille: {
      center: { ...scaledUrbanSuvConfig.sceneMm.upperGrille.center, z: 710 },
      halfWidth: 560,
      halfHeight: 22,
    },
    lowerIntake: {
      center: { ...scaledUrbanSuvConfig.sceneMm.lowerIntake.center, z: 520 },
      halfTop: 520,
      halfBottom: 565,
      halfHeight: 62,
    },
    sideDetails: {
      ...scaledUrbanSuvConfig.sceneMm.sideDetails,
      wheelWells: scaledUrbanSuvConfig.sceneMm.sideDetails.wheelWells.map((well) => ({
        ...well,
        z: urbanSuvSourceSpecsM.wheelCenterZMm,
        radius: 455,
      })),
    },
  },
} satisfies CarBlockoutConfig;
