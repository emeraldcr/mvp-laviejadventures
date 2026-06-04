import {
  BufferGeometry,
  Float32BufferAttribute,
} from "three";
import type { CarDesignSchema } from "../../auto-types";
import {
  corollaBlockoutConfig,
  corollaGeometryBuilderConfig,
} from "./source";

type SourcePoint3 = {
  x: number;
  y: number;
  z: number;
};

type SchemaDimensions = {
  wheelbase: number;
};

type BodyStation = {
  x: number;
  topZ: number;
  bottomZ: number;
  halfWidth: number;
};

type PanelStation = {
  x: number;
  z: number;
  halfWidth: number;
};

const {
  panelFactors,
  faceFactors,
  bodySideInsetMm,
  bodyArchMidMinZ,
  bodyArchMidBaseZ,
  bodyArchTopGapMm,
  bodyArchMidLiftMm,
  defaultBumperCrownMm,
  defaultBumperEdgeDropMm,
  hoodCrownMm,
  hoodEdgeDropMm,
  trunkCrownMm,
  trunkEdgeDropMm,
  frontBumper: frontBumperBuildConfig,
} = corollaGeometryBuilderConfig;
const {
  mainBodyStations,
  hoodStations,
  trunkStations,
  frontBumperStations,
  rearBumperStations,
  wheelArchCentersX,
  wheelCenterZ,
  wheelArchRadius,
} = corollaBlockoutConfig.geometryMm;

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

function pushSourceVertex(vertices: number[], schema: CarDesignSchema, point: SourcePoint3) {
  vertices.push(
    sourceXToWorldX(point.x, schema),
    sourceZToWorldY(point.z),
    sourceYToWorldZ(point.y)
  );
}

function makeGeometry(vertices: number[], indices: number[]) {
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(vertices, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  return geometry;
}

function addQuad(indices: number[], a: number, b: number, c: number, d: number) {
  indices.push(a, b, c, a, c, d);
}

function addGrid(vertices: number[], indices: number[], schema: CarDesignSchema, rows: SourcePoint3[][]) {
  const rowCount = rows.length;
  const columnCount = rows[0]?.length ?? 0;
  const start = vertices.length / 3;

  rows.forEach((row) => row.forEach((point) => pushSourceVertex(vertices, schema, point)));

  for (let rowIndex = 0; rowIndex < rowCount - 1; rowIndex += 1) {
    for (let columnIndex = 0; columnIndex < columnCount - 1; columnIndex += 1) {
      const current = start + rowIndex * columnCount + columnIndex;
      addQuad(indices, current, current + columnCount, current + columnCount + 1, current + 1);
    }
  }
}

function getWheelArchBottomZ(sourceX: number, fallbackZ: number) {
  const archZ = wheelArchCentersX.reduce((highestZ, centerX) => {
    const distanceX = Math.abs(sourceX - centerX);

    if (distanceX >= wheelArchRadius) {
      return highestZ;
    }

    const archHeight = Math.sqrt(wheelArchRadius * wheelArchRadius - distanceX * distanceX);
    return Math.max(highestZ, wheelCenterZ + archHeight);
  }, fallbackZ);

  return Math.max(fallbackZ, archZ);
}

function createMainBodyTop(stations: readonly BodyStation[]) {
  return stations.map((station) => (
    panelFactors.map((factor) => ({
      x: station.x,
      y: factor * station.halfWidth,
      z: station.topZ,
    }))
  ));
}

function createMainBodySide(stations: readonly BodyStation[], side: 1 | -1) {
  return stations.map((station) => {
    const lowerZ = getWheelArchBottomZ(station.x, station.bottomZ);
    const hasArchOpening = lowerZ > bodyArchMidBaseZ;
    const midZ = hasArchOpening
      ? Math.min(station.topZ - bodyArchTopGapMm, lowerZ + bodyArchMidLiftMm)
      : bodyArchMidBaseZ;

    return [
      { x: station.x, y: side * (station.halfWidth - bodySideInsetMm), z: lowerZ },
      { x: station.x, y: side * station.halfWidth, z: Math.max(bodyArchMidMinZ, midZ) },
      { x: station.x, y: side * station.halfWidth, z: station.topZ },
    ];
  });
}

function createMainBodyFace(station: BodyStation) {
  const zRows = [station.bottomZ, 420, station.topZ];

  return zRows.map((z) => (
    faceFactors.map((factor) => ({
      x: station.x,
      y: factor * station.halfWidth,
      z,
    }))
  ));
}

function createPanelRows(stations: readonly PanelStation[], crownMm: number, edgeDropMm: number) {
  return stations.map((station) => (
    panelFactors.map((factor) => {
      const abs = Math.abs(factor);

      return {
        x: station.x,
        y: factor * station.halfWidth,
        z: station.z + crownMm * (1 - abs * abs) - edgeDropMm * abs,
      };
    })
  ));
}

function createBoxLikeBody(schema: CarDesignSchema) {
  const vertices: number[] = [];
  const indices: number[] = [];

  addGrid(vertices, indices, schema, createMainBodyTop(mainBodyStations));
  addGrid(vertices, indices, schema, createMainBodySide(mainBodyStations, -1));
  addGrid(vertices, indices, schema, createMainBodySide(mainBodyStations, 1));
  addGrid(vertices, indices, schema, createMainBodyFace(mainBodyStations[0]));
  addGrid(vertices, indices, schema, createMainBodyFace(mainBodyStations[mainBodyStations.length - 1]));

  return makeGeometry(vertices, indices);
}

function createQuadPanel(schema: CarDesignSchema, stations: readonly PanelStation[], crownMm: number, edgeDropMm: number) {
  const vertices: number[] = [];
  const indices: number[] = [];

  addGrid(vertices, indices, schema, createPanelRows(stations, crownMm, edgeDropMm));

  return makeGeometry(vertices, indices);
}

function createSimpleBumper(schema: CarDesignSchema, stations: readonly PanelStation[]) {
  return createQuadPanel(schema, stations, defaultBumperCrownMm, defaultBumperEdgeDropMm);
}

function createFrontBumperRows(stations: readonly PanelStation[]) {
  return stations.map((station, rowIndex) => (
    panelFactors.map((factor) => {
      const abs = Math.abs(factor);
      const cornerRetreatMm = frontBumperBuildConfig.cornerRetreatMm * abs * abs;
      const shoulderSoftnessMm = rowIndex === 0
        ? frontBumperBuildConfig.topShoulderSoftnessMm
        : rowIndex === stations.length - 1
          ? frontBumperBuildConfig.bottomShoulderSoftnessMm
          : frontBumperBuildConfig.middleShoulderSoftnessMm;
      const crownMm = frontBumperBuildConfig.crownMm * (1 - abs * abs);

      return {
        x: station.x + cornerRetreatMm + shoulderSoftnessMm * abs,
        y: factor * station.halfWidth,
        z: station.z + crownMm - frontBumperBuildConfig.edgeDropMm * abs,
      };
    })
  ));
}

function createRoundedFrontBumper(schema: CarDesignSchema, stations: readonly PanelStation[]) {
  const vertices: number[] = [];
  const indices: number[] = [];

  addGrid(vertices, indices, schema, createFrontBumperRows(stations));

  return makeGeometry(vertices, indices);
}

export function createSedanMainBodyGeometry(schema: CarDesignSchema): BufferGeometry {
  return createBoxLikeBody(schema);
}

export function createSedanFrontBumperGeometry(schema: CarDesignSchema): BufferGeometry {
  return createRoundedFrontBumper(schema, frontBumperStations);
}

export function createSedanRearBumperGeometry(schema: CarDesignSchema): BufferGeometry {
  return createSimpleBumper(schema, rearBumperStations);
}

export function createSedanHoodPanelGeometry(schema: CarDesignSchema): BufferGeometry {
  return createQuadPanel(schema, hoodStations, hoodCrownMm, hoodEdgeDropMm);
}

export function createSedanTrunkDeckGeometry(schema: CarDesignSchema): BufferGeometry {
  return createQuadPanel(schema, trunkStations, trunkCrownMm, trunkEdgeDropMm);
}

export function createSedanBodyGeometry(schema: CarDesignSchema): BufferGeometry {
  return createSedanMainBodyGeometry(schema);
}
