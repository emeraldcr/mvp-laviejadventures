export const mmToM = (mm: number) => mm / 1000;

export const sourceSpecsMm = {
  length: 4638,
  widthNoMirrors: 1775,
  height: 1455,
  wheelbase: 2700,
  frontTrack: 1525,
  rearTrack: 1525,
  groundClearanceNominal: 145,
  groundClearanceMin: 140,
  groundClearanceMax: 152,
};

export const sourceDerived = {
  frontOverhang: (sourceSpecsMm.length - sourceSpecsMm.wheelbase) * 0.455,
  rearOverhang: (sourceSpecsMm.length - sourceSpecsMm.wheelbase) * 0.545,
  lengthToWidthRatio: sourceSpecsMm.length / sourceSpecsMm.widthNoMirrors,
  lengthToHeightRatio: sourceSpecsMm.length / sourceSpecsMm.height,
  wheelbaseToLengthRatio: sourceSpecsMm.wheelbase / sourceSpecsMm.length,
  halfWidth: sourceSpecsMm.widthNoMirrors / 2,
  halfFrontTrack: sourceSpecsMm.frontTrack / 2,
  halfRearTrack: sourceSpecsMm.rearTrack / 2,
};

export const xAnchorsMm = {
  frontBumper: -sourceDerived.frontOverhang,
  frontAxle: 0,
  firewallApprox: 430,
  aPillarBase: 500,
  bPillar: 1450,
  rearDoorCut: 2490,
  rearAxle: sourceSpecsMm.wheelbase,
  trunkStart: 2550,
  rearBumper: sourceSpecsMm.wheelbase + sourceDerived.rearOverhang,
};

export const zAnchorsMm = {
  ground: 0,
  rockerBottom: 210,
  rockerMid: 285,
  wheelCenter: 315,
  bumperLower: 330,
  bumperMid: 520,
  hoodFront: 740,
  hoodRear: 900,
  beltlineFront: 900,
  beltlineRear: 1030,
  windowSillFront: 890,
  windowSillRear: 930,
  trunkDeck: 1015,
  roofApex: sourceSpecsMm.height,
};

export const tire20555R16 = {
  label: "P205/55R16",
  rimDiameterIn: 16,
  tireWidthMm: 205,
  aspectRatio: 0.55,
  sidewallMm: 205 * 0.55,
  rimDiameterMm: 16 * 25.4,
  overallDiameterMm: 16 * 25.4 + 2 * (205 * 0.55),
  radiusMm: (16 * 25.4 + 2 * (205 * 0.55)) / 2,
};

export const corollaDimensionsM = {
  overallLength: 4.638,
  overallWidth: 1.775,
  visualHeight: 1.42,
  wheelbase: 2.7,
  frontOverhang: 0.88,
  rearOverhang: 1.06,
  frontBumperX: -2.319,
  rearBumperX: 2.319,
  frontAxleX: -1.35,
  rearAxleX: 1.35,
  halfWidth: 0.8875,
} as const;

const mirrorSourcePointY = <T extends { x: number; y: number; z: number }>(point: T) => ({
  ...point,
  y: -point.y,
});

const hoodFrontDeckMm = { x: -720, z: 650, halfWidth: 640 } as const;
const hoodMidDeckMm = { x: -280, z: 700, halfWidth: 690 } as const;
const hoodRearDeckMm = { x: 700, z: 842, halfWidth: 770 } as const;
const trunkFrontDeckMm = { x: 2860, z: 902, halfWidth: 748 } as const;
const trunkMidDeckMm = { x: 3200, z: 896, halfWidth: 704 } as const;
const trunkRearDeckMm = { x: 3500, z: 872, halfWidth: 650 } as const;

const windshieldLowerLeftMm = { x: hoodRearDeckMm.x, y: -858, z: 845 } as const;
const windshieldUpperLeftMm = { x: 1020, y: -820, z: 1192 } as const;
const frontDoorWindowLowerMm = { x: 720, y: -868, z: 890 } as const;
const bPillarLowerMm = { x: 1668, y: -862, z: 920 } as const;
const bPillarUpperMm = { x: 1668, y: -812, z: 1260 } as const;
const cPillarUpperMm = { x: 2440, y: -796, z: 1218 } as const;
const cPillarLowerMm = { x: 2680, y: -826, z: 928 } as const;
const rearGlassLowerLeftMm = { x: trunkFrontDeckMm.x, y: -825, z: trunkFrontDeckMm.z } as const;
const roofFrontHeaderRearMm = { x: 1085, y: -812, z: 1218 } as const;
const roofRearHeaderFrontMm = { x: 2378, y: -790, z: 1230 } as const;

const frontDoorTopStartMm = { x: frontDoorWindowLowerMm.x, z: 790 } as const;
const frontDoorTopEndMm = { x: bPillarLowerMm.x, z: 804 } as const;
const rearDoorTopStartMm = frontDoorTopEndMm;
const rearDoorTopEndMm = { x: cPillarLowerMm.x, z: 812 } as const;

export const corollaConnectionMapMm = {
  hood: {
    frontDeck: hoodFrontDeckMm,
    midDeck: hoodMidDeckMm,
    rearDeck: hoodRearDeckMm,
    windshieldCowlLeft: windshieldLowerLeftMm,
    windshieldCowlRight: mirrorSourcePointY(windshieldLowerLeftMm),
  },
  cabin: {
    windshieldLowerLeft: windshieldLowerLeftMm,
    windshieldLowerRight: mirrorSourcePointY(windshieldLowerLeftMm),
    windshieldUpperLeft: windshieldUpperLeftMm,
    windshieldUpperRight: mirrorSourcePointY(windshieldUpperLeftMm),
    frontDoorWindowLower: frontDoorWindowLowerMm,
    aPillarBase: frontDoorWindowLowerMm,
    aPillarTop: windshieldUpperLeftMm,
    bPillarBase: bPillarLowerMm,
    bPillarTop: bPillarUpperMm,
    cPillarTop: cPillarUpperMm,
    cPillarBase: cPillarLowerMm,
    rearGlassUpperLeft: cPillarUpperMm,
    rearGlassUpperRight: mirrorSourcePointY(cPillarUpperMm),
    rearGlassLowerLeft: rearGlassLowerLeftMm,
    rearGlassLowerRight: mirrorSourcePointY(rearGlassLowerLeftMm),
  },
  roof: {
    frontLeft: windshieldUpperLeftMm,
    frontRight: mirrorSourcePointY(windshieldUpperLeftMm),
    frontHeaderRearLeft: roofFrontHeaderRearMm,
    frontHeaderRearRight: mirrorSourcePointY(roofFrontHeaderRearMm),
    rearLeft: cPillarUpperMm,
    rearRight: mirrorSourcePointY(cPillarUpperMm),
    rearHeaderFrontLeft: roofRearHeaderFrontMm,
    rearHeaderFrontRight: mirrorSourcePointY(roofRearHeaderFrontMm),
  },
  doors: {
    frontTopStart: frontDoorTopStartMm,
    frontTopEnd: frontDoorTopEndMm,
    rearTopStart: rearDoorTopStartMm,
    rearTopEnd: rearDoorTopEndMm,
  },
  trunk: {
    frontDeck: trunkFrontDeckMm,
    midDeck: trunkMidDeckMm,
    rearDeck: trunkRearDeckMm,
    rearGlassLowerLeft: rearGlassLowerLeftMm,
    rearGlassLowerRight: mirrorSourcePointY(rearGlassLowerLeftMm),
  },
} as const;

export const corollaGeometryMm = {
  mainBodyStations: [
    { x: -760, topZ: 600, bottomZ: 280, halfWidth: 710 },
    { x: -560, topZ: 655, bottomZ: 280, halfWidth: 775 },
    { x: -360, topZ: 735, bottomZ: 280, halfWidth: 830 },
    { x: -180, topZ: 800, bottomZ: 280, halfWidth: 855 },
    { x: 0, topZ: 814, bottomZ: 280, halfWidth: 868 },
    { x: 180, topZ: 824, bottomZ: 280, halfWidth: 872 },
    { x: 420, topZ: 842, bottomZ: 280, halfWidth: 875 },
    { x: 720, topZ: 860, bottomZ: 280, halfWidth: 878 },
    { x: 1160, topZ: 875, bottomZ: 280, halfWidth: 878 },
    { x: 1700, topZ: 872, bottomZ: 280, halfWidth: 872 },
    { x: 2260, topZ: 862, bottomZ: 280, halfWidth: 852 },
    { x: 2680, topZ: 842, bottomZ: 280, halfWidth: 826 },
    { x: 2860, topZ: 900, bottomZ: 280, halfWidth: 812 },
    { x: 3120, topZ: 895, bottomZ: 284, halfWidth: 775 },
    { x: 3380, topZ: 868, bottomZ: 292, halfWidth: 735 },
    { x: 3535, topZ: 618, bottomZ: 305, halfWidth: 700 },
  ],
  hoodStations: [
    corollaConnectionMapMm.hood.frontDeck,
    corollaConnectionMapMm.hood.midDeck,
    { x: 260, z: 785, halfWidth: 746 },
    corollaConnectionMapMm.hood.rearDeck,
  ],
  trunkStations: [
    corollaConnectionMapMm.trunk.frontDeck,
    corollaConnectionMapMm.trunk.midDeck,
    corollaConnectionMapMm.trunk.rearDeck,
  ],
  roofStations: [
    { x: corollaConnectionMapMm.roof.frontLeft.x, z: corollaConnectionMapMm.roof.frontLeft.z, halfWidth: 820 },
    { x: 1380, z: 1272, halfWidth: 812 },
    { x: 1900, z: 1270, halfWidth: 804 },
    { x: corollaConnectionMapMm.roof.rearLeft.x, z: corollaConnectionMapMm.roof.rearLeft.z, halfWidth: 796 },
  ],
  frontBumperStations: [
    { x: -900, z: 625, halfWidth: 685 },
    { x: -944, z: 555, halfWidth: 736 },
    { x: -970, z: 488, halfWidth: 758 },
    { x: -956, z: 410, halfWidth: 748 },
    { x: -916, z: 338, halfWidth: 660 },
  ],
  rearBumperStations: [
    { x: 3510, z: 640, halfWidth: 730 },
    { x: 3669, z: 500, halfWidth: 720 },
    { x: 3630, z: 360, halfWidth: 575 },
  ],
  wheelArchCentersX: [0, 2700],
  wheelCenterZ: 315,
  wheelArchRadius: 420,
} as const;

export const corollaSceneMm = {
  wheels: {
    radius: 316,
    width: 205,
    centers: [
      { x: 0, y: 800, z: 315 },
      { x: 2700, y: 800, z: 315 },
      { x: 0, y: -800, z: 315 },
      { x: 2700, y: -800, z: 315 },
    ],
  },
  glass: {
    windshield: {
      lowerLeft: corollaConnectionMapMm.cabin.windshieldLowerLeft,
      lowerRight: corollaConnectionMapMm.cabin.windshieldLowerRight,
      upperLeft: corollaConnectionMapMm.cabin.windshieldUpperLeft,
      upperRight: corollaConnectionMapMm.cabin.windshieldUpperRight,
    },
    rearGlass: {
      lowerLeft: corollaConnectionMapMm.cabin.rearGlassLowerLeft,
      lowerRight: corollaConnectionMapMm.cabin.rearGlassLowerRight,
      upperLeft: corollaConnectionMapMm.cabin.rearGlassUpperLeft,
      upperRight: corollaConnectionMapMm.cabin.rearGlassUpperRight,
    },
    sideWindows: [
      [
        corollaConnectionMapMm.cabin.frontDoorWindowLower,
        corollaConnectionMapMm.cabin.aPillarTop,
        corollaConnectionMapMm.cabin.bPillarTop,
        corollaConnectionMapMm.cabin.bPillarBase,
      ],
      [
        corollaConnectionMapMm.cabin.bPillarBase,
        corollaConnectionMapMm.cabin.bPillarTop,
        corollaConnectionMapMm.cabin.cPillarTop,
        corollaConnectionMapMm.cabin.cPillarBase,
      ],
    ],
  },
  pillars: {
    aPillar: {
      base: corollaConnectionMapMm.cabin.aPillarBase,
      top: corollaConnectionMapMm.cabin.aPillarTop,
      thickness: 18,
    },
    bPillar: {
      base: corollaConnectionMapMm.cabin.bPillarBase,
      top: corollaConnectionMapMm.cabin.bPillarTop,
      thickness: 16,
    },
    cPillar: {
      base: corollaConnectionMapMm.cabin.cPillarBase,
      top: corollaConnectionMapMm.cabin.cPillarTop,
      thickness: 34,
    },
  },
  roofSeals: {
    windshieldHeader: [
      corollaConnectionMapMm.roof.frontLeft,
      corollaConnectionMapMm.roof.frontRight,
      corollaConnectionMapMm.roof.frontHeaderRearRight,
      corollaConnectionMapMm.roof.frontHeaderRearLeft,
    ],
    rearHeader: [
      corollaConnectionMapMm.roof.rearLeft,
      corollaConnectionMapMm.roof.rearRight,
      corollaConnectionMapMm.roof.rearHeaderFrontRight,
      corollaConnectionMapMm.roof.rearHeaderFrontLeft,
    ],
  },
  upperGrille: {
    center: { x: -942, y: 0, z: 558 },
    halfWidth: 500,
    halfHeight: 16,
  },
  lowerIntake: {
    center: { x: -940, y: 0, z: 410 },
    halfTop: 475,
    halfBottom: 420,
    halfHeight: 48,
  },
  headlights: [
    { x: -936, y: -230, z: 630 },
    { x: -926, y: -560, z: 642 },
    { x: -858, y: -724, z: 624 },
    { x: -832, y: -732, z: 596 },
    { x: -888, y: -560, z: 586 },
    { x: -932, y: -245, z: 598 },
  ],
  taillights: [
    { x: 3538, y: -255, z: 682 },
    { x: 3548, y: -575, z: 690 },
    { x: 3578, y: -632, z: 672 },
    { x: 3574, y: -612, z: 646 },
    { x: 3538, y: -260, z: 652 },
  ],
  badge: {
    center: { x: -946, y: 0, z: 580 },
    halfWidth: 42,
    halfHeight: 22,
  },
  sideDetails: {
    render: {
      seamOutsetMm: 3,
      handleOutsetMm: 8,
      beltlineOutsetMm: 5,
      seamWidthMm: 10,
      seamDepthMm: 7,
      doorFrameOutsetMm: 6,
      doorFrameHeightMm: 9,
      doorFrameDepthMm: 8,
      doorMidlineOutsetMm: 7,
      doorMidlineHeightMm: 7,
      doorMidlineDepthMm: 7,
      handleLengthMm: 150,
      handleHeightMm: 24,
      handleDepthMm: 18,
      beltlineHeightMm: 8,
      beltlineDepthMm: 7,
      windowBaseFillOutsetMm: 2,
      windowFrameHeightMm: 18,
      windowFrameDepthMm: 10,
      fenderOutsetMm: 14,
      fenderLipTubeMm: 22,
      fenderArcRadians: Math.PI,
      mirrorHeadOutsetMm: 98,
      mirrorStalkOutsetMm: 38,
      wheelWellInsetMm: -8,
    },
    seams: [
      { x: corollaConnectionMapMm.doors.frontTopStart.x, zTop: corollaConnectionMapMm.doors.frontTopStart.z, zBottom: 380 },
      { x: corollaConnectionMapMm.doors.frontTopEnd.x, zTop: corollaConnectionMapMm.doors.frontTopEnd.z, zBottom: 380 },
      { x: corollaConnectionMapMm.doors.rearTopEnd.x, zTop: corollaConnectionMapMm.doors.rearTopEnd.z, zBottom: 390 },
    ],
    handles: [
      { x: 1180, z: 750 },
      { x: 2200, z: 758 },
    ],
    beltline: [
      corollaConnectionMapMm.doors.frontTopStart,
      { x: 1180, z: 798 },
      corollaConnectionMapMm.doors.frontTopEnd,
      { x: 2200, z: 810 },
      corollaConnectionMapMm.doors.rearTopEnd,
    ],
    doorPanels: [
      {
        id: "front",
        xStart: corollaConnectionMapMm.doors.frontTopStart.x,
        xEnd: corollaConnectionMapMm.doors.frontTopEnd.x,
        zTopStart: corollaConnectionMapMm.doors.frontTopStart.z,
        zTopEnd: corollaConnectionMapMm.doors.frontTopEnd.z,
        zBottomStart: 405,
        zBottomEnd: 395,
        zMidStart: 615,
        zMidEnd: 626,
      },
      {
        id: "rear",
        xStart: corollaConnectionMapMm.doors.rearTopStart.x,
        xEnd: corollaConnectionMapMm.doors.rearTopEnd.x,
        zTopStart: corollaConnectionMapMm.doors.rearTopStart.z,
        zTopEnd: corollaConnectionMapMm.doors.rearTopEnd.z,
        zBottomStart: 395,
        zBottomEnd: 410,
        zMidStart: 626,
        zMidEnd: 638,
      },
    ],
    windowBaseFills: [
      {
        id: "front",
        lowerLeft: corollaConnectionMapMm.doors.frontTopStart,
        lowerRight: corollaConnectionMapMm.doors.frontTopEnd,
        upperLeft: {
          x: corollaConnectionMapMm.cabin.frontDoorWindowLower.x,
          z: corollaConnectionMapMm.cabin.frontDoorWindowLower.z,
        },
        upperRight: {
          x: corollaConnectionMapMm.cabin.bPillarBase.x,
          z: corollaConnectionMapMm.cabin.bPillarBase.z,
        },
      },
      {
        id: "rear",
        lowerLeft: corollaConnectionMapMm.doors.rearTopStart,
        lowerRight: corollaConnectionMapMm.doors.rearTopEnd,
        upperLeft: {
          x: corollaConnectionMapMm.cabin.bPillarBase.x,
          z: corollaConnectionMapMm.cabin.bPillarBase.z,
        },
        upperRight: {
          x: corollaConnectionMapMm.cabin.cPillarBase.x,
          z: corollaConnectionMapMm.cabin.cPillarBase.z,
        },
      },
    ],
    mirrors: [
      {
        base: { x: 805, z: 872 },
        headCenter: { x: 760, z: 910 },
        headSize: { x: 120, y: 62, z: 74 },
        stalkSize: { x: 82, y: 20, z: 24 },
      },
    ],
    wheelWells: [
      { x: 0, z: 360, radius: 392 },
      { x: 2700, z: 382, radius: 416 },
    ],
  },
  interior: {
    frontSeats: [
      {
        center: { x: 1510, y: -285, z: 705 },
        cushionSize: { x: 310, y: 270, z: 95 },
        backCenter: { x: 1585, y: -285, z: 850 },
        backSize: { x: 95, y: 285, z: 330 },
        backRotationZ: -0.18,
      },
      {
        center: { x: 1510, y: 285, z: 705 },
        cushionSize: { x: 310, y: 270, z: 95 },
        backCenter: { x: 1585, y: 285, z: 850 },
        backSize: { x: 95, y: 285, z: 330 },
        backRotationZ: -0.18,
      },
    ],
    dashboard: {
      center: { x: 925, y: 0, z: 820 },
      size: { x: 130, y: 1040, z: 150 },
      topCenter: { x: 980, y: 0, z: 895 },
      topSize: { x: 245, y: 1000, z: 38 },
    },
    steeringWheel: {
      center: { x: 1035, y: -330, z: 825 },
      radius: 118,
      tube: 12,
      rotationY: Math.PI / 2,
      rotationZ: -0.24,
      columnCenter: { x: 970, y: -330, z: 790 },
      columnSize: { x: 135, y: 32, z: 32 },
      columnRotationZ: -0.22,
    },
  },
} as const;

export const corollaGeometryBuilderConfig = {
  panelFactors: [-1, -0.5, 0, 0.5, 1],
  faceFactors: [-1, -0.5, 0, 0.5, 1],
  bodySideInsetMm: 32,
  bodyArchMidMinZ: 480,
  bodyArchMidBaseZ: 420,
  bodyArchTopGapMm: 18,
  bodyArchMidLiftMm: 22,
  defaultBumperCrownMm: 2,
  defaultBumperEdgeDropMm: 3,
  hoodCrownMm: 10,
  hoodEdgeDropMm: 4,
  hoodSideDropMm: 58,
  hoodFrontDropMm: 52,
  hoodRearDropMm: 34,
  trunkCrownMm: 3,
  trunkEdgeDropMm: 5,
  trunkSideDropMm: 46,
  trunkFrontDropMm: 28,
  trunkRearDropMm: 74,
  roofCrownMm: 22,
  roofEdgeDropMm: 8,
  roofSideDropMm: 38,
  roofFrontDropMm: 32,
  roofRearDropMm: 36,
  frontBumper: {
    cornerRetreatMm: 86,
    topShoulderSoftnessMm: 18,
    bottomShoulderSoftnessMm: 28,
    middleShoulderSoftnessMm: 8,
    crownMm: 4,
    edgeDropMm: 2,
  },
} as const;
