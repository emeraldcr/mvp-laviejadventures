'use client';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface Props {
  position: [number, number, number];
  playerPosRef: React.MutableRefObject<THREE.Vector3>;
  onWin: () => void;
  gameStatus: string;
}

const WIN_DIST = 1.3;

export function Goal({ position, playerPosRef, onWin, gameStatus }: Props) {
  const winFired = useRef(false);
  const flagRef  = useRef<THREE.Mesh>(null);
  const glowRef  = useRef<THREE.PointLight>(null);
  const crystalRef = useRef<THREE.Mesh>(null);
  const t = useRef(0);

  useFrame((_, delta) => {
    t.current += delta;

    if (flagRef.current)   flagRef.current.rotation.z   = Math.sin(t.current * 3) * 0.18;
    if (crystalRef.current) crystalRef.current.rotation.y += delta * 1.2;
    if (glowRef.current)   glowRef.current.intensity = 2.2 + Math.sin(t.current * 2.5) * 0.8;

    if (gameStatus !== 'playing' || winFired.current) return;

    const dx = playerPosRef.current.x - position[0];
    const dy = playerPosRef.current.y - position[1];
    if (Math.sqrt(dx * dx + dy * dy) < WIN_DIST) {
      winFired.current = true;
      onWin();
    }
  });

  return (
    <group position={position}>
      {/* Pole */}
      <mesh position={[0, 1.6, 0]}>
        <cylinderGeometry args={[0.042, 0.042, 3.2, 8]} />
        <meshStandardMaterial color="#d4af37" metalness={0.75} roughness={0.2} />
      </mesh>
      {/* Flag */}
      <mesh ref={flagRef} position={[0.38, 2.65, 0]}>
        <boxGeometry args={[0.75, 0.48, 0.05]} />
        <meshStandardMaterial color="#00c853" emissive="#00e676" emissiveIntensity={0.65} />
      </mesh>
      {/* Glowing crystal at base */}
      <mesh ref={crystalRef} position={[0, 0.35, 0]}>
        <octahedronGeometry args={[0.32, 0]} />
        <meshStandardMaterial
          color="#00e676"
          emissive="#00e676"
          emissiveIntensity={1.8}
          transparent
          opacity={0.82}
        />
      </mesh>
      {/* Stone pedestal */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.28, 0.32, 0.22, 8]} />
        <meshStandardMaterial color="#352518" roughness={0.95} />
      </mesh>
      {/* Lights */}
      <pointLight ref={glowRef} color="#ffd700" intensity={2.2} distance={6} decay={2} />
      <pointLight color="#00e676" intensity={1.4} distance={4} decay={2} />
    </group>
  );
}
