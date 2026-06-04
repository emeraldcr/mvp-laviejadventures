import type { MaterialOptions, Vec3, PBRMaterialOptions } from "../../auto-types";

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
    color: "#9fb8d8",
    roughness: 0.08,
    metalness: 0.1,
    transparent: true,
    opacity: 0.65,
    transmission: 0.28,
    ior: 1.45,
    envMapIntensity: 1.8,
    clearcoat: 0.4,
    clearcoatRoughness: 0.1,
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
    // Lower sedan body, not full vehicle height
    position: [0, 0.27, 0] as Vec3,
    args: [length * 0.98, 0.72, halfWidth * 1.96] as Vec3,
    radius: 0.16,
  } satisfies BoxVisual,

  frontMass: {
    // Lower, longer, flatter hood/front section
    position: [frontAxleX - p.frontOverhang * 0.2, 0.42, 0] as Vec3,
    args: [p.frontOverhang * 1.18, 0.26, halfWidth * 1.78] as Vec3,
    radius: 0.12,
  } satisfies BoxVisual,

  rearMass: {
    // Sedan trunk: flatter and lower than cabin
    position: [rearAxleX + p.rearOverhang * 0.36, 0.46, 0] as Vec3,
    args: [p.rearOverhang * 1.0, 0.28, halfWidth * 1.78] as Vec3,
    radius: 0.11,
  } satisfies BoxVisual,

  cabinShell: {
    // Shorter, lower, narrower cabin
    position: [cabinCenterX + 0.04, 0.91, 0] as Vec3,
    args: [cabinLength * 0.9, 0.48, halfWidth * 1.42] as Vec3,
    radius: 0.14,
  } satisfies BoxVisual,

  hoodCrown: {
    // Thin sloped hood surface
    position: [frontAxleX - p.frontOverhang * 0.35, 0.58, 0] as Vec3,
    args: [p.frontOverhang * 0.9, 0.026, halfWidth * 1.38] as Vec3,
    radius: 0.035,
  } satisfies BoxVisual,

  trunkDeck: {
    // Thin rear deck, lower than roof
    position: [rearAxleX + p.rearOverhang * 0.42, 0.61, 0] as Vec3,
    args: [p.rearOverhang * 0.66, 0.024, halfWidth * 1.36] as Vec3,
    radius: 0.035,
  } satisfies BoxVisual,

  lowerTrimY: -0.08,
} as const;

// =====================================================
// PROCEDURAL BODY SHELL
// =====================================================
export const corollaBodyShell = {
  sideSilhouette: [
    { x: frontBumperX, rockerY: -0.56, beltY: 0.36, roofY: 0.48 },
    { x: frontAxleX - 0.62, rockerY: -0.5, beltY: 0.46, roofY: 0.58 },
    { x: frontAxleX - 0.08, rockerY: -0.47, beltY: 0.58, roofY: 0.68 },
    { x: frontAxleX + 0.42, rockerY: -0.45, beltY: 0.68, roofY: 0.9 },
    { x: cabinCenterX - 0.46, rockerY: -0.44, beltY: 0.72, roofY: 1.18 },
    { x: cabinCenterX, rockerY: -0.43, beltY: 0.74, roofY: 1.28 },
    { x: cabinCenterX + 0.48, rockerY: -0.43, beltY: 0.76, roofY: 1.2 },
    { x: rearAxleX - 0.15, rockerY: -0.45, beltY: 0.73, roofY: 0.88 },
    { x: rearAxleX + 0.44, rockerY: -0.48, beltY: 0.68, roofY: 0.66 },
    { x: rearBumperX - 0.24, rockerY: -0.52, beltY: 0.5, roofY: 0.52 },
    { x: rearBumperX, rockerY: -0.58, beltY: 0.36, roofY: 0.42 },
  ],
  widthProfile: [
    { x: frontBumperX, halfWidth: halfWidth * 0.58 },
    { x: frontAxleX - 0.55, halfWidth: halfWidth * 0.78 },
    { x: frontAxleX + 0.2, halfWidth: halfWidth * 0.95 },
    { x: cabinCenterX - 0.35, halfWidth: halfWidth * 1.0 },
    { x: cabinCenterX + 0.45, halfWidth: halfWidth * 0.99 },
    { x: rearAxleX + 0.2, halfWidth: halfWidth * 0.94 },
    { x: rearBumperX - 0.25, halfWidth: halfWidth * 0.76 },
    { x: rearBumperX, halfWidth: halfWidth * 0.6 },
  ],
  cabinGlasshouse: {
    startX: cabinCenterX - 0.72,
    peakX: cabinCenterX,
    endX: cabinCenterX + 0.72,
    insetWidthMultiplier: 0.78,
  },
} as const;

// =====================================================
// WINDOWS & PILLARS - VERSIÓN AJUSTADA (más realista)
// =====================================================
export const corollaWindowProfile = {
  glassSideOffset: halfWidth * 1.05,

  windshield: {
    position: [cabinCenterX - cabinLength * 0.42, 1.08, 0] as Vec3,
    rotation: [0, 0, 0.26] as Vec3,
    args: [cabinLength * 0.38, 0.028, halfWidth * 1.08] as Vec3, // un poco más ancho y grueso
  },

  rearGlass: {
    position: [cabinCenterX + cabinLength * 0.38, 1.07, 0] as Vec3,
    rotation: [0, 0, -0.24] as Vec3,
    args: [cabinLength * 0.40, 0.028, halfWidth * 1.06] as Vec3,
  },

  sideWindows: [
    {
      // Ventana delantera (puerta 1)
      x: cabinCenterX - cabinLength * 0.27,
      y: 0.96,
      w: cabinLength * 0.43,
      h: 0.33,           // ← más alta (antes 0.24)
      rotationZ: -0.02,
    },
    {
      // Ventana trasera (puerta 2)
      x: cabinCenterX + cabinLength * 0.20,
      y: 0.96,
      w: cabinLength * 0.45,
      h: 0.33,           // ← más alta
      rotationZ: 0.01,
    },
    {
      // Ventanilla trasera pequeña (quarter window)
      x: cabinCenterX + cabinLength * 0.58,
      y: 0.98,
      w: 0.24,
      h: 0.22,
      rotationZ: 0.12,
    },
  ],

  pillars: [
    {
      // Pilar A (delantero)
      x: cabinCenterX - cabinLength * 0.47,
      y: 0.95,
      w: 0.032,          // ← un poco más ancho
      h: 0.42,
      rotationZ: -0.26,
    },
    {
      // Pilar B (medio)
      x: cabinCenterX - cabinLength * 0.025,
      y: 0.95,
      w: 0.030,
      h: 0.40,
      rotationZ: 0,
    },
    {
      // Pilar C (trasero)
      x: cabinCenterX + cabinLength * 0.48,
      y: 0.94,
      w: 0.034,
      h: 0.42,
      rotationZ: 0.23,
    },
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
  bodyShell: corollaBodyShell,
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
