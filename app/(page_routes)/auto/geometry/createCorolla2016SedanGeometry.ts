import {
  BufferGeometry,
  Float32BufferAttribute,
} from "three";
import type { CarDesignSchema } from "../auto-types";

type SourcePoint = {
  x: number;
  z: number;
};

type SourcePoint3 = {
  x: number;
  y: number;
  z: number;
};

type WidthStation = {
  x: number;
  halfWidth: number;
};

type SourceCurves = {
  hoodTop?: SourcePoint[];
  roofline?: SourcePoint[];
  trunkDeck?: SourcePoint[];
  rocker?: SourcePoint[];
  beltline?: SourcePoint[];
};

type SchemaDimensions = {
  wheelbase: number;
};

type SchemaCoordinateSystem = {
  xAnchorsMm?: {
    frontBumper?: number;
    rearBumper?: number;
  };
};

type SchemaTopViewProfile = {
  sourceHalfWidthStationsMm?: WidthStation[];
};

type SourceFrontEnd = {
  upperGrille: {
    center: SourcePoint3;
    widthMm: number;
    heightMm: number;
  };
  lowerIntake: {
    center: SourcePoint3;
    widthTopMm: number;
    widthBottomMm: number;
    heightMm: number;
  };
  bumper: {
    lowerLipZ: number;
  };
};

const crossSectionFactors = [-1, -0.72, -0.42, -0.16, 0, 0.16, 0.42, 0.72, 1] as const;
const panelWidthFactors = [-1, -0.52, 0, 0.52, 1] as const;
const hoodWidthFactors = [-1, -0.66, -0.33, 0, 0.33, 0.66, 1] as const;

const sortByX = <T extends { x: number }>(points: T[]) => [...points].sort((a, b) => a.x - b.x);
const clamp01 = (value: number) => Math.max(0, Math.min(1, value));
const smoothstep = (value: number) => {
  const t = clamp01(value);
  return t * t * (3 - 2 * t);
};

const samplePolyline = (points: SourcePoint[], x: number) => {
  const sorted = sortByX(points);

  if (x <= sorted[0].x) {
    return sorted[0].z;
  }

  for (let index = 1; index < sorted.length; index += 1) {
    const current = sorted[index];
    const previous = sorted[index - 1];

    if (x <= current.x) {
      const t = (x - previous.x) / (current.x - previous.x);
      return previous.z + (current.z - previous.z) * t;
    }
  }

  return sorted[sorted.length - 1].z;
};

const sampleWidth = (points: WidthStation[], x: number) => {
  const sorted = sortByX(points);

  if (x <= sorted[0].x) {
    return sorted[0].halfWidth;
  }

  for (let index = 1; index < sorted.length; index += 1) {
    const current = sorted[index];
    const previous = sorted[index - 1];

    if (x <= current.x) {
      const t = (x - previous.x) / (current.x - previous.x);
      const eased = smoothstep(t);
      return previous.halfWidth + (current.halfWidth - previous.halfWidth) * eased;
    }
  }

  return sorted[sorted.length - 1].halfWidth;
};

export function sourceXToWorldX(sourceX: number, schema: CarDesignSchema) {
  const dimensions = schema.dimensions as unknown as SchemaDimensions;
  return sourceX / 1000 - dimensions.wheelbase / 2;
}

export function sourceZToWorldY(sourceZ: number) {
  return sourceZ / 1000 - 0.82;
}

export function sourceYToWorldZ(sourceY: number) {
  return sourceY / 1000;
}

function makeGeometry(vertices: number[], indices: number[]) {
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(vertices, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  return geometry;
}

function getSourceCurves(schema: CarDesignSchema) {
  const curves = schema.silhouetteCurves.sourceCurvesMm as SourceCurves | undefined;

  if (!curves?.hoodTop || !curves.roofline || !curves.trunkDeck || !curves.rocker) {
    throw new Error("Corolla sedan body geometry requires hoodTop, roofline, trunkDeck, and rocker source curves.");
  }

  return curves;
}

function getWidthStations(schema: CarDesignSchema) {
  const topViewProfile = schema.topViewProfile as unknown as SchemaTopViewProfile;
  const stations = topViewProfile.sourceHalfWidthStationsMm;

  if (!stations || stations.length < 2) {
    throw new Error("Corolla sedan body geometry requires sourceHalfWidthStationsMm.");
  }

  return stations;
}

function getBodyAnchors(schema: CarDesignSchema, curves: SourceCurves, widthStations: WidthStation[]) {
  const coordinateSystem = schema.coordinateSystem as unknown as SchemaCoordinateSystem;
  const sortedWidth = sortByX(widthStations);
  const hood = sortByX(curves.hoodTop!);
  const trunk = sortByX(curves.trunkDeck!);

  return {
    frontBumperX: coordinateSystem.xAnchorsMm?.frontBumper ?? sortedWidth[0].x ?? hood[0].x,
    rearBumperX: coordinateSystem.xAnchorsMm?.rearBumper ?? sortedWidth[sortedWidth.length - 1].x ?? trunk[trunk.length - 1].x,
  };
}

function buildCenterStations(curves: SourceCurves, widthStations: WidthStation[], schema: CarDesignSchema) {
  const hood = sortByX(curves.hoodTop!);
  const roof = sortByX(curves.roofline!);
  const trunk = sortByX(curves.trunkDeck!);
  const rocker = sortByX(curves.rocker!);
  const { frontBumperX, rearBumperX } = getBodyAnchors(schema, curves, widthStations);
  const bodyLength = rearBumperX - frontBumperX;
  const minX = frontBumperX + bodyLength * 0.06;
  const maxX = frontBumperX + bodyLength * 0.94;
  const progressStations = [0.06, 0.09, 0.12, 0.18, 0.28, 0.4, 0.52, 0.64, 0.76, 0.84, 0.88, 0.91, 0.94];
  const allX = [
    ...hood.map((point) => point.x),
    ...roof.map((point) => point.x),
    ...trunk.map((point) => point.x),
    ...rocker.map((point) => point.x),
    ...widthStations.map((point) => point.x),
    ...progressStations.map((progress) => frontBumperX + bodyLength * progress),
  ];

  return [...new Set(allX.map((x) => Math.round(Math.max(minX, Math.min(maxX, x)))))]
    .sort((a, b) => a - b);
}

function sampleUpperProfile(curves: SourceCurves, sourceX: number) {
  const roofline = sortByX(curves.roofline!);
  const trunkDeck = sortByX(curves.trunkDeck!);
  const hoodTop = sortByX(curves.hoodTop!);

  if (sourceX < roofline[0].x) {
    return samplePolyline(hoodTop, sourceX);
  }

  if (sourceX <= roofline[roofline.length - 1].x) {
    return samplePolyline(roofline, sourceX);
  }

  if (sourceX >= trunkDeck[0].x) {
    return samplePolyline(trunkDeck, sourceX);
  }

  const roofEnd = roofline[roofline.length - 1];
  const trunkStart = trunkDeck[0];
  const t = smoothstep((sourceX - roofEnd.x) / (trunkStart.x - roofEnd.x));
  return roofEnd.z + (trunkStart.z - roofEnd.z) * t;
}

function sampleBeltline(curves: SourceCurves, sourceX: number, upperZ: number, rockerZ: number) {
  if (curves.beltline) {
    return samplePolyline(curves.beltline, sourceX);
  }

  // Adjusted default for more realistic 2016 Corolla beltline height (~57-58% of body side)
  return rockerZ + (upperZ - rockerZ) * 0.58;
}

function createCrossSectionRing({
  sourceX,
  upperZ,
  beltlineZ,
  rockerZ,
  halfWidthMm,
}: {
  sourceX: number;
  upperZ: number;
  beltlineZ: number;
  rockerZ: number;
  halfWidthMm: number;
}) {
  // More realistic roof crown/shoulder for compact sedan (gentler than previous extreme)
  const roofShoulderZ = upperZ - Math.max(18, (upperZ - beltlineZ) * 0.12);
  const shoulderZ = beltlineZ;
  // Slightly lower break point for more vertical lower body sides typical of Corolla
  const lowerShoulderZ = rockerZ + (shoulderZ - rockerZ) * 0.28;

  return crossSectionFactors.map((factor) => {
    const abs = Math.abs(factor);
    let z = rockerZ;
    let widthScale = 1;

    // === PROPORTION FIX FOR 2016 COROLLA REALISM ===
    // Previous version had extreme tapers (top 0.52, bottom down to 0.58) creating
    // unrealistic "pinched" or concept-car surfacing. Real Corolla has:
    // - Gentle roof tumblehome (~8-10° effective, roof shoulders ~10-12% narrower)
    // - Mostly straight body sides with subtle character lines
    // - Mild lower body tuck-in for rocker definition + wheel clearance (not drastic)
    // New scales keep width variation realistic for a production compact sedan.

    if (abs <= 0.18) {
      const local = smoothstep(abs / 0.18);
      z = upperZ + (roofShoulderZ - upperZ) * local;
      widthScale = 0.89; // Mild roof taper (was 0.52 - way too narrow)
    } else if (abs <= 0.45) {
      const local = smoothstep((abs - 0.18) / 0.27);
      z = roofShoulderZ + (shoulderZ - roofShoulderZ) * local;
      widthScale = 0.89 + 0.08 * local; // Gentle ramp to near-max width
    } else if (abs <= 0.75) {
      const local = smoothstep((abs - 0.45) / 0.30);
      z = shoulderZ + (lowerShoulderZ - shoulderZ) * local;
      widthScale = 0.97; // Nearly constant width for straight, realistic sides (was ~0.93)
    } else {
      const local = smoothstep((abs - 0.75) / 0.25);
      z = lowerShoulderZ + (rockerZ - lowerShoulderZ) * local;
      widthScale = 0.97 - 0.09 * local; // Gentle bottom reduction to ~0.88 (was drastic 0.58)
    }

    return [
      sourceX,
      factor * halfWidthMm * widthScale,
      z,
    ];
  });
}

function pushSourceVertex(vertices: number[], schema: CarDesignSchema, sourceX: number, sourceY: number, sourceZ: number) {
  vertices.push(
    sourceXToWorldX(sourceX, schema),
    sourceZToWorldY(sourceZ),
    sourceYToWorldZ(sourceY)
  );
}

function connectGrid(indices: number[], columns: number, rows: number) {
  for (let row = 0; row < rows - 1; row += 1) {
    for (let column = 0; column < columns - 1; column += 1) {
      const current = row * columns + column;
      const right = current + 1;
      const next = current + columns;
      const nextRight = next + 1;
      indices.push(current, next, nextRight, current, nextRight, right);
    }
  }
}

function createPanelGeometry({
  schema,
  points,
  widthMultiplier,
  centerCrownMm,
}: {
  schema: CarDesignSchema;
  points: SourcePoint[];
  widthMultiplier: number;
  centerCrownMm: number;
}) {
  const widthStations = getWidthStations(schema);
  const sourcePoints = sortByX(points);
  const vertices: number[] = [];
  const indices: number[] = [];

  sourcePoints.forEach((point) => {
    const halfWidth = sampleWidth(widthStations, point.x) * widthMultiplier;

    panelWidthFactors.forEach((factor) => {
      const crown = centerCrownMm * (1 - Math.abs(factor));
      const edgeDrop = Math.abs(factor) * 20;
      pushSourceVertex(vertices, schema, point.x, halfWidth * factor, point.z + crown - edgeDrop);
    });
  });

  connectGrid(indices, panelWidthFactors.length, sourcePoints.length);

  return makeGeometry(vertices, indices);
}

function createBumperGeometry({
  schema,
  front,
}: {
  schema: CarDesignSchema;
  front: boolean;
}) {
  if (front) {
    return createFrontBumperGeometry(schema);
  }

  return createRearBumperGeometry(schema);
}

function createFrontBumperGeometry(schema: CarDesignSchema) {
  const curves = getSourceCurves(schema);
  const widthStations = getWidthStations(schema);
  const { frontBumperX } = getBodyAnchors(schema, curves, widthStations);
  const frontEnd = schema.frontDesign.sourceFrontEndMm as SourceFrontEnd;
  const intake = frontEnd.lowerIntake;
  const grille = frontEnd.upperGrille;
  const centerWidth = sampleWidth(widthStations, frontBumperX + 420);
  const columns = [-1, -0.76, -0.42, 0, 0.42, 0.76, 1] as const;
  const intakeHeight = intake.heightMm * 0.46;
  const rows = [
    {
      x: frontBumperX + 96,
      z: grille.center.z + grille.heightMm * 0.42,
      halfWidth: centerWidth * 0.62,
    },
    {
      x: frontBumperX + 66,
      z: grille.center.z - grille.heightMm * 0.22,
      halfWidth: centerWidth * 0.68,
    },
    {
      x: frontBumperX + 78,
      z: intake.center.z + intakeHeight * 0.24,
      halfWidth: centerWidth * 0.64,
    },
    {
      x: frontBumperX + 96,
      z: intake.center.z - intakeHeight * 0.26,
      halfWidth: centerWidth * 0.58,
    },
    {
      x: frontBumperX + 126,
      z: frontEnd.bumper.lowerLipZ + 54,
      halfWidth: centerWidth * 0.48,
    },
  ];
  const vertices: number[] = [];
  const indices: number[] = [];

  rows.forEach((row) => {
    columns.forEach((factor) => {
      const abs = Math.abs(factor);
      const cornerInset = 62 * smoothstep((abs - 0.62) / 0.38);
      const centerInset = 8 * (1 - abs * abs);
      const y = row.halfWidth * factor * (1 - 0.12 * smoothstep((abs - 0.7) / 0.3));
      pushSourceVertex(vertices, schema, row.x + cornerInset + centerInset, y, row.z);
    });
  });

  connectGrid(indices, columns.length, rows.length);

  return makeGeometry(vertices, indices);
}

function createRearBumperGeometry(schema: CarDesignSchema) {
  const curves = getSourceCurves(schema);
  const widthStations = getWidthStations(schema);
  const { rearBumperX } = getBodyAnchors(schema, curves, widthStations);
  const centerWidth = sampleWidth(widthStations, rearBumperX - 260);
  const columns = [-1, -0.72, -0.38, 0, 0.38, 0.72, 1] as const;
  const trunkTop = samplePolyline(curves.trunkDeck!, rearBumperX - 180);
  const rockerZ = samplePolyline(curves.rocker!, rearBumperX - 120);
  const rows = [
    { x: rearBumperX - 120, z: trunkTop - 20, halfWidth: centerWidth * 0.74 },
    { x: rearBumperX - 48, z: trunkTop - 140, halfWidth: centerWidth * 0.82 },
    { x: rearBumperX - 36, z: rockerZ + 210, halfWidth: centerWidth * 0.78 },
    { x: rearBumperX - 90, z: rockerZ + 56, halfWidth: centerWidth * 0.58 },
  ];
  const vertices: number[] = [];
  const indices: number[] = [];

  rows.forEach((row) => {
    columns.forEach((factor) => {
      const abs = Math.abs(factor);
      const cornerInset = 36 * smoothstep((abs - 0.7) / 0.3);
      const centerRound = 10 * (1 - abs);
      const y = row.halfWidth * factor * (1 - 0.05 * smoothstep((abs - 0.72) / 0.28));
      pushSourceVertex(vertices, schema, row.x - cornerInset - centerRound, y, row.z);
    });
  });

  connectGrid(indices, columns.length, rows.length);

  return makeGeometry(vertices, indices);
}

function createSmoothHoodPanelGeometry(schema: CarDesignSchema, points: SourcePoint[]) {
  const widthStations = getWidthStations(schema);
  const sourcePoints = sortByX(points);
  const minX = sourcePoints[0].x;
  const maxX = sourcePoints[sourcePoints.length - 1].x;
  const vertices: number[] = [];
  const indices: number[] = [];

  sourcePoints.forEach((point) => {
    const lengthProgress = clamp01((point.x - minX) / (maxX - minX));
    const halfWidth = sampleWidth(widthStations, point.x) * (0.64 + 0.04 * lengthProgress);

    hoodWidthFactors.forEach((factor) => {
      const abs = Math.abs(factor);
      const subtleCrown = 6 * (1 - abs * abs);
      const softEdgeDrop = 8 * smoothstep(abs);
      const cowlLift = 3 * lengthProgress;

      pushSourceVertex(
        vertices,
        schema,
        point.x,
        halfWidth * factor,
        point.z + subtleCrown + cowlLift - softEdgeDrop
      );
    });
  });

  connectGrid(indices, hoodWidthFactors.length, sourcePoints.length);

  return makeGeometry(vertices, indices);
}

export function createSedanMainBodyGeometry(schema: CarDesignSchema): BufferGeometry {
  const curves = getSourceCurves(schema);
  const widthStations = getWidthStations(schema);
  const sourceXStations = buildCenterStations(curves, widthStations, schema);
  const vertices: number[] = [];
  const indices: number[] = [];
  const ringSize = crossSectionFactors.length;

  sourceXStations.forEach((sourceX) => {
    const upperZ = sampleUpperProfile(curves, sourceX);
    const rockerZ = samplePolyline(curves.rocker!, sourceX);
    const beltlineZ = sampleBeltline(curves, sourceX, upperZ, rockerZ);
    const halfWidthMm = sampleWidth(widthStations, sourceX);
    const ring = createCrossSectionRing({
      sourceX,
      upperZ,
      beltlineZ,
      rockerZ,
      halfWidthMm,
    });

    ring.forEach(([x, y, z]) => pushSourceVertex(vertices, schema, x, y, z));
  });

  for (let stationIndex = 0; stationIndex < sourceXStations.length - 1; stationIndex += 1) {
    const currentStart = stationIndex * ringSize;
    const nextStart = (stationIndex + 1) * ringSize;

    for (let pointIndex = 0; pointIndex < ringSize; pointIndex += 1) {
      const nextPoint = (pointIndex + 1) % ringSize;
      indices.push(
        currentStart + pointIndex,
        nextStart + pointIndex,
        nextStart + nextPoint,
        currentStart + pointIndex,
        nextStart + nextPoint,
        currentStart + nextPoint
      );
    }
  }

  return makeGeometry(vertices, indices);
}

export function createSedanFrontBumperGeometry(schema: CarDesignSchema): BufferGeometry {
  return createBumperGeometry({ schema, front: true });
}

export function createSedanRearBumperGeometry(schema: CarDesignSchema): BufferGeometry {
  return createBumperGeometry({ schema, front: false });
}

export function createSedanHoodPanelGeometry(schema: CarDesignSchema): BufferGeometry {
  const curves = getSourceCurves(schema);
  const { frontBumperX } = getBodyAnchors(schema, curves, getWidthStations(schema));
  const sourcePoints = sortByX(curves.hoodTop!).filter((point) => point.x > frontBumperX + 240);

  return createSmoothHoodPanelGeometry(schema, sourcePoints);
}

export function createSedanTrunkDeckGeometry(schema: CarDesignSchema): BufferGeometry {
  const curves = getSourceCurves(schema);
  return createPanelGeometry({
    schema,
    points: curves.trunkDeck!,
    widthMultiplier: 0.68,
    centerCrownMm: 7,
  });
}

export function createSedanBodyGeometry(schema: CarDesignSchema): BufferGeometry {
  return createSedanMainBodyGeometry(schema);
}
