"use client";

import { Canvas } from "@react-three/fiber";
import {
  ContactShadows,
  OrbitControls,
  PerspectiveCamera,
} from "@react-three/drei";
import { useMemo } from "react";
import {
  BufferGeometry,
  DoubleSide,
  Float32BufferAttribute,
  getConsoleFunction,
  PCFShadowMap,
  setConsoleFunction,
} from "three";
import {
  createSedanFrontBumperGeometry,
  createSedanHoodPanelGeometry,
  createSedanMainBodyGeometry,
  createSedanRearBumperGeometry,
  createSedanRoofPanelGeometry,
  createSedanTrunkDeckGeometry,
  sourceXToWorldX,
  sourceYToWorldZ,
  sourceZToWorldY,
} from "./cars/corolla/createCorolla2016SedanGeometry";
import { BoxPart, CylinderPart, TorusPart } from "./auto-parts";
import { corollaDesignSchema, corollaVisualControls } from "./cars/corolla";
import { corollaBlockoutConfig } from "./cars/corolla/source";
import { civic90FgBlockoutConfig } from "./cars/honda-civic-90-fg/source-metrics";
import { paints } from "./auto-types";
import type {
  AccessoryId,
  CarParams,
  MaterialOptions,
  PaintId,
} from "./auto-types";

type SourcePoint3 = {
  x: number;
  y: number;
  z: number;
};
type SourcePoint2 = {
  x: number;
  z: number;
};
type BodyStation = {
  x: number;
  topZ: number;
  bottomZ: number;
  halfWidth: number;
};
type PanelStation = SourcePoint2 & {
  halfWidth: number;
};
type DoorPanel = {
  id: string;
  xStart: number;
  xEnd: number;
  zTopStart: number;
  zTopEnd: number;
  zBottomStart: number;
  zBottomEnd: number;
  zMidStart: number;
  zMidEnd: number;
};
type WindowBaseFill = {
  id: string;
  lowerLeft: SourcePoint2;
  lowerRight: SourcePoint2;
  upperLeft: SourcePoint2;
  upperRight: SourcePoint2;
};
type BlockoutRenderMetrics = {
  seamOutsetMm: number;
  handleOutsetMm: number;
  beltlineOutsetMm: number;
  seamWidthMm: number;
  seamDepthMm: number;
  doorFrameOutsetMm: number;
  doorFrameHeightMm: number;
  doorFrameDepthMm: number;
  doorMidlineOutsetMm: number;
  doorMidlineHeightMm: number;
  doorMidlineDepthMm: number;
  handleLengthMm: number;
  handleHeightMm: number;
  handleDepthMm: number;
  beltlineHeightMm: number;
  beltlineDepthMm: number;
  windowBaseFillOutsetMm: number;
  windowFrameHeightMm: number;
  windowFrameDepthMm: number;
  fenderOutsetMm: number;
  fenderLipTubeMm: number;
  fenderArcRadians: number;
  mirrorHeadOutsetMm: number;
  mirrorStalkOutsetMm: number;
  wheelWellInsetMm: number;
};
type GeometryBuilderConfig = {
  panelFactors: readonly number[];
  faceFactors: readonly number[];
  bodySideInsetMm: number;
  bodyArchMidMinZ: number;
  bodyArchMidBaseZ: number;
  bodyArchTopGapMm: number;
  bodyArchMidLiftMm: number;
  defaultBumperCrownMm: number;
  defaultBumperEdgeDropMm: number;
  hoodCrownMm: number;
  hoodEdgeDropMm: number;
  hoodSideDropMm: number;
  hoodFrontDropMm: number;
  hoodRearDropMm: number;
  trunkCrownMm: number;
  trunkEdgeDropMm: number;
  trunkSideDropMm: number;
  trunkFrontDropMm: number;
  trunkRearDropMm: number;
  roofCrownMm: number;
  roofEdgeDropMm: number;
  roofSideDropMm: number;
  roofFrontDropMm: number;
  roofRearDropMm: number;
  frontBumper: {
    cornerRetreatMm: number;
    topShoulderSoftnessMm: number;
    bottomShoulderSoftnessMm: number;
    middleShoulderSoftnessMm: number;
    crownMm: number;
    edgeDropMm: number;
  };
};
type BlockoutConfig = {
  dimensionsM: {
    overallLength: number;
    overallWidth: number;
    visualHeight: number;
  };
  materials: typeof corollaBlockoutConfig.materials;
  geometryMm: {
    mainBodyStations: readonly BodyStation[];
    hoodStations: readonly PanelStation[];
    trunkStations: readonly PanelStation[];
    roofStations: readonly PanelStation[];
    frontBumperStations: readonly PanelStation[];
    rearBumperStations: readonly PanelStation[];
    wheelArchCentersX: readonly number[];
    wheelCenterZ: number;
    wheelArchRadius: number;
  };
  sceneMm: {
    wheels: {
      radius: number;
      width: number;
      centers: readonly SourcePoint3[];
    };
    glass: {
      windshield: Record<"lowerLeft" | "lowerRight" | "upperLeft" | "upperRight", SourcePoint3>;
      rearGlass: Record<"lowerLeft" | "lowerRight" | "upperLeft" | "upperRight", SourcePoint3>;
      sideWindows: readonly (readonly SourcePoint3[])[];
    };
    pillars: Record<"aPillar" | "bPillar" | "cPillar", {
      base: SourcePoint3;
      top: SourcePoint3;
      thickness: number;
    }>;
    roofSeals: {
      windshieldHeader: readonly SourcePoint3[];
      rearHeader: readonly SourcePoint3[];
    };
    upperGrille: { center: SourcePoint3; halfWidth: number; halfHeight: number };
    lowerIntake: { center: SourcePoint3; halfTop: number; halfBottom: number; halfHeight: number };
    headlights: readonly SourcePoint3[];
    taillights: readonly SourcePoint3[];
    badge: { center: SourcePoint3; halfWidth: number; halfHeight: number };
    sideDetails: {
      render: BlockoutRenderMetrics;
      seams: readonly { x: number; zTop: number; zBottom: number }[];
      handles: readonly SourcePoint2[];
      beltline: readonly SourcePoint2[];
      doorPanels: readonly DoorPanel[];
      windowBaseFills: readonly WindowBaseFill[];
      mirrors: readonly {
        base: SourcePoint2;
        headCenter: SourcePoint2;
        headSize: { x: number; y: number; z: number };
        stalkSize: { x: number; y: number; z: number };
      }[];
      wheelWells: readonly { x: number; z: number; radius: number }[];
    };
    interior: typeof corollaBlockoutConfig.sceneMm.interior;
  };
  geometryBuilderConfig: GeometryBuilderConfig;
};

const threeClockDeprecationWarning =
  "THREE.Clock: This module has been deprecated. Please use THREE.Timer instead.";
const previousThreeConsoleFunction = getConsoleFunction();

setConsoleFunction((type, message, ...params) => {
  if (type === "warn" && message === threeClockDeprecationWarning) {
    return;
  }

  if (previousThreeConsoleFunction) {
    previousThreeConsoleFunction(type, message, ...params);
    return;
  }

  console[type](message, ...params);
});

const accessoryRenderers: Record<AccessoryId, React.FC> = {
  leds: () => null,
  neon: () => null,
  spoiler: () => null,
  wheels: () => null,
  roofRack: () => null,
  sideSkirts: () => null,
};

function sourcePointToWorld(point: SourcePoint3, side?: 1 | -1, zOffset = 0): [number, number, number] {
  const sourceY = side === undefined ? point.y : Math.abs(point.y) * side;

  return [
    sourceXToWorldX(point.x, corollaDesignSchema),
    sourceZToWorldY(point.z),
    sourceYToWorldZ(sourceY) + zOffset,
  ];
}

function makePolygonGeometry(points: Array<[number, number, number]>) {
  const geometry = new BufferGeometry();
  const vertices = points.flat();
  const indices: number[] = [];

  for (let index = 1; index < points.length - 1; index += 1) {
    indices.push(0, index, index + 1);
  }

  geometry.setAttribute("position", new Float32BufferAttribute(vertices, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  return geometry;
}

function PolygonPart({
  points,
  material,
}: {
  points: Array<[number, number, number]>;
  material: MaterialOptions;
}) {
  const geometry = useMemo(() => makePolygonGeometry(points), [points]);

  return (
    <mesh geometry={geometry} castShadow>
      <meshPhysicalMaterial {...material} side={DoubleSide} />
    </mesh>
  );
}

function SedanBodyShell({ blockoutConfig, material }: { blockoutConfig: BlockoutConfig; material: MaterialOptions }) {
  const geometries = useMemo(() => ({
    mainBody: createSedanMainBodyGeometry(corollaDesignSchema, {
      geometryMm: blockoutConfig.geometryMm,
      builderConfig: blockoutConfig.geometryBuilderConfig,
    }),
    frontBumper: createSedanFrontBumperGeometry(corollaDesignSchema, {
      geometryMm: blockoutConfig.geometryMm,
      builderConfig: blockoutConfig.geometryBuilderConfig,
    }),
    rearBumper: createSedanRearBumperGeometry(corollaDesignSchema, {
      geometryMm: blockoutConfig.geometryMm,
      builderConfig: blockoutConfig.geometryBuilderConfig,
    }),
    hoodPanel: createSedanHoodPanelGeometry(corollaDesignSchema, {
      geometryMm: blockoutConfig.geometryMm,
      builderConfig: blockoutConfig.geometryBuilderConfig,
    }),
    trunkDeck: createSedanTrunkDeckGeometry(corollaDesignSchema, {
      geometryMm: blockoutConfig.geometryMm,
      builderConfig: blockoutConfig.geometryBuilderConfig,
    }),
    roofPanel: createSedanRoofPanelGeometry(corollaDesignSchema, {
      geometryMm: blockoutConfig.geometryMm,
      builderConfig: blockoutConfig.geometryBuilderConfig,
    }),
  }), [blockoutConfig]);

  return (
    <>
      {Object.entries(geometries).map(([key, geometry]) => (
        <mesh key={key} castShadow receiveShadow geometry={geometry}>
          <meshPhysicalMaterial {...material} side={DoubleSide} />
        </mesh>
      ))}
    </>
  );
}

function Wheel({
  blockoutConfig,
  x,
  y,
  z,
  sport,
}: {
  blockoutConfig: BlockoutConfig;
  x: number;
  y: number;
  z: number;
  sport: boolean;
}) {
  const visual = corollaVisualControls;
  const radius = blockoutConfig.sceneMm.wheels.radius / 1000;
  const width = blockoutConfig.sceneMm.wheels.width / 1000;
  const spokeCount = sport ? 10 : 7;
  const rimMaterial: MaterialOptions = {
    ...(sport ? blockoutConfig.materials.sportRim : blockoutConfig.materials.rim),
  };
  const tireMaterial: MaterialOptions = { ...visual.materials.tire, ...blockoutConfig.materials.tire };
  const centerMaterial: MaterialOptions = { ...blockoutConfig.materials.wheelCenter };
  const spokeMaterial: MaterialOptions = {
    ...(sport ? blockoutConfig.materials.sportWheelSpoke : blockoutConfig.materials.wheelSpoke),
  };
  const spokeRotations = useMemo(
    () => Array.from({ length: spokeCount }, (_, i) => (i * Math.PI * 2) / spokeCount),
    [spokeCount]
  );
  const wheelFaceSides = [-1, 1] as const;

  return (
    <group position={[x, y, z]} rotation={[Math.PI / 2, 0, 0]}>
      <CylinderPart castShadow args={[radius, radius, width, 48]} material={tireMaterial} />
      {wheelFaceSides.map((side) => (
        <group key={side}>
          <CylinderPart position={[0, side * width * 0.54, 0]} args={[radius * 0.68, radius * 0.68, 0.032, 40]} material={rimMaterial} />
          {spokeRotations.map((rot, index) => (
            <BoxPart
              key={`${side}-${index}`}
              position={[0, side * width * 0.61, 0]}
              rotation={[0, rot, 0]}
              args={[0.032, 0.024, radius * 1.42]}
              material={spokeMaterial}
            />
          ))}
          <CylinderPart position={[0, side * width * 0.69, 0]} args={[0.07, 0.07, 0.022, 28]} material={centerMaterial} />
        </group>
      ))}
    </group>
  );
}

function SchemaGlass({ blockoutConfig, material }: { blockoutConfig: BlockoutConfig; material: MaterialOptions }) {
  const { windshield, rearGlass, sideWindows } = blockoutConfig.sceneMm.glass;

  return (
    <>
      <PolygonPart
        points={[
          sourcePointToWorld(windshield.lowerLeft),
          sourcePointToWorld(windshield.lowerRight),
          sourcePointToWorld(windshield.upperRight),
          sourcePointToWorld(windshield.upperLeft),
        ]}
        material={material}
      />
      <PolygonPart
        points={[
          sourcePointToWorld(rearGlass.lowerLeft),
          sourcePointToWorld(rearGlass.lowerRight),
          sourcePointToWorld(rearGlass.upperRight),
          sourcePointToWorld(rearGlass.upperLeft),
        ]}
        material={material}
      />
      {sideWindows.map((points, index) => (
        <PolygonPart
          key={`left-window-${index}`}
          points={points.map((point) => sourcePointToWorld(point, -1, -0.006))}
          material={material}
        />
      ))}
      {sideWindows.map((points, index) => (
        <PolygonPart
          key={`right-window-${index}`}
          points={points.map((point) => sourcePointToWorld(point, 1, 0.006))}
          material={material}
        />
      ))}
    </>
  );
}

function SchemaRoofGlassSeals({ blockoutConfig, material }: { blockoutConfig: BlockoutConfig; material: MaterialOptions }) {
  const { windshieldHeader, rearHeader } = blockoutConfig.sceneMm.roofSeals;

  return (
    <>
      <PolygonPart
        points={windshieldHeader.map((point) => sourcePointToWorld(point))}
        material={material}
      />
      <PolygonPart
        points={rearHeader.map((point) => sourcePointToWorld(point))}
        material={material}
      />
    </>
  );
}

function WindowFrameSegment({
  blockoutConfig,
  start,
  end,
  side,
  material,
}: {
  blockoutConfig: BlockoutConfig;
  start: SourcePoint3;
  end: SourcePoint3;
  side: 1 | -1;
  material: MaterialOptions;
}) {
  const { windowFrameHeightMm } = blockoutConfig.sceneMm.sideDetails.render;
  const dx = end.x - start.x;
  const dz = end.z - start.z;
  const length = Math.hypot(dx, dz);

  if (length === 0) {
    return null;
  }

  const halfHeight = windowFrameHeightMm / 2;
  const normalX = (-dz / length) * halfHeight;
  const normalZ = (dx / length) * halfHeight;
  const startA = { ...start, x: start.x + normalX, z: start.z + normalZ };
  const startB = { ...start, x: start.x - normalX, z: start.z - normalZ };
  const endA = { ...end, x: end.x + normalX, z: end.z + normalZ };
  const endB = { ...end, x: end.x - normalX, z: end.z - normalZ };

  return (
    <PolygonPart
      points={[
        sourcePointToWorld(startA, side, side * 0.012),
        sourcePointToWorld(endA, side, side * 0.012),
        sourcePointToWorld(endB, side, side * 0.012),
        sourcePointToWorld(startB, side, side * 0.012),
      ]}
      material={material}
    />
  );
}

function SchemaWindowFrames({ blockoutConfig, material }: { blockoutConfig: BlockoutConfig; material: MaterialOptions }) {
  const { sideWindows } = blockoutConfig.sceneMm.glass;

  return (
    <>
      {([-1, 1] as const).flatMap((side) => (
        sideWindows.flatMap((points, windowIndex) => (
          points.map((point, pointIndex) => (
            <WindowFrameSegment
              key={`window-frame-${side}-${windowIndex}-${pointIndex}`}
              blockoutConfig={blockoutConfig}
              start={point}
              end={points[(pointIndex + 1) % points.length]}
              side={side}
              material={material}
            />
          ))
        ))
      ))}
    </>
  );
}

function makePillarPolygon(base: SourcePoint3, top: SourcePoint3, side: 1 | -1, thicknessMm: number) {
  const halfThickness = thicknessMm / 2;

  return [
    sourcePointToWorld({ ...base, x: base.x - halfThickness }, side, side * 0.007),
    sourcePointToWorld({ ...top, x: top.x - halfThickness }, side, side * 0.007),
    sourcePointToWorld({ ...top, x: top.x + halfThickness }, side, side * 0.007),
    sourcePointToWorld({ ...base, x: base.x + halfThickness }, side, side * 0.007),
  ];
}

function SchemaPillars({ blockoutConfig, material }: { blockoutConfig: BlockoutConfig; material: MaterialOptions }) {
  const { aPillar, bPillar, cPillar } = blockoutConfig.sceneMm.pillars;

  return (
    <>
      {([-1, 1] as const).flatMap((side) => [
        <PolygonPart key={`a-pillar-${side}`} points={makePillarPolygon(aPillar.base, aPillar.top, side, aPillar.thickness)} material={material} />,
        <PolygonPart key={`b-pillar-${side}`} points={makePillarPolygon(bPillar.base, bPillar.top, side, bPillar.thickness)} material={material} />,
        <PolygonPart key={`c-pillar-${side}`} points={makePillarPolygon(cPillar.base, cPillar.top, side, cPillar.thickness)} material={material} />,
      ])}
    </>
  );
}

function SchemaUpperGrille({ blockoutConfig, material }: { blockoutConfig: BlockoutConfig; material: MaterialOptions }) {
  const { center, halfWidth, halfHeight } = blockoutConfig.sceneMm.upperGrille;

  return (
    <PolygonPart
      points={[
        sourcePointToWorld({ ...center, y: -halfWidth, z: center.z - halfHeight }),
        sourcePointToWorld({ ...center, y: halfWidth, z: center.z - halfHeight }),
        sourcePointToWorld({ ...center, y: halfWidth, z: center.z + halfHeight }),
        sourcePointToWorld({ ...center, y: -halfWidth, z: center.z + halfHeight }),
      ]}
      material={material}
    />
  );
}

function SchemaLowerIntake({ blockoutConfig, material }: { blockoutConfig: BlockoutConfig; material: MaterialOptions }) {
  const { center, halfTop, halfBottom, halfHeight } = blockoutConfig.sceneMm.lowerIntake;

  return (
    <PolygonPart
      points={[
        sourcePointToWorld({ ...center, y: -halfBottom, z: center.z - halfHeight }),
        sourcePointToWorld({ ...center, y: halfBottom, z: center.z - halfHeight }),
        sourcePointToWorld({ ...center, y: halfTop, z: center.z + halfHeight }),
        sourcePointToWorld({ ...center, y: -halfTop, z: center.z + halfHeight }),
      ]}
      material={material}
    />
  );
}

function SchemaFrontBadge({ blockoutConfig, material }: { blockoutConfig: BlockoutConfig; material: MaterialOptions }) {
  const { center, halfWidth, halfHeight } = blockoutConfig.sceneMm.badge;

  return (
    <PolygonPart
      points={[
        sourcePointToWorld({ ...center, y: -halfWidth, z: center.z - halfHeight }),
        sourcePointToWorld({ ...center, y: halfWidth, z: center.z - halfHeight }),
        sourcePointToWorld({ ...center, y: halfWidth, z: center.z + halfHeight }),
        sourcePointToWorld({ ...center, y: -halfWidth, z: center.z + halfHeight }),
      ]}
      material={material}
    />
  );
}

function getBodyHalfWidthAtSourceX(sourceX: number, blockoutConfig: BlockoutConfig) {
  const stations = blockoutConfig.geometryMm.mainBodyStations;
  const firstStation = stations[0];
  const lastStation = stations[stations.length - 1];

  if (sourceX <= firstStation.x) {
    return firstStation.halfWidth;
  }

  if (sourceX >= lastStation.x) {
    return lastStation.halfWidth;
  }

  for (let index = 0; index < stations.length - 1; index += 1) {
    const current = stations[index];
    const next = stations[index + 1];

    if (sourceX >= current.x && sourceX <= next.x) {
      const progress = (sourceX - current.x) / (next.x - current.x);
      return current.halfWidth + (next.halfWidth - current.halfWidth) * progress;
    }
  }

  return lastStation.halfWidth;
}

function getSideDetailY(sourceX: number, side: 1 | -1, outwardMm: number, blockoutConfig: BlockoutConfig) {
  return side * (getBodyHalfWidthAtSourceX(sourceX, blockoutConfig) + outwardMm);
}

function SideSurfaceSegment({
  blockoutConfig,
  start,
  end,
  side,
  outwardMm,
  heightMm,
  depthMm,
  material,
  keyPrefix,
}: {
  blockoutConfig: BlockoutConfig;
  start: { x: number; z: number };
  end: { x: number; z: number };
  side: 1 | -1;
  outwardMm: number;
  heightMm: number;
  depthMm: number;
  material: MaterialOptions;
  keyPrefix: string;
}) {
  const dx = (end.x - start.x) / 1000;
  const dz = (end.z - start.z) / 1000;
  const length = Math.hypot(dx, dz);
  const centerX = (start.x + end.x) / 2;
  const position = sourcePointToWorld({
    x: centerX,
    y: getSideDetailY(centerX, side, outwardMm, blockoutConfig),
    z: (start.z + end.z) / 2,
  });

  return (
    <BoxPart
      key={keyPrefix}
      position={[position[0], position[1], position[2] + side * 0.005]}
      rotation={[0, 0, Math.atan2(dz, dx)]}
      args={[length, heightMm / 1000, depthMm / 1000]}
      material={material}
    />
  );
}

function SchemaSideDetails({
  blockoutConfig,
  fenderMaterial,
  trimMaterial,
  handleMaterial,
  wheelWellMaterial,
}: {
  blockoutConfig: BlockoutConfig;
  fenderMaterial: MaterialOptions;
  trimMaterial: MaterialOptions;
  handleMaterial: MaterialOptions;
  wheelWellMaterial: MaterialOptions;
}) {
  const { render, seams, handles, beltline, doorPanels, windowBaseFills, mirrors, wheelWells } =
    blockoutConfig.sceneMm.sideDetails;

  return (
    <>
      {([-1, 1] as const).flatMap((side) => {
        const sideOffset = side * 0.004;

        return [
          ...windowBaseFills.map((fill) => {
            const fillPoint = (point: { x: number; z: number }) =>
              sourcePointToWorld(
                {
                  x: point.x,
                  y: getSideDetailY(point.x, side, render.windowBaseFillOutsetMm, blockoutConfig),
                  z: point.z,
                },
                undefined,
                side * 0.003,
              );

            return (
              <PolygonPart
                key={`window-base-fill-${side}-${fill.id}`}
                points={[
                  fillPoint(fill.lowerLeft),
                  fillPoint(fill.lowerRight),
                  fillPoint(fill.upperRight),
                  fillPoint(fill.upperLeft),
                ]}
                material={fenderMaterial}
              />
            );
          }),
          ...doorPanels.flatMap((door) => {
            const topStart = { x: door.xStart, z: door.zTopStart };
            const topEnd = { x: door.xEnd, z: door.zTopEnd };
            const bottomStart = { x: door.xStart, z: door.zBottomStart };
            const bottomEnd = { x: door.xEnd, z: door.zBottomEnd };
            const midStart = { x: door.xStart + 58, z: door.zMidStart };
            const midEnd = { x: door.xEnd - 58, z: door.zMidEnd };

            return [
              <SideSurfaceSegment
                key={`door-top-${side}-${door.id}`}
                keyPrefix={`door-top-${side}-${door.id}`}
                blockoutConfig={blockoutConfig}
                start={topStart}
                end={topEnd}
                side={side}
                outwardMm={render.doorFrameOutsetMm}
                heightMm={render.doorFrameHeightMm}
                depthMm={render.doorFrameDepthMm}
                material={trimMaterial}
              />,
              <SideSurfaceSegment
                key={`door-bottom-${side}-${door.id}`}
                keyPrefix={`door-bottom-${side}-${door.id}`}
                blockoutConfig={blockoutConfig}
                start={bottomStart}
                end={bottomEnd}
                side={side}
                outwardMm={render.doorFrameOutsetMm}
                heightMm={render.doorFrameHeightMm}
                depthMm={render.doorFrameDepthMm}
                material={trimMaterial}
              />,
              <SideSurfaceSegment
                key={`door-front-${side}-${door.id}`}
                keyPrefix={`door-front-${side}-${door.id}`}
                blockoutConfig={blockoutConfig}
                start={bottomStart}
                end={topStart}
                side={side}
                outwardMm={render.doorFrameOutsetMm}
                heightMm={render.doorFrameHeightMm}
                depthMm={render.doorFrameDepthMm}
                material={trimMaterial}
              />,
              <SideSurfaceSegment
                key={`door-rear-${side}-${door.id}`}
                keyPrefix={`door-rear-${side}-${door.id}`}
                blockoutConfig={blockoutConfig}
                start={bottomEnd}
                end={topEnd}
                side={side}
                outwardMm={render.doorFrameOutsetMm}
                heightMm={render.doorFrameHeightMm}
                depthMm={render.doorFrameDepthMm}
                material={trimMaterial}
              />,
              <SideSurfaceSegment
                key={`door-mid-${side}-${door.id}`}
                keyPrefix={`door-mid-${side}-${door.id}`}
                blockoutConfig={blockoutConfig}
                start={midStart}
                end={midEnd}
                side={side}
                outwardMm={render.doorMidlineOutsetMm}
                heightMm={render.doorMidlineHeightMm}
                depthMm={render.doorMidlineDepthMm}
                material={trimMaterial}
              />,
            ];
          }),
          ...seams.map((seam) => {
            const height = (seam.zTop - seam.zBottom) / 1000;
            const position = sourcePointToWorld({
              x: seam.x,
              y: getSideDetailY(seam.x, side, render.seamOutsetMm, blockoutConfig),
              z: (seam.zTop + seam.zBottom) / 2,
            });

            return (
              <BoxPart
                key={`seam-${side}-${seam.x}`}
                position={[position[0], position[1], position[2] + sideOffset]}
                args={[render.seamWidthMm / 1000, height, render.seamDepthMm / 1000]}
                material={trimMaterial}
              />
            );
          }),
          ...handles.map((handle) => {
            const position = sourcePointToWorld({
              x: handle.x,
              y: getSideDetailY(handle.x, side, render.handleOutsetMm, blockoutConfig),
              z: handle.z,
            });

            return (
              <BoxPart
                key={`handle-${side}-${handle.x}`}
                position={[position[0], position[1], position[2] + sideOffset]}
                args={[render.handleLengthMm / 1000, render.handleHeightMm / 1000, render.handleDepthMm / 1000]}
                material={handleMaterial}
              />
            );
          }),
          ...mirrors.flatMap((mirror) => {
            const stalkPosition = sourcePointToWorld({
              x: (mirror.base.x + mirror.headCenter.x) / 2,
              y: getSideDetailY(mirror.base.x, side, render.mirrorStalkOutsetMm, blockoutConfig),
              z: (mirror.base.z + mirror.headCenter.z) / 2,
            });
            const headPosition = sourcePointToWorld({
              x: mirror.headCenter.x,
              y: getSideDetailY(mirror.headCenter.x, side, render.mirrorHeadOutsetMm, blockoutConfig),
              z: mirror.headCenter.z,
            });

            return [
              <BoxPart
                key={`mirror-stalk-${side}-${mirror.base.x}`}
                position={[stalkPosition[0], stalkPosition[1], stalkPosition[2] + sideOffset]}
                rotation={[0, 0, -0.18]}
                args={vecFromSourceSize(mirror.stalkSize)}
                material={trimMaterial}
              />,
              <BoxPart
                key={`mirror-head-${side}-${mirror.base.x}`}
                position={[headPosition[0], headPosition[1], headPosition[2] + sideOffset]}
                rotation={[0, 0, -0.08]}
                args={vecFromSourceSize(mirror.headSize)}
                material={fenderMaterial}
              />,
            ];
          }),
          ...beltline.slice(0, -1).map((start, index) => {
            const end = beltline[index + 1];
            const dx = (end.x - start.x) / 1000;
            const dz = (end.z - start.z) / 1000;
            const length = Math.hypot(dx, dz);
            const centerX = (start.x + end.x) / 2;
            const position = sourcePointToWorld({
              x: centerX,
              y: getSideDetailY(centerX, side, render.beltlineOutsetMm, blockoutConfig),
              z: (start.z + end.z) / 2,
            });

            return (
              <BoxPart
                key={`beltline-${side}-${start.x}`}
                position={[position[0], position[1], position[2] + sideOffset]}
                rotation={[0, 0, Math.atan2(dz, dx)]}
                args={[length, render.beltlineHeightMm / 1000, render.beltlineDepthMm / 1000]}
                material={trimMaterial}
              />
            );
          }),
          ...wheelWells.map((well) => {
            const position = sourcePointToWorld({
              x: well.x,
              y: getSideDetailY(well.x, side, render.wheelWellInsetMm, blockoutConfig),
              z: well.z,
            });
            const radius = well.radius / 1000;
            const fenderPosition = sourcePointToWorld({
              x: well.x,
              y: getSideDetailY(well.x, side, render.fenderOutsetMm, blockoutConfig),
              z: well.z,
            });

            return [
              <TorusPart
                key={`fender-lip-${side}-${well.x}`}
                position={[fenderPosition[0], fenderPosition[1], fenderPosition[2] + sideOffset]}
                args={[radius, render.fenderLipTubeMm / 1000, 12, 48, render.fenderArcRadians]}
                material={fenderMaterial}
              />,
              <CylinderPart
                key={`wheel-well-${side}-${well.x}`}
                position={[position[0], position[1], position[2] - side * 0.006]}
                rotation={[Math.PI / 2, 0, 0]}
                args={[radius, radius, 0.018, 40]}
                material={wheelWellMaterial}
              />,
            ];
          }),
        ];
      })}
    </>
  );
}

function SchemaLights({
  blockoutConfig,
  material,
  kind,
}: {
  blockoutConfig: BlockoutConfig;
  material: MaterialOptions;
  kind: "headlight" | "taillight";
}) {
  const lightOutline =
    kind === "headlight"
      ? blockoutConfig.sceneMm.headlights
      : blockoutConfig.sceneMm.taillights;
  const offset = 0.001;

  return (
    <>
      <PolygonPart points={lightOutline.map((point) => sourcePointToWorld(point, -1, -offset))} material={material} />
      <PolygonPart points={lightOutline.map((point) => sourcePointToWorld(point, 1, offset))} material={material} />
    </>
  );
}

function vecFromSourceSize(size: { x: number; y: number; z: number }): [number, number, number] {
  return [size.x / 1000, size.z / 1000, size.y / 1000];
}

function SchemaInterior({
  blockoutConfig,
  seatMaterial,
  dashMaterial,
  accentMaterial,
}: {
  blockoutConfig: BlockoutConfig;
  seatMaterial: MaterialOptions;
  dashMaterial: MaterialOptions;
  accentMaterial: MaterialOptions;
}) {
  const { frontSeats, dashboard, steeringWheel } = blockoutConfig.sceneMm.interior;

  return (
    <>
      {frontSeats.map((seat, index) => (
        <group key={`front-seat-${index}`}>
          <BoxPart
            castShadow
            position={sourcePointToWorld(seat.center)}
            args={vecFromSourceSize(seat.cushionSize)}
            material={seatMaterial}
          />
          <BoxPart
            castShadow
            position={sourcePointToWorld(seat.backCenter)}
            rotation={[0, 0, seat.backRotationZ]}
            args={vecFromSourceSize(seat.backSize)}
            material={seatMaterial}
          />
        </group>
      ))}
      <BoxPart
        castShadow
        position={sourcePointToWorld(dashboard.center)}
        args={vecFromSourceSize(dashboard.size)}
        material={dashMaterial}
      />
      <BoxPart
        castShadow
        position={sourcePointToWorld(dashboard.topCenter)}
        args={vecFromSourceSize(dashboard.topSize)}
        material={accentMaterial}
      />
      <BoxPart
        castShadow
        position={sourcePointToWorld(steeringWheel.columnCenter)}
        rotation={[0, 0, steeringWheel.columnRotationZ]}
        args={vecFromSourceSize(steeringWheel.columnSize)}
        material={dashMaterial}
      />
      <TorusPart
        position={sourcePointToWorld(steeringWheel.center)}
        rotation={[0, steeringWheel.rotationY, steeringWheel.rotationZ]}
        args={[steeringWheel.radius / 1000, steeringWheel.tube / 1000, 12, 36]}
        material={accentMaterial}
      />
    </>
  );
}

function CorollaLikeSedan({ params, selected, paint }: { params: CarParams; selected: Set<AccessoryId>; paint: PaintId }) {
  const visual = corollaVisualControls;
  const blockoutConfig = params.bodyStyle === "boxyCompact" ? civic90FgBlockoutConfig : corollaBlockoutConfig;
  const selectedPaint = paints[paint] ?? paints.white;
  const modelScale = useMemo((): [number, number, number] => {
    const base = blockoutConfig.dimensionsM;

    return [
      params.overallLength / base.overallLength,
      params.bodyHeight / base.visualHeight,
      params.width / base.overallWidth,
    ];
  }, [blockoutConfig, params]);

  const hasSportWheels = selected.has("wheels");
  const hasLeds = selected.has("leds");
  const hasClosedPopupHeadlights = params.bodyStyle === "boxyCompact";
  const bodyMaterial: MaterialOptions = useMemo(() => ({
    ...blockoutConfig.materials.body,
    color: selectedPaint.color,
  }), [blockoutConfig, selectedPaint.color]);
  const glass: MaterialOptions = {
    ...visual.materials.glass,
    ...blockoutConfig.materials.glass,
  };
  const headlightMat: MaterialOptions = useMemo(() => ({
    ...visual.materials.clearLens,
    color: hasClosedPopupHeadlights ? "#29313a" : hasLeds ? "#fefce8" : visual.materials.clearLens.color,
    emissive: hasClosedPopupHeadlights ? "#000000" : hasLeds ? "#facc15" : "#000000",
    emissiveIntensity: hasClosedPopupHeadlights ? 0 : hasLeds ? 1.2 : 0,
  }), [hasClosedPopupHeadlights, hasLeds, visual]);
  const wheelPositions = useMemo((): Array<[number, number, number]> => {
    return blockoutConfig.sceneMm.wheels.centers.map((center) => [
      sourceXToWorldX(center.x, corollaDesignSchema),
      sourceZToWorldY(center.z),
      sourceYToWorldZ(center.y),
    ]);
  }, [blockoutConfig]);

  return (
    <group rotation={visual.motion.rotation} scale={modelScale}>
      <SedanBodyShell blockoutConfig={blockoutConfig} material={{ ...bodyMaterial, ...visual.materials.body }} />
      <SchemaRoofGlassSeals blockoutConfig={blockoutConfig} material={{ ...bodyMaterial, ...visual.materials.body }} />
      <SchemaInterior
        blockoutConfig={blockoutConfig}
        seatMaterial={blockoutConfig.materials.interiorFabricDark}
        dashMaterial={blockoutConfig.materials.interiorPlasticDark}
        accentMaterial={blockoutConfig.materials.interiorAccent}
      />
      <SchemaGlass blockoutConfig={blockoutConfig} material={glass} />
      <SchemaWindowFrames blockoutConfig={blockoutConfig} material={visual.materials.blackTrim} />
      <SchemaPillars blockoutConfig={blockoutConfig} material={visual.materials.blackTrim} />
      <SchemaUpperGrille blockoutConfig={blockoutConfig} material={visual.materials.glossBlack} />
      <SchemaLowerIntake blockoutConfig={blockoutConfig} material={visual.materials.matteBlack} />
      <SchemaFrontBadge blockoutConfig={blockoutConfig} material={blockoutConfig.materials.chrome} />
      <SchemaSideDetails
        blockoutConfig={blockoutConfig}
        fenderMaterial={{ ...bodyMaterial, ...visual.materials.body }}
        trimMaterial={visual.materials.blackTrim}
        handleMaterial={blockoutConfig.materials.chrome}
        wheelWellMaterial={blockoutConfig.materials.wheelWell}
      />
      <SchemaLights blockoutConfig={blockoutConfig} kind="headlight" material={headlightMat} />
      <SchemaLights blockoutConfig={blockoutConfig} kind="taillight" material={visual.materials.redLens} />

      {Array.from(selected).map((id) => {
        const Renderer = accessoryRenderers[id];
        return Renderer ? <Renderer key={id} /> : null;
      })}

      {wheelPositions.map(([x, y, z], index) => (
        <Wheel key={index} blockoutConfig={blockoutConfig} x={x} y={y} z={z} sport={hasSportWheels} />
      ))}
    </group>
  );
}

export function GarageScene({ params, selected, paint }: { params: CarParams; selected: Set<AccessoryId>; paint: PaintId }) {
  return (
    <Canvas shadows={{ type: PCFShadowMap }} dpr={[1, 1.85]} className="h-full w-full">
      <PerspectiveCamera makeDefault position={[5.8, 3.2, 5.9]} fov={41} />
      <color attach="background" args={["#0f141b"]} />
      <ambientLight intensity={0.9} />
      <directionalLight castShadow position={[5.5, 9, 4.5]} intensity={2.6} shadow-mapSize={1536} shadow-bias={-0.0004} />
      <pointLight color="#22c55e" intensity={0.5} position={[-4, 1.4, -3]} distance={7.5} />
      <pointLight color="#f59e0b" intensity={0.38} position={[4, 2.2, -3.5]} distance={9} />

      <group position={[0, -0.18, 0]}>
        <CorollaLikeSedan params={params} selected={selected} paint={paint} />
        <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.82, 0]}>
          <circleGeometry args={[5.8, 96]} />
          <meshStandardMaterial color="#1f2937" roughness={0.7} metalness={0.18} />
        </mesh>
      </group>

      <ContactShadows position={[0, -1.0, 0]} opacity={0.42} scale={8.5} blur={2.6} far={3.2} />
      <OrbitControls enablePan={false} minDistance={4.2} maxDistance={8.5} minPolarAngle={0.52} maxPolarAngle={1.38} />
    </Canvas>
  );
}
