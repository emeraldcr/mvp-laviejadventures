import type { Accessory, CarParams, CarDesignSchema, Vec3 } from "./auto-types";

// =====================================================
// IMPROVED: computeCarMetrics (more complete + schema-aware)
// =====================================================

export function computeCarMetrics(
  params: CarParams,
  designSchema?: CarDesignSchema
) {
  const {
    wheelbase,
    overallLength,
    frontOverhang,
    rearOverhang,
    width,
    bodyHeight,
    roofHeight,
    cabinLengthRatio,
    scale = 1,
    frontLightHeight,
    rearLightHeight,
  } = params;

  const s = scale;
  const clamp01 = (value: number) => Math.max(0, Math.min(1, value));
  const totalLength = overallLength * s;

  // === Axle & bumper positions, centered around the vehicle midpoint ===
  const frontAxleX = (-wheelbase / 2) * s;
  const rearAxleX = (wheelbase / 2) * s;
  const frontBumperX = frontAxleX - frontOverhang * s;
  const rearBumperX = rearAxleX + rearOverhang * s;
  const centerX = 0;

  // === Cabin ===
  const cabinLength = wheelbase * cabinLengthRatio * s;
  const cabinCenterX = frontAxleX + (wheelbase * 0.5) * s;

  // === Half width (for side positioning) ===
  const halfWidth = (width / 2) * s;

  const xFromSourceMm = (sourceX: number) => {
    return (sourceX / 1000 - frontOverhang - wheelbase / 2) * s;
  };

  const yFromSourceMm = (sourceZ: number) => (sourceZ / 1000) * s;

  const makeCurveSampler = (points?: Array<{ x: number; z: number }>) => {
    if (!points || points.length === 0) {
      return undefined;
    }

    const sorted = points
      .map((point) => ({
        x: xFromSourceMm(point.x),
        y: yFromSourceMm(point.z),
      }))
      .sort((a, b) => a.x - b.x);

    return (x: number) => {
      if (x <= sorted[0].x) {
        return sorted[0].y;
      }

      for (let index = 1; index < sorted.length; index += 1) {
        const current = sorted[index];
        const previous = sorted[index - 1];

        if (x <= current.x) {
          const t = (x - previous.x) / (current.x - previous.x);
          return previous.y + (current.y - previous.y) * clamp01(t);
        }
      }

      return sorted[sorted.length - 1].y;
    };
  };

  const sourceCurves = designSchema?.silhouetteCurves.sourceCurvesMm as
    | {
        roofline?: Array<{ x: number; z: number }>;
        beltline?: Array<{ x: number; z: number }>;
        rocker?: Array<{ x: number; z: number }>;
      }
    | undefined;

  const sampleSchemaRoof = makeCurveSampler(sourceCurves?.roofline);
  const sampleSchemaBeltline = makeCurveSampler(sourceCurves?.beltline);
  const sampleSchemaRocker = makeCurveSampler(sourceCurves?.rocker);

  const getRoofY = (x: number): number => {
    const schemaY = sampleSchemaRoof?.(x);
    if (schemaY !== undefined) {
      return schemaY;
    }

    const t = (x - frontBumperX) / (rearBumperX - frontBumperX);
    const base = bodyHeight + roofHeight * 0.15;
    const peak = bodyHeight + roofHeight;

    const cabinPeak = peak * Math.pow(
      Math.sin(
        Math.PI * clamp01((t - 0.22) / (cabinLengthRatio + 0.15))
      ),
      params.roofCurve
    );

    const taper = 1 - params.bodyTaper * Math.max(0, (frontBumperX - x) / frontOverhang) * 0.6;

    return (base + cabinPeak) * taper * s;
  };

  // =====================================================
  // NEW: More useful samplers for realistic 3D
  // =====================================================

  const getBeltlineY = (x: number): number => {
    const schemaY = sampleSchemaBeltline?.(x);
    if (schemaY !== undefined) {
      return schemaY;
    }

    const t = (x - frontBumperX) / (rearBumperX - frontBumperX);
    const startY = bodyHeight * 0.62;
    const endY = bodyHeight * 0.72;
    return (startY + (endY - startY) * Math.pow(clamp01(t), 0.7)) * s;
  };

  const getRockerY = (x: number): number => {
    const schemaY = sampleSchemaRocker?.(x);
    if (schemaY !== undefined) {
      return schemaY;
    }

    return bodyHeight * 0.18 * s;
  };

  // =====================================================
  // NEW: Wheel positions (critical for realistic placement)
  // =====================================================
  const wheelRadius = params.wheelRadius * s;
  const wheelWidth = params.wheelWidth * s;

  const frontWheelLeft: Vec3 = [frontAxleX, wheelRadius, -halfWidth * 0.92];
  const frontWheelRight: Vec3 = [frontAxleX, wheelRadius, halfWidth * 0.92];
  const rearWheelLeft: Vec3 = [rearAxleX, wheelRadius, -halfWidth * 0.92];
  const rearWheelRight: Vec3 = [rearAxleX, wheelRadius, halfWidth * 0.92];

  // =====================================================
  // NEW: Light positions (for realistic headlight/taillight placement)
  // =====================================================
  const frontLightY = frontLightHeight * s;
  const rearLightY = rearLightHeight * s;

  const headlightLeft: Vec3 = [frontBumperX + 0.35 * s, frontLightY, -halfWidth * 0.65];
  const headlightRight: Vec3 = [frontBumperX + 0.35 * s, frontLightY, halfWidth * 0.65];

  const taillightLeft: Vec3 = [rearBumperX - 0.25 * s, rearLightY, -halfWidth * 0.6];
  const taillightRight: Vec3 = [rearBumperX - 0.25 * s, rearLightY, halfWidth * 0.6];

  // =====================================================
  // Return expanded metrics
  // =====================================================
  return {
    // Original values (kept for compatibility)
    frontAxleX,
    rearAxleX,
    frontBumperX,
    rearBumperX,
    centerX,
    getRoofY,
    cabinLength,
    cabinCenterX,
    halfWidth,
    overallLength: totalLength,
    bodyLength: totalLength,
    effectiveHeight: bodyHeight * s,

    // === NEW useful values for realistic 3D ===
    wheelRadius,
    wheelWidth,
    frontWheelLeft,
    frontWheelRight,
    rearWheelLeft,
    rearWheelRight,

    headlightLeft,
    headlightRight,
    taillightLeft,
    taillightRight,

    getBeltlineY,
    getRockerY,

    // Future: can expose sampled curves from designSchema here
    hasDetailedSchema: !!designSchema,
    scale: s,
  };
}

export type CarMetrics = ReturnType<typeof computeCarMetrics>;

// =====================================================
// Your existing helpers (unchanged)
// =====================================================

export function cubicBezier(t: number, p0: number, p1: number, p2: number, p3: number): number {
  const u = 1 - t;
  return u * u * u * p0 + 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t * p3;
}

export function accessoryLineTotal(item: Accessory, withInstall: boolean) {
  return item.price + (withInstall ? item.install : 0);
}
