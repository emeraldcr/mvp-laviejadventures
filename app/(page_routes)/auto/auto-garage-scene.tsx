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

function SedanBodyShell({ material }: { material: MaterialOptions }) {
  const geometries = useMemo(() => ({
    mainBody: createSedanMainBodyGeometry(corollaDesignSchema),
    frontBumper: createSedanFrontBumperGeometry(corollaDesignSchema),
    rearBumper: createSedanRearBumperGeometry(corollaDesignSchema),
    hoodPanel: createSedanHoodPanelGeometry(corollaDesignSchema),
    trunkDeck: createSedanTrunkDeckGeometry(corollaDesignSchema),
    roofPanel: createSedanRoofPanelGeometry(corollaDesignSchema),
  }), []);

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
  x,
  y,
  z,
  sport,
}: {
  x: number;
  y: number;
  z: number;
  sport: boolean;
}) {
  const visual = corollaVisualControls;
  const radius = corollaBlockoutConfig.sceneMm.wheels.radius / 1000;
  const width = corollaBlockoutConfig.sceneMm.wheels.width / 1000;
  const spokeCount = sport ? 10 : 7;
  const rimMaterial: MaterialOptions = {
    ...(sport ? corollaBlockoutConfig.materials.sportRim : corollaBlockoutConfig.materials.rim),
  };
  const tireMaterial: MaterialOptions = { ...visual.materials.tire, ...corollaBlockoutConfig.materials.tire };
  const centerMaterial: MaterialOptions = { ...corollaBlockoutConfig.materials.wheelCenter };
  const spokeMaterial: MaterialOptions = {
    ...(sport ? corollaBlockoutConfig.materials.sportWheelSpoke : corollaBlockoutConfig.materials.wheelSpoke),
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

function SchemaGlass({ material }: { material: MaterialOptions }) {
  const { windshield, rearGlass, sideWindows } = corollaBlockoutConfig.sceneMm.glass;

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

function SchemaRoofGlassSeals({ material }: { material: MaterialOptions }) {
  const { windshieldHeader, rearHeader } = corollaBlockoutConfig.sceneMm.roofSeals;

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
  start,
  end,
  side,
  material,
}: {
  start: SourcePoint3;
  end: SourcePoint3;
  side: 1 | -1;
  material: MaterialOptions;
}) {
  const { windowFrameDepthMm, windowFrameHeightMm } = corollaBlockoutConfig.sceneMm.sideDetails.render;
  const dx = (end.x - start.x) / 1000;
  const dz = (end.z - start.z) / 1000;
  const length = Math.hypot(dx, dz);
  const position = sourcePointToWorld({
    x: (start.x + end.x) / 2,
    y: side * ((Math.abs(start.y) + Math.abs(end.y)) / 2),
    z: (start.z + end.z) / 2,
  }, side, side * 0.011);

  return (
    <BoxPart
      position={position}
      rotation={[0, 0, Math.atan2(dz, dx)]}
      args={[length, windowFrameHeightMm / 1000, windowFrameDepthMm / 1000]}
      material={material}
    />
  );
}

function SchemaWindowFrames({ material }: { material: MaterialOptions }) {
  const { sideWindows } = corollaBlockoutConfig.sceneMm.glass;

  return (
    <>
      {([-1, 1] as const).flatMap((side) => (
        sideWindows.flatMap((points, windowIndex) => (
          points.map((point, pointIndex) => (
            <WindowFrameSegment
              key={`window-frame-${side}-${windowIndex}-${pointIndex}`}
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

function SchemaPillars({ material }: { material: MaterialOptions }) {
  const { aPillar, bPillar, cPillar } = corollaBlockoutConfig.sceneMm.pillars;

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

function SchemaUpperGrille({ material }: { material: MaterialOptions }) {
  const { center, halfWidth, halfHeight } = corollaBlockoutConfig.sceneMm.upperGrille;

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

function SchemaLowerIntake({ material }: { material: MaterialOptions }) {
  const { center, halfTop, halfBottom, halfHeight } = corollaBlockoutConfig.sceneMm.lowerIntake;

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

function SchemaFrontBadge({ material }: { material: MaterialOptions }) {
  const { center, halfWidth, halfHeight } = corollaBlockoutConfig.sceneMm.badge;

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

function getBodyHalfWidthAtSourceX(sourceX: number) {
  const stations = corollaBlockoutConfig.geometryMm.mainBodyStations;
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

function getSideDetailY(sourceX: number, side: 1 | -1, outwardMm: number) {
  return side * (getBodyHalfWidthAtSourceX(sourceX) + outwardMm);
}

function SideSurfaceSegment({
  start,
  end,
  side,
  outwardMm,
  heightMm,
  depthMm,
  material,
  keyPrefix,
}: {
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
    y: getSideDetailY(centerX, side, outwardMm),
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
  fenderMaterial,
  trimMaterial,
  handleMaterial,
  wheelWellMaterial,
}: {
  fenderMaterial: MaterialOptions;
  trimMaterial: MaterialOptions;
  handleMaterial: MaterialOptions;
  wheelWellMaterial: MaterialOptions;
}) {
  const { render, seams, handles, beltline, doorPanels, wheelWells } = corollaBlockoutConfig.sceneMm.sideDetails;

  return (
    <>
      {([-1, 1] as const).flatMap((side) => {
        const sideOffset = side * 0.004;

        return [
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
              y: getSideDetailY(seam.x, side, render.seamOutsetMm),
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
              y: getSideDetailY(handle.x, side, render.handleOutsetMm),
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
          ...beltline.slice(0, -1).map((start, index) => {
            const end = beltline[index + 1];
            const dx = (end.x - start.x) / 1000;
            const dz = (end.z - start.z) / 1000;
            const length = Math.hypot(dx, dz);
            const centerX = (start.x + end.x) / 2;
            const position = sourcePointToWorld({
              x: centerX,
              y: getSideDetailY(centerX, side, render.beltlineOutsetMm),
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
              y: getSideDetailY(well.x, side, render.wheelWellInsetMm),
              z: well.z,
            });
            const radius = well.radius / 1000;
            const fenderPosition = sourcePointToWorld({
              x: well.x,
              y: getSideDetailY(well.x, side, render.fenderOutsetMm),
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
  material,
  kind,
}: {
  material: MaterialOptions;
  kind: "headlight" | "taillight";
}) {
  const lightOutline =
    kind === "headlight"
      ? corollaBlockoutConfig.sceneMm.headlights
      : corollaBlockoutConfig.sceneMm.taillights;
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
  seatMaterial,
  dashMaterial,
  accentMaterial,
}: {
  seatMaterial: MaterialOptions;
  dashMaterial: MaterialOptions;
  accentMaterial: MaterialOptions;
}) {
  const { frontSeats, dashboard, steeringWheel } = corollaBlockoutConfig.sceneMm.interior;

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
  void paint;
  const modelScale = useMemo((): [number, number, number] => {
    const base = corollaBlockoutConfig.dimensionsM;

    return [
      params.overallLength / base.overallLength,
      params.bodyHeight / base.visualHeight,
      params.width / base.overallWidth,
    ];
  }, [params]);

  const hasSportWheels = selected.has("wheels");
  const hasLeds = selected.has("leds");
  const bodyMaterial: MaterialOptions = useMemo(() => ({
    ...corollaBlockoutConfig.materials.body,
  }), []);
  const glass: MaterialOptions = {
    ...visual.materials.glass,
    ...corollaBlockoutConfig.materials.glass,
  };
  const headlightMat: MaterialOptions = useMemo(() => ({
    ...visual.materials.clearLens,
    color: hasLeds ? "#fefce8" : visual.materials.clearLens.color,
    emissive: hasLeds ? "#facc15" : "#000000",
    emissiveIntensity: hasLeds ? 1.2 : 0,
  }), [hasLeds, visual]);
  const wheelPositions = useMemo((): Array<[number, number, number]> => {
    return corollaBlockoutConfig.sceneMm.wheels.centers.map((center) => [
      sourceXToWorldX(center.x, corollaDesignSchema),
      sourceZToWorldY(center.z),
      sourceYToWorldZ(center.y),
    ]);
  }, []);

  return (
    <group rotation={visual.motion.rotation} scale={modelScale}>
      <SedanBodyShell material={{ ...bodyMaterial, ...visual.materials.body }} />
      <SchemaRoofGlassSeals material={{ ...bodyMaterial, ...visual.materials.body }} />
      <SchemaInterior
        seatMaterial={corollaBlockoutConfig.materials.interiorFabricDark}
        dashMaterial={corollaBlockoutConfig.materials.interiorPlasticDark}
        accentMaterial={corollaBlockoutConfig.materials.interiorAccent}
      />
      <SchemaGlass material={glass} />
      <SchemaWindowFrames material={visual.materials.blackTrim} />
      <SchemaPillars material={visual.materials.blackTrim} />
      <SchemaUpperGrille material={visual.materials.glossBlack} />
      <SchemaLowerIntake material={visual.materials.matteBlack} />
      <SchemaFrontBadge material={corollaBlockoutConfig.materials.chrome} />
      <SchemaSideDetails
        fenderMaterial={{ ...bodyMaterial, ...visual.materials.body }}
        trimMaterial={visual.materials.blackTrim}
        handleMaterial={corollaBlockoutConfig.materials.chrome}
        wheelWellMaterial={corollaBlockoutConfig.materials.wheelWell}
      />
      <SchemaLights kind="headlight" material={headlightMat} />
      <SchemaLights kind="taillight" material={visual.materials.redLens} />

      {Array.from(selected).map((id) => {
        const Renderer = accessoryRenderers[id];
        return Renderer ? <Renderer key={id} /> : null;
      })}

      {wheelPositions.map(([x, y, z], index) => (
        <Wheel key={index} x={x} y={y} z={z} sport={hasSportWheels} />
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
