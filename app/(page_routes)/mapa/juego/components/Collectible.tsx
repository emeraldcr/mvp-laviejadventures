'use client';
import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import type { CollectibleData } from '../types';

interface Props {
  data: CollectibleData;
  playerPosRef: React.MutableRefObject<THREE.Vector3>;
  onCollect: (id: string) => void;
}

const COLLECT_DIST = 0.75;
const _crystalVec = new THREE.Vector3();

export function Collectible({ data, playerPosRef, onCollect }: Props) {
  const [collected, setCollected] = useState(false);
  const meshRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  const phase = useRef(Math.random() * Math.PI * 2);

  useFrame((_, delta) => {
    if (collected || !meshRef.current) return;
    phase.current += delta;

    meshRef.current.rotation.y += delta * 1.6;
    meshRef.current.position.y = data.position[1] + Math.sin(phase.current * 2) * 0.14;

    if (lightRef.current) {
      lightRef.current.intensity = 0.9 + Math.sin(phase.current * 3) * 0.3;
    }

    // 3-D distance from player center to current crystal position
    _crystalVec.set(data.position[0], meshRef.current.position.y, data.position[2]);
    const dist = playerPosRef.current.distanceTo(_crystalVec);

    if (dist < COLLECT_DIST) {
      setCollected(true);
      onCollect(data.id);
    }
  });

  if (collected) return null;

  return (
    <group position={data.position}>
      <mesh ref={meshRef}>
        <octahedronGeometry args={[0.21, 0]} />
        <meshStandardMaterial
          color="#00e676"
          emissive="#00e676"
          emissiveIntensity={1.3}
          metalness={0.2}
          roughness={0.08}
        />
      </mesh>
      <Sparkles count={10} scale={0.7} size={0.7} speed={0.35} color="#00e676" />
      <pointLight ref={lightRef} color="#00e676" intensity={1} distance={2.2} decay={2} />
    </group>
  );
}
