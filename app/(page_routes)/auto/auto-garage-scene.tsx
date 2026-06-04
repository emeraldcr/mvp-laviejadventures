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
  PCFShadowMap,
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
} from "./geometry/createCorolla2016SedanGeometry";
import { BoxPart, CylinderPart, RoundedPart } from "./auto-parts";
import { corollaDesignSchema, corollaVisualControls } from "./cars/corolla";
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

type AxleGeometry = {
  frontAxleX: number;
  rearAxleX: number;
  frontWheelCenterLeft?: SourcePoint3;
  frontWheelCenterRight?: SourcePoint3;
  rearWheelCenterLeft?: SourcePoint3;
  rearWheelCenterRight?: SourcePoint3;
};

type SourceGlasshouse = {
  windshield: {
    lowerLeft: SourcePoint3;
    lowerRight: SourcePoint3;
    upperLeft: SourcePoint3;
    upperRight: SourcePoint3;
  };
  rearGlass: {
    lowerLeft: SourcePoint3;
    lowerRight: SourcePoint3;
    upperLeft: SourcePoint3;
    upperRight: SourcePoint3;
  };
  sideWindowsLeft: {
    frontDoorGlass: SourcePoint3[];
    rearDoorGlass: SourcePoint3[];
  };
};

type SourcePillars = {
  aPillar: {
    base: SourcePoint3;
    top: SourcePoint3;
  };
  bPillar: {
    base: SourcePoint3;
    top: SourcePoint3;
  };
  cPillar: {
    base: SourcePoint3;
    top: SourcePoint3;
  };
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
};

type SourceLightOutline = {
  outline: SourcePoint3[];
};

type SourceHeadlights = {
  left: SourceLightOutline;
};

type SourceTaillights = {
  left: SourceLightOutline;
};

type SourceMirrorParts = {
  leftMirror: {
    mountCenter: SourcePoint3;
    housingCenter: SourcePoint3;
    widthMm: number;
    heightMm: number;
    depthMm: number;
  };
};

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
  const radius = Number(corollaDesignSchema.wheelGeometry.radius);
  const width = Number(corollaDesignSchema.wheelGeometry.width);
  const spokeCount = sport ? 10 : 7;
  const rimMaterial: MaterialOptions = {
    color: sport ? "#e5e7eb" : "#cbd5e1",
    metalness: 0.82,
    roughness: 0.16,
  };
  const tireMaterial: MaterialOptions = { ...visual.materials.tire, color: "#111111" };
  const centerMaterial: MaterialOptions = { color: "#f8fafc", metalness: 0.92, roughness: 0.14 };
  const spokeMaterial: MaterialOptions = {
    color: sport ? "#f8fafc" : "#94a3b8",
    metalness: 0.72,
    roughness: 0.2,
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
  const glasshouse = corollaDesignSchema.windows.sourceGlasshouseMm as SourceGlasshouse;
  const sideWindows = [
    glasshouse.sideWindowsLeft.frontDoorGlass,
    glasshouse.sideWindowsLeft.rearDoorGlass,
  ];

  return (
    <>
      <PolygonPart
        points={[
          sourcePointToWorld(glasshouse.windshield.lowerLeft),
          sourcePointToWorld(glasshouse.windshield.lowerRight),
          sourcePointToWorld(glasshouse.windshield.upperRight),
          sourcePointToWorld(glasshouse.windshield.upperLeft),
        ]}
        material={material}
      />
      <PolygonPart
        points={[
          sourcePointToWorld(glasshouse.rearGlass.lowerLeft),
          sourcePointToWorld(glasshouse.rearGlass.lowerRight),
          sourcePointToWorld(glasshouse.rearGlass.upperRight),
          sourcePointToWorld(glasshouse.rearGlass.upperLeft),
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
  const pillars = corollaDesignSchema.pillars.sourcePillarsMm as SourcePillars;

  return (
    <>
      {([-1, 1] as const).flatMap((side) => [
        <PolygonPart key={`a-pillar-${side}`} points={makePillarPolygon(pillars.aPillar.base, pillars.aPillar.top, side, 24)} material={material} />,
        <PolygonPart key={`b-pillar-${side}`} points={makePillarPolygon(pillars.bPillar.base, pillars.bPillar.top, side, 22)} material={material} />,
        <PolygonPart key={`c-pillar-${side}`} points={makePillarPolygon(pillars.cPillar.base, pillars.cPillar.top, side, 34)} material={material} />,
      ])}
    </>
  );
}

function SchemaUpperGrille({ material }: { material: MaterialOptions }) {
  const frontEnd = corollaDesignSchema.frontDesign.sourceFrontEndMm as SourceFrontEnd;
  const grille = frontEnd.upperGrille;
  const halfWidth = (grille.widthMm * 0.78) / 2;
  const halfHeight = (grille.heightMm * 0.36) / 2;
  const x = grille.center.x + 16;

  return (
    <PolygonPart
      points={[
        sourcePointToWorld({ x, y: -halfWidth, z: grille.center.z - halfHeight }),
        sourcePointToWorld({ x, y: halfWidth, z: grille.center.z - halfHeight }),
        sourcePointToWorld({ x, y: halfWidth, z: grille.center.z + halfHeight }),
        sourcePointToWorld({ x, y: -halfWidth, z: grille.center.z + halfHeight }),
      ]}
      material={material}
    />
  );
}

function SchemaLowerIntake({ material }: { material: MaterialOptions }) {
  const frontEnd = corollaDesignSchema.frontDesign.sourceFrontEndMm as SourceFrontEnd;
  const intake = frontEnd.lowerIntake;
  const halfTop = (intake.widthTopMm * 0.74) / 2;
  const halfBottom = (intake.widthBottomMm * 0.68) / 2;
  const halfHeight = (intake.heightMm * 0.28) / 2;
  const x = intake.center.x + 74;

  return (
    <PolygonPart
      points={[
        sourcePointToWorld({ x, y: -halfBottom, z: intake.center.z - halfHeight }),
        sourcePointToWorld({ x, y: halfBottom, z: intake.center.z - halfHeight }),
        sourcePointToWorld({ x, y: halfTop, z: intake.center.z + halfHeight }),
        sourcePointToWorld({ x, y: -halfTop, z: intake.center.z + halfHeight }),
      ]}
      material={material}
    />
  );
}

function SchemaLights({
  material,
  kind,
}: {
  material: MaterialOptions;
  kind: "headlight" | "taillight";
}) {
  const outline =
    kind === "headlight"
      ? (corollaDesignSchema.headlights.sourceHeadlightsMm as SourceHeadlights).left.outline
      : (corollaDesignSchema.taillights.sourceTaillightsMm as SourceTaillights).left.outline;
  const offset = kind === "headlight" ? 0.008 : 0.004;

  return (
    <>
      <PolygonPart points={outline.map((point) => sourcePointToWorld(point, -1, -offset))} material={material} />
      <PolygonPart points={outline.map((point) => sourcePointToWorld(point, 1, offset))} material={material} />
    </>
  );
}

function SideMirrors({ bodyMaterial }: { bodyMaterial: MaterialOptions }) {
  const sourceMirror = (corollaDesignSchema.mirrors.sourceExteriorPartsMm as SourceMirrorParts).leftMirror;
  const mirrorBase: MaterialOptions = { color: "#050505", roughness: 0.46 };

  return (
    <>
      {([-1, 1] as const).map((side) => (
        <group key={`mirror-${side}`}>
          <BoxPart
            position={sourcePointToWorld({ ...sourceMirror.mountCenter, y: sourceMirror.mountCenter.y * 0.9 }, side, side * 0.006)}
            rotation={[0, side * 0.18, 0]}
            args={[0.075, 0.045, 0.07]}
            material={mirrorBase}
            castShadow
          />
          <RoundedPart
            position={sourcePointToWorld({ ...sourceMirror.housingCenter, y: sourceMirror.housingCenter.y * 0.86 }, side, side * 0.006)}
            args={[sourceMirror.depthMm / 1000, sourceMirror.heightMm / 1000, sourceMirror.widthMm / 1000]}
            radius={0.045}
            smoothness={8}
            material={{ ...bodyMaterial, roughness: 0.24 }}
          />
        </group>
      ))}
    </>
  );
}

function CorollaLikeSedan({ selected, paint }: { selected: Set<AccessoryId>; paint: PaintId }) {
  const visual = corollaVisualControls;
  const paintStyle = paints[paint];
  const hasSportWheels = selected.has("wheels");
  const hasLeds = selected.has("leds");
  const bodyMaterial: MaterialOptions = useMemo(() => ({
    color: paintStyle.color,
    roughness: visual.paintSurface.roughness,
    metalness: visual.paintSurface.metalness,
  }), [paintStyle, visual]);
  const glass: MaterialOptions = {
    ...visual.materials.glass,
    opacity: 0.65,
    transparent: true,
  };
  const headlightMat: MaterialOptions = useMemo(() => ({
    ...visual.materials.clearLens,
    color: hasLeds ? "#fefce8" : visual.materials.clearLens.color,
    emissive: hasLeds ? "#facc15" : "#000000",
    emissiveIntensity: hasLeds ? 1.2 : 0,
  }), [hasLeds, visual]);
  const wheelPositions = useMemo((): Array<[number, number, number]> => {
    const axleGeometry = corollaDesignSchema.wheelGeometry.axleGeometryMm as AxleGeometry;
    const wheelCenters = [
      axleGeometry.frontWheelCenterRight,
      axleGeometry.rearWheelCenterRight,
      axleGeometry.frontWheelCenterLeft,
      axleGeometry.rearWheelCenterLeft,
    ].filter(Boolean) as SourcePoint3[];

    return wheelCenters.map((center) => [
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
      <SchemaLights kind="headlight" material={headlightMat} />
      <SchemaLights kind="taillight" material={visual.materials.redLens} />
      <SideMirrors bodyMaterial={bodyMaterial} />

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
