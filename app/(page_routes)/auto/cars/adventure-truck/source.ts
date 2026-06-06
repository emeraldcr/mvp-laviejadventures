import { corollaBlockoutConfig } from "../corolla/source";
import {
  createBlockoutDimensionsM,
  createScaledBlockoutConfig,
} from "../shared/blockout-source-factory";
import type { CarBlockoutConfig } from "../shared/blockout-types";

export const adventureTruckSourceSpecsM = {
  overallLength: 5.35,
  overallWidth: 1.95,
  visualHeight: 1.83,
  wheelbase: 3.22,
  frontOverhang: 0.93,
  rearOverhang: 1.2,
  wheelRadius: 0.385,
  wheelWidth: 0.255,
  trackHalfWidthMm: 905,
  wheelCenterZMm: 385,
} as const;

export const adventureTruckDimensionsM = createBlockoutDimensionsM(adventureTruckSourceSpecsM);

const scaledTruckConfig = createScaledBlockoutConfig({
  base: corollaBlockoutConfig,
  dimensionsM: adventureTruckDimensionsM,
  materialOverrides: {
    body: {
      roughness: 0.36,
      metalness: 0.12,
    },
    tire: {
      roughness: 0.74,
    },
    wheelWell: {
      color: "#0b0f14",
      roughness: 0.82,
    },
  },
  builderOverrides: {
    bodySideInsetMm: 58,
    bodyArchMidMinZ: 590,
    bodyArchMidBaseZ: 480,
    bodyArchTopGapMm: 30,
    hoodCrownMm: 6,
    roofCrownMm: 8,
    trunkCrownMm: 0,
    trunkEdgeDropMm: 2,
    trunkSideDropMm: 22,
    trunkRearDropMm: 20,
    frontBumper: {
      cornerRetreatMm: 46,
      topShoulderSoftnessMm: 12,
      bottomShoulderSoftnessMm: 18,
    },
  },
});

export const adventureTruckBlockoutConfig = {
  ...scaledTruckConfig,
  geometryMm: {
    ...scaledTruckConfig.geometryMm,
    roofStations: [
      { x: 760, z: 1438, halfWidth: 815 },
      { x: 1040, z: 1548, halfWidth: 835 },
      { x: 1660, z: 1552, halfWidth: 835 },
      { x: 2045, z: 1430, halfWidth: 780 },
    ],
    trunkStations: [
      { x: 2320, z: 940, halfWidth: 875 },
      { x: 3300, z: 915, halfWidth: 895 },
      { x: 4300, z: 880, halfWidth: 830 },
    ],
    wheelCenterZ: adventureTruckSourceSpecsM.wheelCenterZMm,
    wheelArchRadius: 505,
  },
  sceneMm: {
    ...scaledTruckConfig.sceneMm,
    wheels: {
      ...scaledTruckConfig.sceneMm.wheels,
      radius: adventureTruckSourceSpecsM.wheelRadius * 1000,
      width: adventureTruckSourceSpecsM.wheelWidth * 1000,
      centers: scaledTruckConfig.sceneMm.wheels.centers.map((center) => ({
        ...center,
        y: Math.sign(center.y) * adventureTruckSourceSpecsM.trackHalfWidthMm,
        z: adventureTruckSourceSpecsM.wheelCenterZMm,
      })),
    },
    glass: {
      windshield: {
        lowerLeft: { x: 650, y: -880, z: 930 },
        lowerRight: { x: 650, y: 880, z: 930 },
        upperLeft: { x: 760, y: -815, z: 1438 },
        upperRight: { x: 760, y: 815, z: 1438 },
      },
      rearGlass: {
        lowerLeft: { x: 2180, y: -815, z: 990 },
        lowerRight: { x: 2180, y: 815, z: 990 },
        upperLeft: { x: 2045, y: -780, z: 1430 },
        upperRight: { x: 2045, y: 780, z: 1430 },
      },
      sideWindows: [
        [
          { x: 720, y: -890, z: 980 },
          { x: 760, y: -815, z: 1438 },
          { x: 1480, y: -812, z: 1485 },
          { x: 1480, y: -885, z: 1000 },
        ],
        [
          { x: 1480, y: -885, z: 1000 },
          { x: 1480, y: -812, z: 1485 },
          { x: 2045, y: -780, z: 1430 },
          { x: 2180, y: -815, z: 990 },
        ],
      ],
    },
    pillars: {
      aPillar: {
        base: { x: 720, y: -890, z: 980 },
        top: { x: 760, y: -815, z: 1438 },
        thickness: 24,
      },
      bPillar: {
        base: { x: 1480, y: -885, z: 1000 },
        top: { x: 1480, y: -812, z: 1485 },
        thickness: 22,
      },
      cPillar: {
        base: { x: 2180, y: -815, z: 990 },
        top: { x: 2045, y: -780, z: 1430 },
        thickness: 46,
      },
    },
    roofSeals: {
      windshieldHeader: [
        { x: 760, y: -815, z: 1438 },
        { x: 760, y: 815, z: 1438 },
        { x: 1040, y: 835, z: 1548 },
        { x: 1040, y: -835, z: 1548 },
      ],
      rearHeader: [
        { x: 2045, y: -780, z: 1430 },
        { x: 2045, y: 780, z: 1430 },
        { x: 1660, y: 835, z: 1552 },
        { x: 1660, y: -835, z: 1552 },
      ],
    },
    upperGrille: {
      center: { ...scaledTruckConfig.sceneMm.upperGrille.center, z: 760 },
      halfWidth: 610,
      halfHeight: 32,
    },
    lowerIntake: {
      center: { ...scaledTruckConfig.sceneMm.lowerIntake.center, z: 560 },
      halfTop: 580,
      halfBottom: 640,
      halfHeight: 78,
    },
    sideDetails: {
      ...scaledTruckConfig.sceneMm.sideDetails,
      seams: [
        { x: 720, zTop: 930, zBottom: 500 },
        { x: 1480, zTop: 990, zBottom: 500 },
        { x: 2180, zTop: 975, zBottom: 505 },
        { x: 3300, zTop: 900, zBottom: 510 },
      ],
      handles: [
        { x: 1160, z: 930 },
        { x: 1850, z: 932 },
      ],
      beltline: [
        { x: 720, z: 930 },
        { x: 1480, z: 990 },
        { x: 2180, z: 975 },
        { x: 3300, z: 905 },
        { x: 4300, z: 880 },
      ],
      doorPanels: [
        {
          id: "front",
          xStart: 720,
          xEnd: 1480,
          zTopStart: 930,
          zTopEnd: 990,
          zBottomStart: 500,
          zBottomEnd: 500,
          zMidStart: 705,
          zMidEnd: 725,
        },
        {
          id: "rear",
          xStart: 1480,
          xEnd: 2180,
          zTopStart: 990,
          zTopEnd: 975,
          zBottomStart: 500,
          zBottomEnd: 505,
          zMidStart: 725,
          zMidEnd: 720,
        },
        {
          id: "bed",
          xStart: 2180,
          xEnd: 4300,
          zTopStart: 905,
          zTopEnd: 875,
          zBottomStart: 520,
          zBottomEnd: 535,
          zMidStart: 720,
          zMidEnd: 700,
        },
      ],
      windowBaseFills: [
        {
          id: "front",
          lowerLeft: { x: 720, z: 930 },
          lowerRight: { x: 1480, z: 990 },
          upperLeft: { x: 720, z: 980 },
          upperRight: { x: 1480, z: 1000 },
        },
        {
          id: "rear",
          lowerLeft: { x: 1480, z: 990 },
          lowerRight: { x: 2180, z: 975 },
          upperLeft: { x: 1480, z: 1000 },
          upperRight: { x: 2180, z: 990 },
        },
      ],
      mirrors: [
        {
          base: { x: 780, z: 990 },
          headCenter: { x: 735, z: 1035 },
          headSize: { x: 140, y: 78, z: 82 },
          stalkSize: { x: 90, y: 26, z: 30 },
        },
      ],
      wheelWells: [
        { x: 0, z: adventureTruckSourceSpecsM.wheelCenterZMm, radius: 490 },
        { x: adventureTruckSourceSpecsM.wheelbase * 1000, z: adventureTruckSourceSpecsM.wheelCenterZMm, radius: 500 },
      ],
    },
  },
} satisfies CarBlockoutConfig;
