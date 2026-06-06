import { corollaBlockoutConfig } from "../corolla/source";
import {
  createBlockoutDimensionsM,
  createScaledBlockoutConfig,
} from "../shared/blockout-source-factory";
import type { CarBlockoutConfig } from "../shared/blockout-types";

export const teslaEvSourceSpecsM = {
  overallLength: 4.751,
  overallWidth: 1.921,
  visualHeight: 1.624,
  wheelbase: 2.891,
  frontOverhang: 0.86,
  rearOverhang: 1.0,
  wheelRadius: 0.365,
  wheelWidth: 0.255,
  trackHalfWidthMm: 830,
  wheelCenterZMm: 365,
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
      color: "#cfd7df",
      metalness: 0.45,
      roughness: 0.24,
    },
  },
  builderOverrides: {
    bodySideInsetMm: 36,
    bodyArchMidMinZ: 580,
    bodyArchMidBaseZ: 470,
    bodyArchTopGapMm: 26,
    bodyArchMidLiftMm: 28,
    hoodCrownMm: 12,
    hoodEdgeDropMm: 2,
    hoodSideDropMm: 46,
    hoodFrontDropMm: 34,
    hoodRearDropMm: 18,
    roofCrownMm: 26,
    roofEdgeDropMm: 6,
    roofSideDropMm: 48,
    roofFrontDropMm: 20,
    roofRearDropMm: 42,
    trunkCrownMm: 10,
    trunkEdgeDropMm: 4,
    trunkSideDropMm: 48,
    trunkFrontDropMm: 20,
    trunkRearDropMm: 90,
    frontBumper: {
      cornerRetreatMm: 96,
      topShoulderSoftnessMm: 28,
      bottomShoulderSoftnessMm: 36,
      middleShoulderSoftnessMm: 14,
      crownMm: 7,
    },
  },
});

export const teslaEvBlockoutConfig = {
  ...scaledTeslaEvConfig,
  renderProfile: {
    roofOverlay: {
      material: {
        color: "#07131a",
        opacity: 0.84,
        transmission: 0.18,
        clearcoat: 0.9,
        clearcoatRoughness: 0.04,
      },
      verticalLiftMm: 8,
    },
  },
  geometryMm: {
    ...scaledTeslaEvConfig.geometryMm,
    mainBodyStations: [
      { x: -795, topZ: 650, bottomZ: 330, halfWidth: 690 },
      { x: -620, topZ: 720, bottomZ: 330, halfWidth: 785 },
      { x: -380, topZ: 805, bottomZ: 330, halfWidth: 885 },
      { x: -120, topZ: 865, bottomZ: 330, halfWidth: 930 },
      { x: 0, topZ: 890, bottomZ: 330, halfWidth: 948 },
      { x: 360, topZ: 925, bottomZ: 330, halfWidth: 960 },
      { x: 760, topZ: 970, bottomZ: 330, halfWidth: 964 },
      { x: 1120, topZ: 1000, bottomZ: 330, halfWidth: 962 },
      { x: 1600, topZ: 1025, bottomZ: 330, halfWidth: 958 },
      { x: 2050, topZ: 1035, bottomZ: 332, halfWidth: 950 },
      { x: 2480, topZ: 1025, bottomZ: 336, halfWidth: 935 },
      { x: 2891, topZ: 1000, bottomZ: 342, halfWidth: 920 },
      { x: 3180, topZ: 965, bottomZ: 348, halfWidth: 880 },
      { x: 3480, topZ: 875, bottomZ: 356, halfWidth: 820 },
      { x: 3700, topZ: 710, bottomZ: 365, halfWidth: 720 },
    ],
    hoodStations: [
      { x: -730, z: 650, halfWidth: 620 },
      { x: -430, z: 725, halfWidth: 770 },
      { x: 130, z: 825, halfWidth: 895 },
      { x: 680, z: 940, halfWidth: 900 },
    ],
    roofStations: [
      { x: 1080, z: 1380, halfWidth: 895 },
      { x: 1320, z: 1500, halfWidth: 900 },
      { x: 1710, z: 1605, halfWidth: 905 },
      { x: 2240, z: 1568, halfWidth: 890 },
      { x: 2580, z: 1450, halfWidth: 870 },
      { x: 2860, z: 1325, halfWidth: 850 },
    ],
    trunkStations: [
      { x: 3140, z: 1080, halfWidth: 805 },
      { x: 3440, z: 980, halfWidth: 735 },
      { x: 3740, z: 850, halfWidth: 650 },
    ],
    frontBumperStations: [
      { x: -860, z: 650, halfWidth: 650 },
      { x: -870, z: 590, halfWidth: 760 },
      { x: -865, z: 510, halfWidth: 820 },
      { x: -830, z: 410, halfWidth: 805 },
      { x: -760, z: 335, halfWidth: 670 },
    ],
    rearBumperStations: [
      { x: 3710, z: 760, halfWidth: 730 },
      { x: 3860, z: 575, halfWidth: 750 },
      { x: 3820, z: 390, halfWidth: 620 },
    ],
    wheelCenterZ: teslaEvSourceSpecsM.wheelCenterZMm,
    wheelArchRadius: 470,
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
    glass: {
      windshield: {
        lowerLeft: { x: 680, y: -920, z: 940 },
        lowerRight: { x: 680, y: 920, z: 940 },
        upperLeft: { x: 1080, y: -895, z: 1380 },
        upperRight: { x: 1080, y: 895, z: 1380 },
      },
      rearGlass: {
        lowerLeft: { x: 3140, y: -860, z: 1080 },
        lowerRight: { x: 3140, y: 860, z: 1080 },
        upperLeft: { x: 2580, y: -870, z: 1450 },
        upperRight: { x: 2580, y: 870, z: 1450 },
      },
      sideWindows: [
        [
          { x: 720, y: -930, z: 940 },
          { x: 1080, y: -895, z: 1380 },
          { x: 1660, y: -900, z: 1485 },
          { x: 1660, y: -930, z: 1010 },
        ],
        [
          { x: 1660, y: -930, z: 1010 },
          { x: 1660, y: -900, z: 1485 },
          { x: 2580, y: -870, z: 1450 },
          { x: 2960, y: -900, z: 1070 },
        ],
        [
          { x: 2580, y: -870, z: 1450 },
          { x: 2860, y: -850, z: 1325 },
          { x: 3140, y: -860, z: 1080 },
          { x: 2960, y: -900, z: 1070 },
        ],
      ],
    },
    pillars: {
      aPillar: {
        base: { x: 720, y: -930, z: 940 },
        top: { x: 1080, y: -895, z: 1380 },
        thickness: 26,
      },
      bPillar: {
        base: { x: 1660, y: -930, z: 1010 },
        top: { x: 1660, y: -900, z: 1485 },
        thickness: 20,
      },
      cPillar: {
        base: { x: 2960, y: -900, z: 1070 },
        top: { x: 2580, y: -870, z: 1450 },
        thickness: 54,
      },
    },
    roofSeals: {
      windshieldHeader: [
        { x: 1080, y: -895, z: 1380 },
        { x: 1080, y: 895, z: 1380 },
        { x: 1320, y: 900, z: 1500 },
        { x: 1320, y: -900, z: 1500 },
      ],
      rearHeader: [
        { x: 2580, y: -870, z: 1450 },
        { x: 2580, y: 870, z: 1450 },
        { x: 2860, y: 850, z: 1325 },
        { x: 2860, y: -850, z: 1325 },
      ],
    },
    upperGrille: {
      center: { x: -846, y: 0, z: 662 },
      halfWidth: 120,
      halfHeight: 3,
    },
    lowerIntake: {
      center: { x: -846, y: 0, z: 425 },
      halfTop: 320,
      halfBottom: 360,
      halfHeight: 24,
    },
    headlights: [
      { x: -836, y: -330, z: 720 },
      { x: -808, y: -690, z: 748 },
      { x: -678, y: -820, z: 725 },
      { x: -650, y: -780, z: 692 },
      { x: -770, y: -420, z: 680 },
    ],
    taillights: [
      { x: 3740, y: -280, z: 855 },
      { x: 3820, y: -640, z: 860 },
      { x: 3840, y: -720, z: 820 },
      { x: 3760, y: -650, z: 790 },
      { x: 3700, y: -290, z: 805 },
    ],
    badge: {
      center: { x: -852, y: 0, z: 666 },
      halfWidth: 14,
      halfHeight: 28,
    },
    sideDetails: {
      ...scaledTeslaEvConfig.sceneMm.sideDetails,
      render: {
        ...scaledTeslaEvConfig.sceneMm.sideDetails.render,
        handleLengthMm: 128,
        handleHeightMm: 11,
        handleDepthMm: 5,
        beltlineHeightMm: 5,
        doorFrameHeightMm: 7,
        doorMidlineHeightMm: 5,
        windowFrameHeightMm: 14,
      },
      seams: [
        { x: 720, zTop: 935, zBottom: 430 },
        { x: 1660, zTop: 1010, zBottom: 420 },
        { x: 2960, zTop: 1070, zBottom: 440 },
      ],
      handles: [
        { x: 1250, z: 920 },
        { x: 2250, z: 925 },
      ],
      beltline: [
        { x: 720, z: 940 },
        { x: 1260, z: 970 },
        { x: 1660, z: 1010 },
        { x: 2250, z: 1000 },
        { x: 2960, z: 1070 },
      ],
      doorPanels: [
        {
          id: "front",
          xStart: 720,
          xEnd: 1660,
          zTopStart: 910,
          zTopEnd: 970,
          zBottomStart: 430,
          zBottomEnd: 420,
          zMidStart: 710,
          zMidEnd: 730,
        },
        {
          id: "rear",
          xStart: 1660,
          xEnd: 2960,
          zTopStart: 970,
          zTopEnd: 995,
          zBottomStart: 420,
          zBottomEnd: 460,
          zMidStart: 730,
          zMidEnd: 760,
        },
      ],
      windowBaseFills: [
        {
          id: "front",
          lowerLeft: { x: 720, z: 910 },
          lowerRight: { x: 1660, z: 970 },
          upperLeft: { x: 720, z: 940 },
          upperRight: { x: 1660, z: 1010 },
        },
        {
          id: "rear",
          lowerLeft: { x: 1660, z: 970 },
          lowerRight: { x: 2960, z: 995 },
          upperLeft: { x: 1660, z: 1010 },
          upperRight: { x: 2960, z: 1070 },
        },
      ],
      mirrors: [
        {
          base: { x: 840, z: 1010 },
          headCenter: { x: 790, z: 1050 },
          headSize: { x: 130, y: 70, z: 78 },
          stalkSize: { x: 82, y: 18, z: 24 },
        },
      ],
      wheelWells: [
        {
          x: 0,
          z: teslaEvSourceSpecsM.wheelCenterZMm,
          radius: 455,
        },
        {
          x: teslaEvSourceSpecsM.wheelbase * 1000,
          z: teslaEvSourceSpecsM.wheelCenterZMm,
          radius: 455,
        },
      ],
    },
  },
} satisfies CarBlockoutConfig;
