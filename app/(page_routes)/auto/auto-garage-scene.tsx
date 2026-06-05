"use client";

import { Canvas } from "@react-three/fiber";
import {
  ContactShadows,
  OrbitControls,
  PerspectiveCamera,
} from "@react-three/drei";
import { PCFShadowMap } from "three";
import { BlockoutVehicle } from "./cars/shared/blockout-renderer";
import type { AccessoryId, PaintId } from "./auto-types";
import type { RenderableCarPreset } from "./cars/shared/blockout-types";

export function GarageScene({
  preset,
  selected,
  paint,
}: {
  preset: RenderableCarPreset;
  selected: Set<AccessoryId>;
  paint: PaintId;
}) {
  return (
    <Canvas shadows={{ type: PCFShadowMap }} dpr={[1, 1.85]} className="h-full w-full">
      <PerspectiveCamera makeDefault position={[5.8, 3.2, 5.9]} fov={41} />
      <color attach="background" args={["#0f141b"]} />
      <ambientLight intensity={0.9} />
      <directionalLight castShadow position={[5.5, 9, 4.5]} intensity={2.6} shadow-mapSize={1536} shadow-bias={-0.0004} />
      <pointLight color="#22c55e" intensity={0.5} position={[-4, 1.4, -3]} distance={7.5} />
      <pointLight color="#f59e0b" intensity={0.38} position={[4, 2.2, -3.5]} distance={9} />

      <group position={[0, -0.18, 0]}>
        <BlockoutVehicle preset={preset} selected={selected} paint={paint} />
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
