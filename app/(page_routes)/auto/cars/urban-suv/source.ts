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
    roofStations: [
      { x: 700, z: 1320, halfWidth: 830 },
      { x: 1080, z: 1565, halfWidth: 850 },
      { x: 1780, z: 1600, halfWidth: 855 },
      { x: 2500, z: 1515, halfWidth: 830 },
      { x: 3000, z: 1320, halfWidth: 780 },
    ],
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
    glass: {
      windshield: {
        lowerLeft: { x: 640, y: -900, z: 980 },
        lowerRight: { x: 640, y: 900, z: 980 },
        upperLeft: { x: 700, y: -830, z: 1320 },
        upperRight: { x: 700, y: 830, z: 1320 },
      },
      rearGlass: {
        lowerLeft: { x: 3060, y: -780, z: 1040 },
        lowerRight: { x: 3060, y: 780, z: 1040 },
        upperLeft: { x: 3000, y: -780, z: 1320 },
        upperRight: { x: 3000, y: 780, z: 1320 },
      },
      sideWindows: [
        [
          { x: 680, y: -890, z: 990 },
          { x: 700, y: -830, z: 1320 },
          { x: 1460, y: -850, z: 1485 },
          { x: 1460, y: -895, z: 1020 },
        ],
        [
          { x: 1460, y: -895, z: 1020 },
          { x: 1460, y: -850, z: 1485 },
          { x: 2460, y: -820, z: 1460 },
          { x: 2700, y: -870, z: 1060 },
        ],
        [
          { x: 2460, y: -820, z: 1460 },
          { x: 3000, y: -780, z: 1320 },
          { x: 3060, y: -780, z: 1040 },
          { x: 2700, y: -870, z: 1060 },
        ],
      ],
    },
    pillars: {
      aPillar: {
        base: { x: 680, y: -890, z: 990 },
        top: { x: 700, y: -830, z: 1320 },
        thickness: 24,
      },
      bPillar: {
        base: { x: 1460, y: -895, z: 1020 },
        top: { x: 1460, y: -850, z: 1485 },
        thickness: 22,
      },
      cPillar: {
        base: { x: 2700, y: -870, z: 1060 },
        top: { x: 2460, y: -820, z: 1460 },
        thickness: 52,
      },
    },
    roofSeals: {
      windshieldHeader: [
        { x: 700, y: -830, z: 1320 },
        { x: 700, y: 830, z: 1320 },
        { x: 1080, y: 850, z: 1565 },
        { x: 1080, y: -850, z: 1565 },
      ],
      rearHeader: [
        { x: 3000, y: -780, z: 1320 },
        { x: 3000, y: 780, z: 1320 },
        { x: 2500, y: 830, z: 1515 },
        { x: 2500, y: -830, z: 1515 },
      ],
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
      seams: [
        { x: 680, zTop: 960, zBottom: 470 },
        { x: 1460, zTop: 1020, zBottom: 465 },
        { x: 2700, zTop: 1040, zBottom: 480 },
      ],
      handles: [
        { x: 1120, z: 925 },
        { x: 2100, z: 930 },
      ],
      beltline: [
        { x: 680, z: 960 },
        { x: 1460, z: 1020 },
        { x: 2100, z: 1025 },
        { x: 2700, z: 1040 },
        { x: 3060, z: 1040 },
      ],
      doorPanels: [
        {
          id: "front",
          xStart: 680,
          xEnd: 1460,
          zTopStart: 960,
          zTopEnd: 1020,
          zBottomStart: 470,
          zBottomEnd: 465,
          zMidStart: 710,
          zMidEnd: 730,
        },
        {
          id: "rear",
          xStart: 1460,
          xEnd: 2700,
          zTopStart: 1020,
          zTopEnd: 1040,
          zBottomStart: 465,
          zBottomEnd: 480,
          zMidStart: 730,
          zMidEnd: 745,
        },
      ],
      windowBaseFills: [
        {
          id: "front",
          lowerLeft: { x: 680, z: 960 },
          lowerRight: { x: 1460, z: 1020 },
          upperLeft: { x: 680, z: 990 },
          upperRight: { x: 1460, z: 1020 },
        },
        {
          id: "rear",
          lowerLeft: { x: 1460, z: 1020 },
          lowerRight: { x: 2700, z: 1040 },
          upperLeft: { x: 1460, z: 1020 },
          upperRight: { x: 2700, z: 1060 },
        },
      ],
      mirrors: [
        {
          base: { x: 720, z: 1015 },
          headCenter: { x: 680, z: 1060 },
          headSize: { x: 130, y: 72, z: 80 },
          stalkSize: { x: 84, y: 22, z: 26 },
        },
      ],
      wheelWells: scaledUrbanSuvConfig.sceneMm.sideDetails.wheelWells.map((well) => ({
        ...well,
        z: urbanSuvSourceSpecsM.wheelCenterZMm,
        radius: 455,
      })),
    },
  },
} satisfies CarBlockoutConfig;
