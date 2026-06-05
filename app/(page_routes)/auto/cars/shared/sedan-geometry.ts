import {
  BufferGeometry,
  Float32BufferAttribute,
} from "three";
import type { CarDesignSchema } from "../../auto-types";
import type {
  BlockoutGeometryMm as GeometryMm,
  BodyStation,
  GeometryBuilderConfig,
  PanelStation,
  SourcePoint3,
} from "./blockout-types";

type SchemaDimensions = {
  wheelbase: number;
};

type GeometryBuildOptions = {
  geometryMm: GeometryMm;
  builderConfig: GeometryBuilderConfig;
};

function getGeometryBuildContext(options: GeometryBuildOptions) {
  return {
    geometryMm: options.geometryMm,
    builderConfig: options.builderConfig,
  };
}

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

function getWheelArchBottomZ(sourceX: number, fallbackZ: number, geometryMm: GeometryMm) {
  const archZ = geometryMm.wheelArchCentersX.reduce((highestZ, centerX) => {
    const distanceX = Math.abs(sourceX - centerX);

    if (distanceX >= geometryMm.wheelArchRadius) {
      return highestZ;
    }

    const archHeight = Math.sqrt(geometryMm.wheelArchRadius * geometryMm.wheelArchRadius - distanceX * distanceX);
    return Math.max(highestZ, geometryMm.wheelCenterZ + archHeight);
  }, fallbackZ);

  return Math.max(fallbackZ, archZ);
}

function createMainBodyTop(stations: readonly BodyStation[], builderConfig: GeometryBuilderConfig) {
  return stations.map((station) => (
    builderConfig.panelFactors.map((factor) => ({
      x: station.x,
      y: factor * station.halfWidth,
      z: station.topZ,
    }))
  ));
}

function createMainBodySide(
  stations: readonly BodyStation[],
  side: 1 | -1,
  geometryMm: GeometryMm,
  builderConfig: GeometryBuilderConfig
) {
  return stations.map((station) => {
    const lowerZ = getWheelArchBottomZ(station.x, station.bottomZ, geometryMm);
    const hasArchOpening = lowerZ > builderConfig.bodyArchMidBaseZ;
    const midZ = hasArchOpening
      ? Math.min(station.topZ - builderConfig.bodyArchTopGapMm, lowerZ + builderConfig.bodyArchMidLiftMm)
      : builderConfig.bodyArchMidBaseZ;

    return [
      { x: station.x, y: side * (station.halfWidth - builderConfig.bodySideInsetMm), z: lowerZ },
      { x: station.x, y: side * station.halfWidth, z: Math.max(builderConfig.bodyArchMidMinZ, midZ) },
      { x: station.x, y: side * station.halfWidth, z: station.topZ },
    ];
  });
}

function createMainBodyFace(station: BodyStation, builderConfig: GeometryBuilderConfig) {
  const zRows = [station.bottomZ, 420, station.topZ];

  return zRows.map((z) => (
    builderConfig.faceFactors.map((factor) => ({
      x: station.x,
      y: factor * station.halfWidth,
      z,
    }))
  ));
}

function createPanelRows(
  stations: readonly PanelStation[],
  crownMm: number,
  edgeDropMm: number,
  builderConfig: GeometryBuilderConfig
) {
  return stations.map((station) => (
    builderConfig.panelFactors.map((factor) => {
      const abs = Math.abs(factor);

      return {
        x: station.x,
        y: factor * station.halfWidth,
        z: station.z + crownMm * (1 - abs * abs) - edgeDropMm * abs,
      };
    })
  ));
}

function createBoxLikeBody(schema: CarDesignSchema, geometryMm: GeometryMm, builderConfig: GeometryBuilderConfig) {
  const vertices: number[] = [];
  const indices: number[] = [];
  const { mainBodyStations } = geometryMm;

  addGrid(vertices, indices, schema, createMainBodyTop(mainBodyStations, builderConfig));
  addGrid(vertices, indices, schema, createMainBodySide(mainBodyStations, -1, geometryMm, builderConfig));
  addGrid(vertices, indices, schema, createMainBodySide(mainBodyStations, 1, geometryMm, builderConfig));
  addGrid(vertices, indices, schema, createMainBodyFace(mainBodyStations[0], builderConfig));
  addGrid(vertices, indices, schema, createMainBodyFace(mainBodyStations[mainBodyStations.length - 1], builderConfig));

  return makeGeometry(vertices, indices);
}

function createQuadPanel(
  schema: CarDesignSchema,
  stations: readonly PanelStation[],
  crownMm: number,
  edgeDropMm: number,
  builderConfig: GeometryBuilderConfig
) {
  const vertices: number[] = [];
  const indices: number[] = [];

  addGrid(vertices, indices, schema, createPanelRows(stations, crownMm, edgeDropMm, builderConfig));

  return makeGeometry(vertices, indices);
}

function createWrappedPanelRows(rows: SourcePoint3[][], sideDropMm: number, frontDropMm: number, rearDropMm: number) {
  const lastColumnIndex = rows[0].length - 1;
  const firstRow = rows[0];
  const lastRow = rows[rows.length - 1];

  return {
    top: rows,
    leftSide: rows.map((row) => [
      row[0],
      { ...row[0], z: row[0].z - sideDropMm },
    ]),
    rightSide: rows.map((row) => [
      row[lastColumnIndex],
      { ...row[lastColumnIndex], z: row[lastColumnIndex].z - sideDropMm },
    ]),
    frontFace: [
      firstRow,
      firstRow.map((point) => ({ ...point, z: point.z - frontDropMm })),
    ],
    rearFace: [
      lastRow,
      lastRow.map((point) => ({ ...point, z: point.z - rearDropMm })),
    ],
  };
}

function createWrappedQuadPanel(
  schema: CarDesignSchema,
  stations: readonly PanelStation[],
  crownMm: number,
  edgeDropMm: number,
  sideDropMm: number,
  frontDropMm: number,
  rearDropMm: number,
  builderConfig: GeometryBuilderConfig
) {
  const vertices: number[] = [];
  const indices: number[] = [];
  const rows = createWrappedPanelRows(
    createPanelRows(stations, crownMm, edgeDropMm, builderConfig),
    sideDropMm,
    frontDropMm,
    rearDropMm
  );

  addGrid(vertices, indices, schema, rows.top);
  addGrid(vertices, indices, schema, rows.leftSide);
  addGrid(vertices, indices, schema, rows.rightSide);
  addGrid(vertices, indices, schema, rows.frontFace);
  addGrid(vertices, indices, schema, rows.rearFace);

  return makeGeometry(vertices, indices);
}

function createSimpleBumper(schema: CarDesignSchema, stations: readonly PanelStation[], builderConfig: GeometryBuilderConfig) {
  return createQuadPanel(schema, stations, builderConfig.defaultBumperCrownMm, builderConfig.defaultBumperEdgeDropMm, builderConfig);
}

function createFrontBumperRows(stations: readonly PanelStation[], builderConfig: GeometryBuilderConfig) {
  const { frontBumper: frontBumperBuildConfig } = builderConfig;

  return stations.map((station, rowIndex) => (
    builderConfig.panelFactors.map((factor) => {
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

function createRoundedFrontBumper(schema: CarDesignSchema, stations: readonly PanelStation[], builderConfig: GeometryBuilderConfig) {
  const vertices: number[] = [];
  const indices: number[] = [];

  addGrid(vertices, indices, schema, createFrontBumperRows(stations, builderConfig));

  return makeGeometry(vertices, indices);
}

export function createSedanMainBodyGeometry(schema: CarDesignSchema, options: GeometryBuildOptions): BufferGeometry {
  const { geometryMm, builderConfig } = getGeometryBuildContext(options);
  return createBoxLikeBody(schema, geometryMm, builderConfig);
}

export function createSedanFrontBumperGeometry(schema: CarDesignSchema, options: GeometryBuildOptions): BufferGeometry {
  const { geometryMm, builderConfig } = getGeometryBuildContext(options);
  return createRoundedFrontBumper(schema, geometryMm.frontBumperStations, builderConfig);
}

export function createSedanRearBumperGeometry(schema: CarDesignSchema, options: GeometryBuildOptions): BufferGeometry {
  const { geometryMm, builderConfig } = getGeometryBuildContext(options);
  return createSimpleBumper(schema, geometryMm.rearBumperStations, builderConfig);
}

export function createSedanHoodPanelGeometry(schema: CarDesignSchema, options: GeometryBuildOptions): BufferGeometry {
  const { geometryMm, builderConfig } = getGeometryBuildContext(options);
  return createWrappedQuadPanel(
    schema,
    geometryMm.hoodStations,
    builderConfig.hoodCrownMm,
    builderConfig.hoodEdgeDropMm,
    builderConfig.hoodSideDropMm,
    builderConfig.hoodFrontDropMm,
    builderConfig.hoodRearDropMm,
    builderConfig
  );
}

export function createSedanTrunkDeckGeometry(schema: CarDesignSchema, options: GeometryBuildOptions): BufferGeometry {
  const { geometryMm, builderConfig } = getGeometryBuildContext(options);
  return createWrappedQuadPanel(
    schema,
    geometryMm.trunkStations,
    builderConfig.trunkCrownMm,
    builderConfig.trunkEdgeDropMm,
    builderConfig.trunkSideDropMm,
    builderConfig.trunkFrontDropMm,
    builderConfig.trunkRearDropMm,
    builderConfig
  );
}

export function createSedanRoofPanelGeometry(schema: CarDesignSchema, options: GeometryBuildOptions): BufferGeometry {
  const { geometryMm, builderConfig } = getGeometryBuildContext(options);
  return createWrappedQuadPanel(
    schema,
    geometryMm.roofStations,
    builderConfig.roofCrownMm,
    builderConfig.roofEdgeDropMm,
    builderConfig.roofSideDropMm,
    builderConfig.roofFrontDropMm,
    builderConfig.roofRearDropMm,
    builderConfig
  );
}

export function createSedanBodyGeometry(schema: CarDesignSchema, options: GeometryBuildOptions): BufferGeometry {
  return createSedanMainBodyGeometry(schema, options);
}
