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
  createSedanTrunkDeckGeometry,
  sourceXToWorldX,
  sourceYToWorldZ,
  sourceZToWorldY,
} from "./cars/corolla/createCorolla2016SedanGeometry";
import { BoxPart, CylinderPart } from "./auto-parts";
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

  return (
    <group position={[x, y, z]} rotation={[Math.PI / 2, 0, 0]}>
      <CylinderPart castShadow args={[radius, radius, width, 48]} material={tireMaterial} />
      <CylinderPart position={[0, width * 0.54, 0]} args={[radius * 0.68, radius * 0.68, 0.032, 40]} material={rimMaterial} />
      {spokeRotations.map((rot, index) => (
        <BoxPart
          key={index}
          position={[0, width * 0.61, 0]}
          rotation={[0, rot, 0]}
          args={[0.032, 0.024, radius * 1.42]}
          material={spokeMaterial}
        />
      ))}
      <CylinderPart position={[0, width * 0.69, 0]} args={[0.07, 0.07, 0.022, 28]} material={centerMaterial} />
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

function SchemaSideDetails({
  trimMaterial,
  handleMaterial,
  wheelWellMaterial,
}: {
  trimMaterial: MaterialOptions;
  handleMaterial: MaterialOptions;
  wheelWellMaterial: MaterialOptions;
}) {
  const { seams, handles, beltline, wheelWells } = corollaBlockoutConfig.sceneMm.sideDetails;
  const sideSurfaceY = 884;

  return (
    <>
      {([-1, 1] as const).flatMap((side) => {
        const sideOffset = side * 0.012;

        return [
          ...seams.map((seam) => {
            const height = (seam.zTop - seam.zBottom) / 1000;
            const position = sourcePointToWorld({
              x: seam.x,
              y: side * sideSurfaceY,
              z: (seam.zTop + seam.zBottom) / 2,
            });

            return (
              <BoxPart
                key={`seam-${side}-${seam.x}`}
                position={[position[0], position[1], position[2] + sideOffset]}
                args={[0.012, height, 0.012]}
                material={trimMaterial}
              />
            );
          }),
          ...handles.map((handle) => {
            const position = sourcePointToWorld({
              x: handle.x,
              y: side * (sideSurfaceY + 8),
              z: handle.z,
            });

            return (
              <BoxPart
                key={`handle-${side}-${handle.x}`}
                position={[position[0], position[1], position[2] + sideOffset]}
                args={[0.16, 0.028, 0.026]}
                material={handleMaterial}
              />
            );
          }),
          ...beltline.slice(0, -1).map((start, index) => {
            const end = beltline[index + 1];
            const dx = (end.x - start.x) / 1000;
            const dz = (end.z - start.z) / 1000;
            const length = Math.hypot(dx, dz);
            const position = sourcePointToWorld({
              x: (start.x + end.x) / 2,
              y: side * (sideSurfaceY + 6),
              z: (start.z + end.z) / 2,
            });

            return (
              <BoxPart
                key={`beltline-${side}-${start.x}`}
                position={[position[0], position[1], position[2] + sideOffset]}
                rotation={[0, 0, Math.atan2(dz, dx)]}
                args={[length, 0.01, 0.012]}
                material={trimMaterial}
              />
            );
          }),
          ...wheelWells.map((well) => {
            const position = sourcePointToWorld({
              x: well.x,
              y: side * 798,
              z: well.z,
            });
            const radius = well.radius / 1000;

            return (
              <CylinderPart
                key={`wheel-well-${side}-${well.x}`}
                position={[position[0], position[1], position[2] - side * 0.006]}
                rotation={[Math.PI / 2, 0, 0]}
                args={[radius, radius, 0.018, 40]}
                material={wheelWellMaterial}
              />
            );
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

function CorollaLikeSedan({ selected, paint }: { selected: Set<AccessoryId>; paint: PaintId }) {
  const visual = corollaVisualControls;
  void paint;

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
    <group rotation={visual.motion.rotation}>
      <SedanBodyShell material={{ ...bodyMaterial, ...visual.materials.body }} />
      <SchemaGlass material={glass} />
      <SchemaPillars material={visual.materials.blackTrim} />
      <SchemaUpperGrille material={visual.materials.glossBlack} />
      <SchemaLowerIntake material={visual.materials.matteBlack} />
      <SchemaFrontBadge material={corollaBlockoutConfig.materials.chrome} />
      <SchemaSideDetails
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

export function GarageScene({ selected, paint }: { params: CarParams; selected: Set<AccessoryId>; paint: PaintId }) {
  return (
    <Canvas shadows={{ type: PCFShadowMap }} dpr={[1, 1.85]} className="h-full w-full">
      <PerspectiveCamera makeDefault position={[5.8, 3.2, 5.9]} fov={41} />
      <color attach="background" args={["#0f141b"]} />
      <ambientLight intensity={0.9} />
      <directionalLight castShadow position={[5.5, 9, 4.5]} intensity={2.6} shadow-mapSize={1536} shadow-bias={-0.0004} />
      <pointLight color="#22c55e" intensity={0.5} position={[-4, 1.4, -3]} distance={7.5} />
      <pointLight color="#f59e0b" intensity={0.38} position={[4, 2.2, -3.5]} distance={9} />

      <group position={[0, -0.18, 0]}>
        <CorollaLikeSedan selected={selected} paint={paint} />
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
