import { corollaBlockoutConfig } from "../corolla/source";
import {
  createBlockoutDimensionsM,
  createScaledBlockoutConfig,
} from "../shared/blockout-source-factory";
import type { CarBlockoutConfig } from "../shared/blockout-types";

export const teslaEvSourceSpecsM = {
  overallLength: 4.72,
  overallWidth: 1.85,
  visualHeight: 1.44,
  wheelbase: 2.88,
  frontOverhang: 0.84,
  rearOverhang: 1.0,
  wheelRadius: 0.345,
  wheelWidth: 0.235,
  trackHalfWidthMm: 842,
  wheelCenterZMm: 340,
} as const;

export const teslaEvDimensionsM = createBlockoutDimensionsM(teslaEvSourceSpecsM);

const scaledTeslaEvConfig = createScaledBlockoutConfig({
  base: corollaBlockoutConfig,
  dimensionsM: teslaEvDimensionsM,
  materialOverrides: {
    body: {
      roughness: 0.22,
      metalness: 0.2,
      clearcoat: 0.95,
      clearcoatRoughness: 0.06,
    },
    glass: {
      color: "#172b34",
      opacity: 0.58,
    },
    chrome: {
      color: "#dfe7ef",
      metalness: 0.7,
      roughness: 0.2,
    },
  },
  builderOverrides: {
    bodySideInsetMm: 28,
    bodyArchMidMinZ: 500,
    bodyArchMidBaseZ: 420,
    hoodCrownMm: 6,
    hoodEdgeDropMm: 2,
    roofCrownMm: 18,
    roofEdgeDropMm: 5,
    trunkCrownMm: 5,
    frontBumper: {
      cornerRetreatMm: 72,
      topShoulderSoftnessMm: 20,
      bottomShoulderSoftnessMm: 30,
      middleShoulderSoftnessMm: 10,
      crownMm: 5,
    },
  },
});

export const teslaEvBlockoutConfig = {
  ...scaledTeslaEvConfig,
  geometryMm: {
    ...scaledTeslaEvConfig.geometryMm,
    roofStations: [
      { x: 760, z: 1185, halfWidth: 790 },
      { x: 1340, z: 1365, halfWidth: 810 },
      { x: 2080, z: 1340, halfWidth: 800 },
      { x: 2860, z: 1055, halfWidth: 720 },
    ],
    trunkStations: [
      { x: 2860, z: 955, halfWidth: 735 },
      { x: 3300, z: 930, halfWidth: 700 },
      { x: 3680, z: 850, halfWidth: 640 },
    ],
    wheelCenterZ: teslaEvSourceSpecsM.wheelCenterZMm,
    wheelArchRadius: 430,
  },
  sceneMm: {
    ...scaledTeslaEvConfig.sceneMm,
    wheels: {
      ...scaledTeslaEvConfig.sceneMm.wheels,
      radius: teslaEvSourceSpecsM.wheelRadius * 1000,
      width: teslaEvSourceSpecsM.wheelWidth * 1000,
      centers: scaledTeslaEvConfig.sceneMm.wheels.centers.map((center) => ({
        ...center,
        y: Math.sign(center.y) * teslaEvSourceSpecsM.trackHalfWidthMm,
        z: teslaEvSourceSpecsM.wheelCenterZMm,
      })),
    },
    upperGrille: {
      center: { ...scaledTeslaEvConfig.sceneMm.upperGrille.center, z: 610 },
      halfWidth: 180,
      halfHeight: 5,
    },
    lowerIntake: {
      center: { ...scaledTeslaEvConfig.sceneMm.lowerIntake.center, z: 430 },
      halfTop: 260,
      halfBottom: 300,
      halfHeight: 18,
    },
    headlights: [
      { x: -830, y: -260, z: 640 },
      { x: -790, y: -610, z: 662 },
      { x: -640, y: -690, z: 638 },
      { x: -620, y: -630, z: 610 },
      { x: -760, y: -290, z: 600 },
    ],
    taillights: [
      { x: 3820, y: -260, z: 705 },
      { x: 3840, y: -580, z: 706 },
      { x: 3860, y: -620, z: 678 },
      { x: 3820, y: -280, z: 665 },
    ],
    badge: {
      center: { ...scaledTeslaEvConfig.sceneMm.badge.center, z: 622 },
      halfWidth: 22,
      halfHeight: 28,
    },
    sideDetails: {
      ...scaledTeslaEvConfig.sceneMm.sideDetails,
      render: {
        ...scaledTeslaEvConfig.sceneMm.sideDetails.render,
        handleLengthMm: 110,
        handleHeightMm: 14,
        handleDepthMm: 8,
        beltlineHeightMm: 5,
      },
      handles: [
        { x: 1260, z: 780 },
        { x: 2220, z: 785 },
      ],
      wheelWells: scaledTeslaEvConfig.sceneMm.sideDetails.wheelWells.map((well) => ({
        ...well,
        z: teslaEvSourceSpecsM.wheelCenterZMm,
        radius: 410,
      })),
    },
  },
} satisfies CarBlockoutConfig;
