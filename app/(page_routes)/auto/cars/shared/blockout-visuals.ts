import type { BlockoutVisualControls } from "./blockout-types";

export const baseBlockoutVisualControls = {
  materials: {
    body: {
      color: "#8b949c",
      roughness: 0.24,
      metalness: 0.16,
      clearcoat: 0.85,
      clearcoatRoughness: 0.09,
      envMapIntensity: 1.05,
    },
    glass: {
      color: "#7f9db3",
      roughness: 0.045,
      metalness: 0.08,
      transparent: true,
      opacity: 0.65,
      transmission: 0.28,
      ior: 1.45,
    },
    tire: {
      color: "#111111",
      roughness: 0.62,
      metalness: 0.02,
    },
    clearLens: {
      color: "#f6fbff",
      roughness: 0.045,
      metalness: 0.05,
      transparent: true,
      opacity: 0.72,
      transmission: 0.45,
    },
    redLens: {
      color: "#c1121f",
      emissive: "#7f1d1d",
      emissiveIntensity: 0.55,
      transparent: true,
      opacity: 0.9,
    },
    blackTrim: {
      color: "#111827",
      roughness: 0.38,
      metalness: 0.04,
    },
    glossBlack: {
      color: "#050505",
      roughness: 0.18,
      metalness: 0.02,
      clearcoat: 0.7,
    },
    matteBlack: {
      color: "#111111",
      roughness: 0.72,
      metalness: 0,
    },
  },
  motion: {
    rotation: [0, -0.52, 0],
  },
} satisfies BlockoutVisualControls;
