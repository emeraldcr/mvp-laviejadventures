import type { PBRMaterialOptions } from "../../auto-types";
import { corollaBlockoutConfig } from "./source";

export const corollaPaintSurface = {
  clearcoat: 0.85,
  clearcoatRoughness: 0.09,
  pearlStrength: 0.16,
  metalness: 0.16,
  roughness: 0.24,
  accentRoughness: 0.34,
  anisotropy: 0.22,
  envMapIntensity: 1.05,
  highlightStripColor: "#f8fafc",
  shadowCreaseColor: "#111827",
} as const;

export const corollaMaterials = {
  body: {
    ...corollaBlockoutConfig.materials.body,
    clearcoat: corollaPaintSurface.clearcoat,
    clearcoatRoughness: corollaPaintSurface.clearcoatRoughness,
    envMapIntensity: corollaPaintSurface.envMapIntensity,
  } satisfies PBRMaterialOptions,

  cabinBody: {
    color: corollaBlockoutConfig.materials.body.color,
    roughness: 0.28,
    metalness: 0.12,
    clearcoat: 0.6,
    clearcoatRoughness: 0.12,
  } satisfies PBRMaterialOptions,

  blackTrim: {
    color: "#111827",
    roughness: 0.38,
    metalness: 0.04,
  } satisfies PBRMaterialOptions,

  glossBlack: {
    color: "#050505",
    roughness: 0.18,
    metalness: 0.02,
    clearcoat: 0.7,
  } satisfies PBRMaterialOptions,

  matteBlack: {
    color: "#111111",
    roughness: 0.72,
    metalness: 0,
  } satisfies PBRMaterialOptions,

  chrome: {
    color: "#d8d8d8",
    roughness: 0.16,
    metalness: 0.78,
    envMapIntensity: 1.2,
  } satisfies PBRMaterialOptions,

  glass: {
    color: corollaBlockoutConfig.materials.glass.color,
    roughness: 0.045,
    metalness: 0.08,
    transparent: corollaBlockoutConfig.materials.glass.transparent,
    opacity: corollaBlockoutConfig.materials.glass.opacity,
    transmission: 0.28,
    ior: 1.45,
  } satisfies PBRMaterialOptions,

  tire: {
    color: corollaBlockoutConfig.materials.tire.color,
    roughness: corollaBlockoutConfig.materials.tire.roughness,
    metalness: 0.02,
  } satisfies PBRMaterialOptions,

  rim: {
    color: corollaBlockoutConfig.materials.rim.color,
    roughness: corollaBlockoutConfig.materials.rim.roughness,
    metalness: corollaBlockoutConfig.materials.rim.metalness,
    envMapIntensity: 1.1,
  } satisfies PBRMaterialOptions,

  clearLens: {
    color: "#f6fbff",
    roughness: 0.045,
    metalness: 0.05,
    transparent: true,
    opacity: 0.72,
    transmission: 0.45,
  } satisfies PBRMaterialOptions,

  amberLens: {
    color: "#ff9a00",
    emissive: "#ea580c",
    emissiveIntensity: 0.42,
    transparent: true,
    opacity: 0.82,
  } satisfies PBRMaterialOptions,

  redLens: {
    color: "#c1121f",
    emissive: "#7f1d1d",
    emissiveIntensity: 0.55,
    transparent: true,
    opacity: 0.9,
  } satisfies PBRMaterialOptions,
} as const;
