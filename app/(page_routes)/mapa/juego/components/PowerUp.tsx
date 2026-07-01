'use client';
import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { PowerUpData } from '../types';
import { useGameContext } from '../context/GameContext';

interface Props {
  data: PowerUpData;
}

const COLLECT_DIST = 0.9;

const RUBY_COLOR    = '#ff1744';
const RUBY_EMISSIVE = '#b71c1c';
const SAPPH_COLOR    = '#1e88e5';
const SAPPH_EMISSIVE = '#0d47a1';

export function PowerUp({ data }: Props) {
  const { playerPosRef, pendingPowerUpRef } = useGameContext();
  const [collected, setCollected] = useState(false);
  const groupRef = useRef<THREE.Group>(null);
  const phase = useRef(Math.random() * Math.PI * 2);

  useFrame((_, delta) => {
    if (collected || !groupRef.current) return;
    phase.current += delta * 2;

    groupRef.current.rotation.y += delta * 2;
    groupRef.current.position.y = data.position[1] + Math.sin(phase.current) * 0.14;

    const dx = Math.abs(playerPosRef.current.x - data.position[0]);
    const dy = Math.abs(playerPosRef.current.y - groupRef.current.position.y);
    if (dx < COLLECT_DIST && dy < COLLECT_DIST) {
      pendingPowerUpRef.current = data.kind;
      setCollected(true);
    }
  });

  if (collected) return null;

  const isRuby = data.kind === 'ruby';
  const color    = isRuby ? RUBY_COLOR    : SAPPH_COLOR;
  const emissive = isRuby ? RUBY_EMISSIVE : SAPPH_EMISSIVE;
  const lightColor = isRuby ? '#ff1744' : '#1e88e5';

  return (
    <group ref={groupRef} position={data.position}>
      {/* Outer glow ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.3, 0.04, 8, 24]} />
        <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={1.5} transparent opacity={0.5} />
      </mesh>

      {/* Main gem */}
      <mesh>
        <octahedronGeometry args={[0.2, 0]} />
        <meshStandardMaterial
          color={color}
          emissive={emissive}
          emissiveIntensity={2.2}
          roughness={0.1}
          metalness={0.4}
        />
      </mesh>

      {/* Inner smaller gem */}
      <mesh rotation={[Math.PI / 4, 0, Math.PI / 4]}>
        <octahedronGeometry args={[0.1, 0]} />
        <meshStandardMaterial color="#ffffff" emissive={color} emissiveIntensity={3} transparent opacity={0.7} />
      </mesh>

      <pointLight color={lightColor} intensity={1.8} distance={2.5} decay={2} />
    </group>
  );
}
