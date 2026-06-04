import type { MaterialOptions, Vec3 } from "../../auto-types";
import { corollaVisualDerived } from "./visual-base";

const {
  p,
  length,
  halfWidth,
  frontAxleX,
  rearAxleX,
  frontBumperX,
  rearBumperX,
  cabinLength,
  cabinCenterX,
} = corollaVisualDerived;

export const corollaBodyVolumes = {
  mainBody: {
    position: [0, 0.34, 0] as Vec3,
    args: [length * 0.96, 0.52, halfWidth * 1.92] as Vec3,
    radius: 0.14,
  } satisfies BoxVisual,
  frontMass: {
    position: [frontAxleX - p.frontOverhang * 0.28, 0.55, 0] as Vec3,
    args: [p.frontOverhang * 1.05, 0.24, halfWidth * 1.66] as Vec3,
    radius: 0.12,
  } satisfies BoxVisual,
  rearMass: {
    position: [rearAxleX + p.rearOverhang * 0.35, 0.53, 0] as Vec3,
    args: [p.rearOverhang * 0.92, 0.24, halfWidth * 1.68] as Vec3,
    radius: 0.11,
  } satisfies BoxVisual,
  cabinShell: {
    position: [cabinCenterX + 0.02, 0.92, 0] as Vec3,
    args: [cabinLength * 0.86, 0.46, halfWidth * 1.34] as Vec3,
    radius: 0.13,
  } satisfies BoxVisual,
  hoodCrown: {
    position: [frontAxleX - p.frontOverhang * 0.38, 0.68, 0] as Vec3,
    args: [p.frontOverhang * 0.86, 0.018, halfWidth * 1.26] as Vec3,
    radius: 0.025,
  } satisfies BoxVisual,
  trunkDeck: {
    position: [rearAxleX + p.rearOverhang * 0.42, 0.66, 0] as Vec3,
    args: [p.rearOverhang * 0.62, 0.018, halfWidth * 1.28] as Vec3,
    radius: 0.025,
  } satisfies BoxVisual,
  lowerTrimY: 0.08,
} as const;

export const corollaBodyShell = {
  sideSilhouette: [
    { x: frontBumperX, rockerY: 0.28, beltY: 0.54, roofY: 0.6 },
    { x: frontAxleX - 0.55, rockerY: 0.3, beltY: 0.62, roofY: 0.7 },
    { x: frontAxleX + 0.1, rockerY: 0.31, beltY: 0.72, roofY: 0.82 },
    { x: cabinCenterX - 0.62, rockerY: 0.32, beltY: 0.82, roofY: 1.08 },
    { x: cabinCenterX - 0.18, rockerY: 0.32, beltY: 0.84, roofY: 1.24 },
    { x: cabinCenterX + 0.22, rockerY: 0.32, beltY: 0.84, roofY: 1.3 },
    { x: cabinCenterX + 0.62, rockerY: 0.32, beltY: 0.82, roofY: 1.16 },
    { x: rearAxleX - 0.2, rockerY: 0.31, beltY: 0.76, roofY: 0.92 },
    { x: rearAxleX + 0.42, rockerY: 0.3, beltY: 0.68, roofY: 0.76 },
    { x: rearBumperX - 0.22, rockerY: 0.29, beltY: 0.58, roofY: 0.64 },
    { x: rearBumperX, rockerY: 0.28, beltY: 0.48, roofY: 0.54 },
  ],
  widthProfile: [
    { x: frontBumperX, halfWidth: halfWidth * 0.7 },
    { x: frontAxleX - 0.55, halfWidth: halfWidth * 0.84 },
    { x: frontAxleX + 0.2, halfWidth: halfWidth * 0.96 },
    { x: cabinCenterX - 0.35, halfWidth: halfWidth },
    { x: cabinCenterX + 0.45, halfWidth: halfWidth * 0.98 },
    { x: rearAxleX + 0.2, halfWidth: halfWidth * 0.94 },
    { x: rearBumperX - 0.25, halfWidth: halfWidth * 0.82 },
    { x: rearBumperX, halfWidth: halfWidth * 0.72 },
  ],
  cabinGlasshouse: {
    startX: cabinCenterX - 0.62,
    peakX: cabinCenterX + 0.16,
    endX: cabinCenterX + 0.76,
    insetWidthMultiplier: 0.7,
  },
} as const;

export const corollaWindowProfile = {
  glassSideOffset: halfWidth * 0.74,
  windshield: {
    position: [cabinCenterX - cabinLength * 0.44, 1.01, 0] as Vec3,
    rotation: [0, 0, 0.36] as Vec3,
    args: [cabinLength * 0.34, 0.024, halfWidth * 0.98] as Vec3,
  },
  rearGlass: {
    position: [cabinCenterX + cabinLength * 0.44, 0.99, 0] as Vec3,
    rotation: [0, 0, -0.34] as Vec3,
    args: [cabinLength * 0.36, 0.024, halfWidth * 0.98] as Vec3,
  },
  sideWindows: [
    { x: cabinCenterX - cabinLength * 0.28, y: 1, w: cabinLength * 0.36, h: 0.2, rotationZ: -0.025 },
    { x: cabinCenterX + cabinLength * 0.2, y: 1, w: cabinLength * 0.38, h: 0.2, rotationZ: 0.025 },
    { x: cabinCenterX + cabinLength * 0.53, y: 0.98, w: 0.26, h: 0.18, rotationZ: 0.16 },
  ],
  pillars: [
    { x: cabinCenterX - cabinLength * 0.48, y: 0.99, w: 0.026, h: 0.42, rotationZ: -0.3 },
    { x: cabinCenterX - cabinLength * 0.03, y: 0.99, w: 0.026, h: 0.3, rotationZ: 0 },
    { x: cabinCenterX + cabinLength * 0.45, y: 0.98, w: 0.05, h: 0.4, rotationZ: 0.28 },
  ],
} as const;

export const corollaCharacterLines = {
  beltlineY: 0.78,
  beltlineSegments: [
    { x: cabinCenterX - cabinLength * 0.36, length: cabinLength * 0.42 },
    { x: cabinCenterX + cabinLength * 0.26, length: cabinLength * 0.46 },
  ],
  rocker: {
    y: 0.3,
    length: length * 0.86,
    height: 0.035,
    sideOffset: halfWidth * 0.99,
  },
  doorCuts: [
    { x: cabinCenterX - cabinLength * 0.04, heightRatio: 0.42 },
    { x: cabinCenterX + cabinLength * 0.46, heightRatio: 0.4 },
  ],
  handles: [
    { x: cabinCenterX - cabinLength * 0.25, y: 0.77 },
    { x: cabinCenterX + cabinLength * 0.27, y: 0.77 },
  ],
} as const;

export const corollaLightingProfile = {
  front: {
    grille: {
      position: [frontBumperX + 0.035, 0.55, 0] as Vec3,
      args: [0.026, 0.04, 1.02] as Vec3,
      radius: 0.01,
    } satisfies BoxVisual,
    lowerIntake: {
      position: [frontBumperX + 0.045, 0.42, 0] as Vec3,
      args: [0.022, 0.085, 0.86] as Vec3,
      radius: 0.012,
    } satisfies BoxVisual,
    chromeBar: {
      position: [frontBumperX + 0.055, 0.6, 0] as Vec3,
      args: [0.018, 0.026, 0.92] as Vec3,
      radius: 0.008,
    } satisfies BoxVisual,
    headlights: [
      { zSign: 1, position: [frontBumperX + 0.075, 0.62, halfWidth * 0.58] as Vec3, rotationY: -0.12 },
      { zSign: -1, position: [frontBumperX + 0.075, 0.62, -halfWidth * 0.58] as Vec3, rotationY: 0.12 },
    ],
    turnSignals: [
      { position: [frontBumperX + 0.09, 0.61, halfWidth * 0.83] as Vec3, rotationY: -0.16 },
      { position: [frontBumperX + 0.09, 0.61, -halfWidth * 0.83] as Vec3, rotationY: 0.16 },
    ],
  },
  rear: {
    bumper: {
      position: [rearBumperX - 0.055, 0.46, 0] as Vec3,
      args: [0.06, 0.26, halfWidth * 1.52] as Vec3,
      radius: 0.08,
    } satisfies BoxVisual,
    taillights: [
      { position: [rearBumperX - 0.05, 0.68, halfWidth * 0.58] as Vec3 },
      { position: [rearBumperX - 0.05, 0.68, -halfWidth * 0.58] as Vec3 },
    ],
  },
} as const;

export const corollaSmallParts = {
  mirrors: {
    x: cabinCenterX - cabinLength * 0.56,
    y: 0.84,
    sideOffset: halfWidth * 1.06,
    baseSize: [0.08, 0.045, 0.06] as Vec3,
    capSize: [0.16, 0.08, 0.08] as Vec3,
  },
  antenna: {
    position: [cabinCenterX + cabinLength * 0.42, 1.32, 0] as Vec3,
    size: [0.025, 0.08, 0.025] as Vec3,
  },
  plate: {
    rearPosition: [rearBumperX - 0.075, 0.55, 0] as Vec3,
    size: [0.018, 0.12, 0.42] as Vec3,
  },
} as const;

export const corollaWheelProfile = {
  frontAxleX,
  rearAxleX,
  wheelCenterY: p.wheelRadius,
  lateralOffset: halfWidth * 0.91,
  radius: p.wheelRadius,
  width: p.wheelWidth,
  rimRadius: p.wheelRadius * 0.68,
  archRadius: p.wheelRadius * 1.24,
  tireColor: "#111111",
  rimColor: "#b8c0c8",
  spokeColor: "#8b949e",
  centerCapColor: "#2f343a",
  spokeCount: 10,
} as const;

export const corollaMotionProfile = {
  rotation: [0, -0.52, 0] as Vec3,
  floatAmplitude: 0.01,
  floatSpeed: 1.25,
  continuousRotationSpeed: 0,
} as const;

type BoxVisual = {
  position: Vec3;
  args: Vec3;
  radius?: number;
  material?: MaterialOptions;
};
