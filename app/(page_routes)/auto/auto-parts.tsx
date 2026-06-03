import { RoundedBox } from "@react-three/drei";
import type { ReactNode } from "react";
import type { MaterialOptions, PartProps, Vec3 } from "./auto-types";

export function Material(props: MaterialOptions) {
  return <meshPhysicalMaterial {...props} />;
}

export function BoxPart({
  args,
  material,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  castShadow,
  receiveShadow,
}: PartProps & { args: Vec3 }) {
  return (
    <mesh castShadow={castShadow} receiveShadow={receiveShadow} position={position} rotation={rotation}>
      <boxGeometry args={args} />
      <Material {...material} />
    </mesh>
  );
}

export function RoundedPart({
  args,
  radius,
  smoothness = 8,
  material,
  position = [0, 0, 0],
  castShadow = true,
  children,
}: PartProps & { args: Vec3; radius: number; smoothness?: number; children?: ReactNode }) {
  return (
    <RoundedBox args={args} radius={radius} smoothness={smoothness} castShadow={castShadow} position={position}>
      <Material {...material} />
      {children}
    </RoundedBox>
  );
}

export function CylinderPart({
  args,
  material,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  castShadow,
}: Omit<PartProps, "receiveShadow"> & { args: [number, number, number, number] }) {
  return (
    <mesh castShadow={castShadow} position={position} rotation={rotation}>
      <cylinderGeometry args={args} />
      <Material {...material} />
    </mesh>
  );
}

export function TorusPart({
  args,
  material,
  position = [0, 0, 0],
}: Pick<PartProps, "position" | "material"> & { args: [number, number, number, number] }) {
  return (
    <mesh position={position}>
      <torusGeometry args={args} />
      <Material {...material} />
    </mesh>
  );
}
