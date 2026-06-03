"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import {
  ContactShadows,
  OrbitControls,
  PerspectiveCamera,
} from "@react-three/drei";
import { useCallback, useMemo, useRef } from "react";
import { PCFShadowMap } from "three";
import type { Group } from "three";
import { computeCarMetrics } from "./auto-math";
import type { CarMetrics } from "./auto-math";
import { BoxPart, CylinderPart, RoundedPart, TorusPart } from "./auto-parts";
import { corollaVisualControls } from "./cars/corolla-visual";
import { paints } from "./auto-types";
import type {
  AccessoryId,
  CarParams,
  MaterialOptions,
  PaintId,
  Vec3,
} from "./auto-types";

function Wheel({ x, z, sport, params }: { x: number; z: number; sport: boolean; params: CarParams }) {
  const visual = corollaVisualControls;
  const spokeCount = sport ? 10 : 7;
  const rimColor = sport ? "#e5e7eb" : "#cbd5e1";
  const spokeColor = sport ? "#f8fafc" : "#94a3b8";

  const rimMaterial: MaterialOptions = { color: rimColor, metalness: 0.82, roughness: 0.16 };
  const tireMaterial: MaterialOptions = visual.materials.tire;
  const centerMaterial: MaterialOptions = { color: "#f8fafc", metalness: 0.92, roughness: 0.14 };

  const spokeRotations = useMemo(
    () => Array.from({ length: spokeCount }, (_, i) => (i * Math.PI * 2) / spokeCount),
    [spokeCount]
  );

  return (
    <group position={[x, -params.groundClearance - 0.08, z]} rotation={[Math.PI / 2, 0, 0]}>
      <CylinderPart castShadow args={[params.wheelRadius, params.wheelRadius, params.wheelWidth, 48]} material={tireMaterial} />
      <CylinderPart position={[0, 0.155, 0]} args={[params.wheelRadius * 0.72, params.wheelRadius * 0.72, 0.032, 40]} material={rimMaterial} />

      {spokeRotations.map((rot, index) => (
        <BoxPart
          key={index}
          position={[0, 0.175, 0]}
          rotation={[0, rot, 0]}
          args={[0.038, 0.028, params.wheelRadius * 1.55]}
          material={{ color: spokeColor, metalness: 0.72, roughness: 0.2 }}
        />
      ))}
      <CylinderPart position={[0, 0.198, 0]} args={[0.075, 0.075, 0.022, 28]} material={centerMaterial} />
    </group>
  );
}

const accessoryRenderers: Record<AccessoryId, React.FC<{ params: CarParams; metrics: CarMetrics; has: (id: AccessoryId) => boolean }>> = {
  leds: () => null,
  neon: ({ params, metrics }) => (
    <>
      <BoxPart
        position={[metrics.centerX, -params.bodyHeight * 0.92, 0]}
        args={[metrics.bodyLength * 0.97, 0.028, metrics.halfWidth * 1.72]}
        material={{ color: "#38bdf8", emissive: "#0284c7", emissiveIntensity: 2.8 }}
      />
      <pointLight color="#38bdf8" intensity={2.4} position={[0, -params.bodyHeight * 1.05, 0]} distance={6.5} />
    </>
  ),
  spoiler: ({ params, metrics }) => {
    const material: MaterialOptions = { color: "#111827", roughness: 0.26, metalness: 0.38 };
    const rearX = metrics.rearBumperX - 0.18;
    return (
      <group position={[rearX, params.bodyHeight * 0.72, 0]}>
        <BoxPart position={[0, 0.18, 0]} args={[0.26, 0.065, metrics.halfWidth * 1.82]} material={material} castShadow />
        <BoxPart position={[0.18, -0.02, metrics.halfWidth * 0.68]} args={[0.07, 0.38, 0.07]} material={material} castShadow />
        <BoxPart position={[0.18, -0.02, -metrics.halfWidth * 0.68]} args={[0.07, 0.38, 0.07]} material={material} castShadow />
      </group>
    );
  },
  wheels: () => null,
  roofRack: ({ params, metrics }) => {
    const railMat: MaterialOptions = { color: "#18181b", metalness: 0.48, roughness: 0.18 };
    const crossMat: MaterialOptions = { color: "#27272a", metalness: 0.48, roughness: 0.18 };
    const y = params.bodyHeight + params.roofHeight * 0.65;
    return (
      <group position={[metrics.cabinCenterX * 0.15, y, 0]}>
        <BoxPart position={[0.45, 0, metrics.halfWidth * 0.74]} args={[metrics.cabinLength * 0.92, 0.055, 0.065]} material={railMat} castShadow />
        <BoxPart position={[0.45, 0, -metrics.halfWidth * 0.74]} args={[metrics.cabinLength * 0.92, 0.055, 0.065]} material={railMat} castShadow />
        <BoxPart position={[-0.32, 0.07, 0]} args={[0.065, 0.065, metrics.cabinLength * 0.88]} material={crossMat} castShadow />
        <BoxPart position={[1.18, 0.07, 0]} args={[0.065, 0.065, metrics.cabinLength * 0.88]} material={crossMat} castShadow />
      </group>
    );
  },
  sideSkirts: ({ params, metrics }) => (
    <>
      <BoxPart
        position={[metrics.centerX, -params.bodyHeight * 0.68, metrics.halfWidth * 1.05]}
        args={[metrics.bodyLength * 0.88, 0.09, 0.035]}
        material={{ color: "#111827", roughness: 0.38 }}
      />
      <BoxPart
        position={[metrics.centerX, -params.bodyHeight * 0.68, -metrics.halfWidth * 1.05]}
        args={[metrics.bodyLength * 0.88, 0.09, 0.035]}
        material={{ color: "#111827", roughness: 0.38 }}
      />
    </>
  ),
};

function CorollaLikeSedan({ params, selected, paint }: { params: CarParams; selected: Set<AccessoryId>; paint: PaintId }) {
  const visual = corollaVisualControls;
  const groupRef = useRef<Group>(null);
  const elapsedRef = useRef(0);
  const paintStyle = paints[paint];
  const metrics = useMemo(() => computeCarMetrics(params), [params]);
  const has = useCallback((id: AccessoryId) => selected.has(id), [selected]);

  useFrame((_, delta) => {
    elapsedRef.current += delta;
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(elapsedRef.current * visual.motion.floatSpeed) * visual.motion.floatAmplitude;
      if (visual.motion.continuousRotationSpeed !== 0) {
        groupRef.current.rotation.y += delta * visual.motion.continuousRotationSpeed;
      }
    }
  });

  const bodyMaterial: MaterialOptions = useMemo(() => ({
    color: paintStyle.color,
    roughness: visual.paintSurface.roughness,
    metalness: visual.paintSurface.metalness,
  }), [paintStyle, visual]);

  const accentMaterial: MaterialOptions = useMemo(() => ({
    color: paintStyle.accent,
    roughness: visual.paintSurface.accentRoughness,
    metalness: 0.16,
  }), [paintStyle, visual]);

  const blackTrim: MaterialOptions = visual.materials.blackTrim;
  const glass: MaterialOptions = visual.materials.glass;
  const chrome: MaterialOptions = visual.materials.chrome;
  const headlightMat: MaterialOptions = useMemo(() => ({
    ...visual.materials.clearLens,
    color: has("leds") ? "#fefce8" : visual.materials.clearLens.color,
    emissive: has("leds") ? "#facc15" : "#000000",
    emissiveIntensity: has("leds") ? 2.4 : 0,
  }), [has, visual]);

  const roundedBody = useMemo(() => [
    {
      ...visual.bodyVolumes.mainBody,
    },
    {
      ...visual.bodyVolumes.frontMass,
    },
    {
      ...visual.bodyVolumes.rearMass,
    },
    {
      ...visual.bodyVolumes.hoodCrown,
    },
    {
      ...visual.bodyVolumes.trunkDeck,
    },
  ], [visual]);

  const cabinStructure = useMemo(() => {
    return visual.windows.pillars.map((pillar) => ({
      position: [pillar.x, pillar.y, 0] as Vec3,
      rotation: [0, 0, pillar.rotationZ] as Vec3,
      args: [pillar.w, pillar.h, metrics.halfWidth * 1.46] as Vec3,
      material: blackTrim,
    })).concat([
      {
        position: [metrics.cabinCenterX + 0.08, params.bodyHeight * 0.78, 0] as Vec3,
        rotation: [0, 0, 0] as Vec3,
        args: [metrics.cabinLength * 1.05, 0.04, metrics.halfWidth * 1.48] as Vec3,
        material: bodyMaterial,
      },
    ]);
  }, [visual, metrics, params, bodyMaterial, blackTrim]);

  const glassPanels = useMemo(() => [
    {
      position: visual.windows.rearGlass.position as Vec3,
      rotation: visual.windows.rearGlass.rotation as Vec3,
      args: visual.windows.rearGlass.args as Vec3,
    },
    {
      position: visual.windows.windshield.position as Vec3,
      rotation: visual.windows.windshield.rotation as Vec3,
      args: visual.windows.windshield.args as Vec3,
    },
  ], [visual]);

  const frontPieces = useMemo(() => [
    { ...visual.lighting.front.grille, material: visual.materials.glossBlack },
    { ...visual.lighting.front.lowerIntake, material: visual.materials.matteBlack },
    { ...visual.lighting.front.chromeBar, material: chrome },
  ], [visual, chrome]);

  const frontLights = useMemo(() => [
    ...visual.lighting.front.headlights.map((light) => ({
      position: light.position as Vec3,
      rotation: [0, light.rotationY, 0] as Vec3,
      args: [0.055, 0.14, 0.52] as Vec3,
      material: headlightMat,
    })),
    ...visual.lighting.front.turnSignals.map((light) => ({
      position: light.position as Vec3,
      rotation: [0, light.rotationY, 0] as Vec3,
      args: [0.04, 0.11, 0.16] as Vec3,
      material: visual.materials.amberLens,
    })),
  ], [visual, headlightMat]);

  const rearPieces = useMemo(() => [
    ...visual.lighting.rear.taillights.map((light) => ({
      position: light.position as Vec3,
      args: [0.055, 0.22, 0.34] as Vec3,
      material: visual.materials.redLens,
    })),
    { ...visual.lighting.rear.bumper, material: accentMaterial },
    { position: visual.smallParts.plate.rearPosition, args: visual.smallParts.plate.size, material: chrome },
  ], [visual, accentMaterial, chrome]);

  const wheelPositions = useMemo((): Array<[number, number]> => [
    [metrics.frontAxleX, metrics.halfWidth * 1.16],
    [metrics.rearAxleX, metrics.halfWidth * 1.16],
    [metrics.frontAxleX, -metrics.halfWidth * 1.16],
    [metrics.rearAxleX, -metrics.halfWidth * 1.16],
  ], [metrics]);

  return (
    <group ref={groupRef} rotation={visual.motion.rotation}>
      {roundedBody.map((part, i) => (
        <RoundedPart key={i} {...part} material={bodyMaterial} />
      ))}

      <group position={visual.bodyVolumes.cabinShell.position}>
        <RoundedPart args={visual.bodyVolumes.cabinShell.args} radius={visual.bodyVolumes.cabinShell.radius ?? 0.14} smoothness={10} material={{ ...bodyMaterial, ...visual.materials.cabinBody }} />
        {cabinStructure.map((part, i) => (
          <BoxPart key={i} {...part} />
        ))}
      </group>

      {glassPanels.map((part, i) => (
        <BoxPart key={i} {...part} material={glass} />
      ))}
      {frontPieces.map((part, i) => (
        <BoxPart key={i} {...part} />
      ))}
      {frontLights.map((part, i) => (
        <BoxPart key={i} {...part} />
      ))}

      {has("leds") && (
        <>
          <pointLight color="#facc15" intensity={1.35} position={[metrics.frontBumperX + 0.42, params.frontLightHeight, metrics.halfWidth * 0.7]} distance={4.5} />
          <pointLight color="#facc15" intensity={1.35} position={[metrics.frontBumperX + 0.42, params.frontLightHeight, -metrics.halfWidth * 0.7]} distance={4.5} />
        </>
      )}

      {rearPieces.map((part, i) => (
        <BoxPart key={i} {...part} />
      ))}

      <SideDetails side={1} />
      <SideDetails side={-1} />
      <DoorAndMirrorDetails side={1} metrics={metrics} params={params} bodyMaterial={bodyMaterial} />
      <DoorAndMirrorDetails side={-1} metrics={metrics} params={params} bodyMaterial={bodyMaterial} />
      <RoofAndRearSmallParts bodyMaterial={bodyMaterial} />

      <BoxPart position={[0, visual.bodyVolumes.lowerTrimY, metrics.halfWidth * 1.11]} args={[metrics.bodyLength * 0.94, 0.13, 0.038]} material={{ color: "#111827", roughness: 0.4 }} />
      <BoxPart position={[0, visual.bodyVolumes.lowerTrimY, -metrics.halfWidth * 1.11]} args={[metrics.bodyLength * 0.94, 0.13, 0.038]} material={{ color: "#111827", roughness: 0.4 }} />

      {Array.from(selected).map((id) => {
        const Renderer = accessoryRenderers[id];
        return Renderer ? <Renderer key={id} params={params} metrics={metrics} has={has} /> : null;
      })}

      <WheelArchSet material={{ ...bodyMaterial, roughness: 0.34, metalness: 0.11 }} metrics={metrics} params={params} />
      {wheelPositions.map(([x, z], i) => (
        <Wheel key={i} x={x} z={z} sport={has("wheels")} params={params} />
      ))}
    </group>
  );
}

function SideDetails({ side }: { side: 1 | -1 }) {
  const visual = corollaVisualControls;
  const glass: MaterialOptions = { color: "#12232d", roughness: 0.1, metalness: 0.2 };
  const trim: MaterialOptions = { color: "#0a0f18", roughness: 0.22 };
  const chrome: MaterialOptions = { color: "#94a3b8", roughness: 0.26, metalness: 0.42 };

  return (
    <group position={[0, 0, side * visual.windows.glassSideOffset]}>
      {visual.windows.sideWindows.map((window, index) => (
        <BoxPart
          key={index}
          position={[window.x, window.y, 0]}
          rotation={[0, 0, "rotationZ" in window ? window.rotationZ : 0]}
          args={[window.w, window.h, 0.03]}
          material={glass}
        />
      ))}

      {visual.windows.pillars.map((pillar, index) => (
        <BoxPart
          key={index}
          position={[pillar.x, pillar.y, side * 0.02]}
          rotation={[0, 0, pillar.rotationZ]}
          args={[pillar.w, pillar.h, 0.034]}
          material={trim}
        />
      ))}

      {visual.characterLines.beltlineSegments.map((segment, index) => (
        <BoxPart
          key={index}
          position={[segment.x, visual.characterLines.beltlineY, side * 0.022]}
          args={[segment.length, 0.022, 0.036]}
          material={chrome}
        />
      ))}
    </group>
  );
}

function DoorAndMirrorDetails({
  side,
  metrics,
  params,
  bodyMaterial,
}: {
  side: 1 | -1;
  metrics: CarMetrics;
  params: CarParams;
  bodyMaterial: MaterialOptions;
}) {
  const visual = corollaVisualControls;
  const trim: MaterialOptions = { color: "#111827", roughness: 0.3, metalness: 0.12 };
  const handle: MaterialOptions = { color: "#e5e7eb", roughness: 0.18, metalness: 0.45 };
  const mirrorBase: MaterialOptions = { color: "#050505", roughness: 0.46 };
  const sideZ = side * metrics.halfWidth * 1.18;

  return (
    <group>
      <group position={[0, 0, sideZ]}>
        {visual.characterLines.doorCuts.map((cut, index) => (
          <BoxPart
            key={index}
            position={[cut.x, params.bodyHeight * 0.1, side * 0.012]}
            args={[0.032, params.bodyHeight * cut.heightRatio, 0.024]}
            material={trim}
          />
        ))}
        {visual.characterLines.handles.map((handlePart, index) => (
          <BoxPart
            key={index}
            position={[handlePart.x, handlePart.y, side * 0.02]}
            args={[0.22, 0.035, 0.035]}
            material={handle}
          />
        ))}
        <BoxPart
          position={[0, visual.characterLines.rocker.y, side * 0.01]}
          args={[visual.characterLines.rocker.length, visual.characterLines.rocker.height, 0.03]}
          material={trim}
        />
      </group>

      <group position={[visual.smallParts.mirrors.x, visual.smallParts.mirrors.y, side * visual.smallParts.mirrors.sideOffset]}>
        <BoxPart position={[0, -0.03, -side * 0.05]} rotation={[0, side * 0.18, 0]} args={visual.smallParts.mirrors.baseSize} material={mirrorBase} castShadow />
        <RoundedPart position={[-0.08, 0.02, side * 0.08]} args={visual.smallParts.mirrors.capSize} radius={0.045} smoothness={8} material={{ ...bodyMaterial, roughness: 0.24 }} />
      </group>
    </group>
  );
}

function RoofAndRearSmallParts({ bodyMaterial }: { bodyMaterial: MaterialOptions }) {
  const visual = corollaVisualControls;
  return (
    <>
      <BoxPart
        position={visual.smallParts.antenna.position}
        rotation={[0.18, 0, 0]}
        args={visual.smallParts.antenna.size}
        material={{ color: "#050505", roughness: 0.42 }}
        castShadow
      />
      <BoxPart
        position={[visual.bodyVolumes.trunkDeck.position[0], visual.bodyVolumes.trunkDeck.position[1] + 0.035, 0]}
        args={[visual.bodyVolumes.trunkDeck.args[0] * 0.8, 0.018, visual.bodyVolumes.trunkDeck.args[2] * 0.78]}
        material={{ ...bodyMaterial, roughness: 0.2 }}
      />
    </>
  );
}

function WheelArchSet({ material, metrics, params }: { material: MaterialOptions; metrics: CarMetrics; params: CarParams }) {
  const positions: Array<[number, number]> = [
    [metrics.frontAxleX, metrics.halfWidth * 1.08],
    [metrics.rearAxleX, metrics.halfWidth * 1.08],
    [metrics.frontAxleX, -metrics.halfWidth * 1.08],
    [metrics.rearAxleX, -metrics.halfWidth * 1.08],
  ];

  return (
    <>
      {positions.map(([x, z], i) => (
        <TorusPart key={i} position={[x, -params.bodyHeight * 0.48, z]} args={[params.wheelRadius * 1.52, 0.038, 12, 44]} material={material} />
      ))}
    </>
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
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.805, 0]}>
          <ringGeometry args={[3.05, 3.14, 128]} />
          <meshBasicMaterial color="#f59e0b" transparent opacity={0.65} />
        </mesh>
      </group>

      <ContactShadows position={[0, -1.0, 0]} opacity={0.42} scale={8.5} blur={2.6} far={3.2} />
      <OrbitControls enablePan={false} minDistance={4.2} maxDistance={8.5} minPolarAngle={0.52} maxPolarAngle={1.38} />
    </Canvas>
  );
}
