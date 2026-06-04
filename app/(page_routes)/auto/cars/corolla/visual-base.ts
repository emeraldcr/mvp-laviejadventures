import {
  corollaBlockoutConfig,
  corollaVisualSource,
} from "./source";

export const corollaVisualParams = {
  wheelbase: corollaBlockoutConfig.dimensionsM.wheelbase,
  overallLength: corollaBlockoutConfig.dimensionsM.overallLength,
  width: corollaBlockoutConfig.dimensionsM.overallWidth,
  bodyHeight: corollaBlockoutConfig.dimensionsM.visualHeight,
  frontOverhang: corollaBlockoutConfig.dimensionsM.frontOverhang,
  rearOverhang: corollaBlockoutConfig.dimensionsM.rearOverhang,
  groundClearance: corollaVisualSource.groundClearance,
  wheelRadius: corollaBlockoutConfig.sceneMm.wheels.radius / 1000,
  wheelWidth: corollaBlockoutConfig.sceneMm.wheels.width / 1000,
  cabinLengthRatio: corollaVisualSource.cabinLengthRatio,
  frontLightHeight: corollaVisualSource.frontLightHeight,
  rearLightHeight: corollaVisualSource.rearLightHeight,
  bodyTaper: corollaVisualSource.bodyTaper,
  roofCurve: corollaVisualSource.roofCurve,
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

export const corollaVisualDerived = {
  p,
  length,
  halfLength,
  halfWidth,
  height,
  frontAxleX,
  rearAxleX,
  frontBumperX,
  rearBumperX,
  cabinLength,
  cabinCenterX,
} as const;
