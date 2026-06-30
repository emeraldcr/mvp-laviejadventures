'use client';
import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { CollectibleData } from '../types';

interface Props {
  data: CollectibleData;
  playerPosRef: React.MutableRefObject<THREE.Vector3>;
  onCollect: (id: string) => void;
}

const COLLECT_DIST = 0.75;
const _vec = new THREE.Vector3();

export function Collectible({ data, playerPosRef, onCollect }: Props) {
  const [collected, setCollected] = useState(false);
  const groupRef = useRef<THREE.Group>(null);
  const phase = useRef((data.id.charCodeAt(1) || 1) * 0.9);

  useFrame((_, delta) => {
    if (collected || !groupRef.current) return;
    phase.current += delta;

    groupRef.current.rotation.y += delta * 1.25;
    groupRef.current.position.y = data.position[1] + Math.sin(phase.current * 1.8) * 0.1;

    _vec.set(data.position[0], groupRef.current.position.y, data.position[2]);
    if (playerPosRef.current.distanceTo(_vec) < COLLECT_DIST) {
      setCollected(true);
      onCollect(data.id);
    }
  });

  if (collected) return null;

  return (
    <group ref={groupRef} position={data.position}>
      <mesh>
        <octahedronGeometry args={[0.22, 0]} />
        <meshStandardMaterial color="#00e676" emissive="#00e676" emissiveIntensity={1.25} roughness={0.18} />
      </mesh>
    </group>
  );
}
