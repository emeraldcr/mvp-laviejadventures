import type { MaterialOptions, Vec3, RenderingConfig, PBRMaterialOptions } from "../auto-types";

// =====================================================
// COROLLA 2016 — VISUAL PARAMETERS (Improved)
// Ready for high-quality realistic Three.js rendering
// =====================================================

export const corollaVisualParams = {
  wheelbase: 2.7,
  overallLength: 4.638,
  width: 1.775,
  bodyHeight: 1.455,
  frontOverhang: 0.88179,
  rearOverhang: 1.05621,
  groundClearance: 0.145,
  wheelRadius: 0.31595,
  wheelWidth: 0.205,
  cabinLengthRatio: 0.62,
  frontLightHeight: 0.68,
  rearLightHeight: 0.62,
  bodyTaper: 0.48,
  roofCurve: 1.18,
} as const;

const p = corollaVisualParams;

const length = p.overallLength;
const halfLength = length / 2;
const halfWidth = p.width / 2;
const height = p.bodyHeight;
const frontAxleX = -p.wheelbase / 2;
const rearAxleX = p.wheelbase / 2;
const frontBumperX = frontAxleX - p.frontOverhang;
const rearBumperX = rearAxleX + p.rearOverhang;
const cabinLength = p.wheelbase * p.cabinLengthRatio;
const cabinCenterX = frontAxleX + p.wheelbase * 0.5;

// =====================================================
// BASE DIMENSIONS
// =====================================================
export const corollaBaseDimensions = {
  length,
  halfLength,
  width: p.width,
  halfWidth,
  height,
  wheelbase: p.wheelbase,
  frontOverhang: p.frontOverhang,
  rearOverhang: p.rearOverhang,
  frontAxleX,
  rearAxleX,
  frontBumperX,
  rearBumperX,
  cabinLength,
  cabinCenterX,
  groundClearance: p.groundClearance,
  wheelRadius: p.wheelRadius,
  wheelWidth: p.wheelWidth,
} as const;

// =====================================================
// PAINT SURFACE (High-quality automotive PBR)
// =====================================================
export const corollaPaintSurface = {
  clearcoat: 0.85,
  clearcoatRoughness: 0.09,
  pearlStrength: 0.18,
  metalness: 0.24,
  roughness: 0.21,
  accentRoughness: 0.34,
  anisotropy: 0.35,           // Subtle directional highlight on paint
  envMapIntensity: 1.05,
  highlightStripColor: "#f8fafc",
  shadowCreaseColor: "#111827",
} as const;

// =====================================================
// MATERIALS (Enhanced with full PBR options)
// =====================================================
export const corollaMaterials = {
  body: {
    roughness: corollaPaintSurface.roughness,
    metalness: corollaPaintSurface.metalness,
    clearcoat: corollaPaintSurface.clearcoat,
    clearcoatRoughness: corollaPaintSurface.clearcoatRoughness,
    envMapIntensity: corollaPaintSurface.envMapIntensity,
  } satisfies PBRMaterialOptions,

  cabinBody: {
    roughness: 0.26,
    metalness: 0.16,
    clearcoat: 0.6,
    clearcoatRoughness: 0.12,
  } satisfies PBRMaterialOptions,

  blackTrim: {
    color: "#0b111c",
    roughness: 0.3,
    metalness: 0.08,
  } satisfies PBRMaterialOptions,

  glossBlack: {
    color: "#050505",
    roughness: 0.16,
    metalness: 0.02,
    clearcoat: 0.7,
  } satisfies PBRMaterialOptions,

  matteBlack: {
    color: "#070707",
    roughness: 0.68,
    metalness: 0,
  } satisfies PBRMaterialOptions,

  chrome: {
    color: "#d8d8d8",
    roughness: 0.14,
    metalness: 0.85,
    envMapIntensity: 1.3,
  } satisfies PBRMaterialOptions,

  glass: {
    color: "#1c2730",
    roughness: 0.04,
    metalness: 0.18,
    transparent: true,
    opacity: 0.78,
    transmission: 0.35,
    ior: 1.45,
  } satisfies PBRMaterialOptions,

  tire: {
    color: "#070707",
    roughness: 0.78,
    metalness: 0.05,
  } satisfies PBRMaterialOptions,

  clearLens: {
    color: "#eaf2ff",
    roughness: 0.04,
    metalness: 0.08,
    transparent: true,
    opacity: 0.72,
    transmission: 0.6,
  } satisfies PBRMaterialOptions,

  amberLens: {
    color: "#ff9a00",
    emissive: "#ea580c",
    emissiveIntensity: 0.7,
    transparent: true,
    opacity: 0.85,
  } satisfies PBRMaterialOptions,

  redLens: {
    color: "#b0000f",
    emissive: "#7f1d1d",
    emissiveIntensity: 0.85,
    transparent: true,
    opacity: 0.9,
  } satisfies PBRMaterialOptions,
} as const;

// =====================================================
// BODY VOLUMES
// =====================================================
export const corollaBodyVolumes = {
  mainBody: {
    position: [0, -0.03, 0] as Vec3,
    args: [length * 0.985, height * 0.84, halfWidth * 2.02] as Vec3,
    radius: 0.18,
  } satisfies BoxVisual,

  frontMass: {
    position: [frontAxleX * 0.72, 0.1, 0] as Vec3,
    args: [length * 0.29, height * 0.5, halfWidth * 1.92] as Vec3,
    radius: 0.13,
  } satisfies BoxVisual,

  rearMass: {
    position: [rearAxleX * 0.76, 0.07, 0] as Vec3,
    args: [length * 0.25, height * 0.46, halfWidth * 1.9] as Vec3,
    radius: 0.12,
  } satisfies BoxVisual,

  cabinShell: {
    position: [cabinCenterX * 0.08, height * 0.58, 0] as Vec3,
    args: [cabinLength * 1.04, height * 0.74, halfWidth * 1.68] as Vec3,
    radius: 0.14,
  } satisfies BoxVisual,

  hoodCrown: {
    position: [frontBumperX + p.frontOverhang * 0.42, height * 0.44, 0] as Vec3,
    args: [p.frontOverhang * 0.72, 0.035, halfWidth * 1.54] as Vec3,
    radius: 0.04,
  } satisfies BoxVisual,

  trunkDeck: {
    position: [rearBumperX - p.rearOverhang * 0.45, height * 0.44, 0] as Vec3,
    args: [p.rearOverhang * 0.62, 0.038, halfWidth * 1.55] as Vec3,
    radius: 0.04,
  } satisfies BoxVisual,

  lowerTrimY: -height * 0.72,
} as const;

// =====================================================
// WINDOWS & PILLARS
// =====================================================
export const corollaWindowProfile = {
  glassSideOffset: halfWidth * 1.105,
  windshield: {
    position: [cabinCenterX - cabinLength * 0.44, height * 0.98, 0] as Vec3,
    rotation: [0, 0, 0.14] as Vec3,
    args: [cabinLength * 0.45, 0.034, halfWidth * 1.2] as Vec3,
  },
  rearGlass: {
    position: [cabinCenterX + cabinLength * 0.36, height * 1.03, 0] as Vec3,
    rotation: [0, 0, -0.08] as Vec3,
    args: [cabinLength * 0.42, 0.034, halfWidth * 1.38] as Vec3,
  },
  sideWindows: [
    { x: cabinCenterX - cabinLength * 0.35, y: height * 0.75, w: cabinLength * 0.46, h: 0.34 },
    { x: cabinCenterX + cabinLength * 0.22, y: height * 0.77, w: cabinLength * 0.5, h: 0.37 },
    { x: cabinCenterX - cabinLength * 0.72, y: height * 0.71, w: 0.5, h: 0.24, rotationZ: -0.16 },
  ],
  pillars: [
    { x: cabinCenterX - cabinLength * 0.5, y: height * 0.54, w: 0.055, h: height * 0.84, rotationZ: -0.24 },
    { x: cabinCenterX - cabinLength * 0.02, y: height * 0.68, w: 0.04, h: height * 0.58, rotationZ: 0 },
    { x: cabinCenterX + cabinLength * 0.48, y: height * 0.5, w: 0.062, h: height * 0.76, rotationZ: 0.2 },
  ],
} as const;

// =====================================================
// CHARACTER LINES
// =====================================================
export const corollaCharacterLines = {
  beltlineY: height * 0.38,
  beltlineSegments: [
    { x: cabinCenterX - cabinLength * 0.35, length: cabinLength * 0.44 },
    { x: cabinCenterX + cabinLength * 0.26, length: cabinLength * 0.48 },
  ],
  rocker: {
    y: -height * 0.66,
    length: length * 0.88,
    height: 0.075,
    sideOffset: halfWidth * 1.08,
  },
  doorCuts: [
    { x: cabinCenterX - cabinLength * 0.03, heightRatio: 0.62 },
    { x: cabinCenterX + cabinLength * 0.48, heightRatio: 0.58 },
  ],
  handles: [
    { x: cabinCenterX - cabinLength * 0.26, y: height * 0.36 },
    { x: cabinCenterX + cabinLength * 0.28, y: height * 0.37 },
  ],
} as const;

// =====================================================
// LIGHTING PROFILE
// =====================================================
export const corollaLightingProfile = {
  front: {
    grille: {
      position: [frontBumperX + 0.22, -0.02, 0] as Vec3,
      args: [0.05, height * 0.13, halfWidth * 1.42] as Vec3,
    } satisfies BoxVisual,
    lowerIntake: {
      position: [frontBumperX + 0.28, -height * 0.15, 0] as Vec3,
      args: [0.04, height * 0.24, halfWidth * 1.48] as Vec3,
    } satisfies BoxVisual,
    chromeBar: {
      position: [frontBumperX + 0.31, height * 0.04, 0] as Vec3,
      args: [0.035, 0.055, halfWidth * 1.2] as Vec3,
    } satisfies BoxVisual,
    headlights: [
      { zSign: 1, position: [frontBumperX + 0.34, p.frontLightHeight, halfWidth * 0.66] as Vec3, rotationY: -0.18 },
      { zSign: -1, position: [frontBumperX + 0.34, p.frontLightHeight, -halfWidth * 0.66] as Vec3, rotationY: 0.18 },
    ],
    turnSignals: [
      { position: [frontBumperX + 0.36, p.frontLightHeight + 0.02, halfWidth * 0.96] as Vec3, rotationY: -0.28 },
      { position: [frontBumperX + 0.36, p.frontLightHeight + 0.02, -halfWidth * 0.96] as Vec3, rotationY: 0.28 },
    ],
  },
  rear: {
    bumper: {
      position: [rearBumperX - 0.14, -height * 0.1, 0] as Vec3,
      args: [0.075, height * 0.22, halfWidth * 1.6] as Vec3,
    } satisfies BoxVisual,
    taillights: [
      { position: [rearBumperX - 0.12, p.rearLightHeight, halfWidth * 0.64] as Vec3 },
      { position: [rearBumperX - 0.12, p.rearLightHeight, -halfWidth * 0.64] as Vec3 },
    ],
  },
} as const;

// =====================================================
// SMALL PARTS
// =====================================================
export const corollaSmallParts = {
  mirrors: {
    x: cabinCenterX - cabinLength * 0.64,
    y: height * 0.57,
    sideOffset: halfWidth * 1.28,
    baseSize: [0.12, 0.055, 0.1] as Vec3,
    capSize: [0.24, 0.13, 0.1] as Vec3,
  },
  antenna: {
    position: [cabinCenterX + cabinLength * 0.45, height * 1.1, 0] as Vec3,
    size: [0.035, 0.18, 0.035] as Vec3,
  },
  plate: {
    rearPosition: [rearBumperX - 0.175, height * 0.21, 0] as Vec3,
    size: [0.026, 0.16, 0.52] as Vec3,
  },
} as const;

// =====================================================
// MOTION & ANIMATION
// =====================================================
export const corollaMotionProfile = {
  rotation: [0, -0.52, 0] as Vec3,
  floatAmplitude: 0.018,
  floatSpeed: 1.55,
  continuousRotationSpeed: 0,
} as const;

// =====================================================
// MAIN EXPORT
// =====================================================
export const corollaVisualControls = {
  baseDimensions: corollaBaseDimensions,
  paintSurface: corollaPaintSurface,
  materials: corollaMaterials,
  bodyVolumes: corollaBodyVolumes,
  windows: corollaWindowProfile,
  characterLines: corollaCharacterLines,
  lighting: corollaLightingProfile,
  smallParts: corollaSmallParts,
  motion: corollaMotionProfile,
} as const;

// =====================================================
// TYPE HELPERS
// =====================================================
type BoxVisual = {
  position: Vec3;
  args: Vec3;
  radius?: number;
  material?: MaterialOptions;
};