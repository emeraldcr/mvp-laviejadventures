'use client';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { EnemyData } from '../types';

interface Props {
  data: EnemyData;
  playerPosRef: React.MutableRefObject<THREE.Vector3>;
  onPlayerHit: () => void;
  gameStatus: string;
}

const PATROL_SPEED = 2.4;
const HIT_DIST = 0.72;

export function Enemy({ data, playerPosRef, onPlayerHit, gameStatus }: Props) {
  const groupRef  = useRef<THREE.Group>(null);
  const posX      = useRef(data.position[0]);
  const dir       = useRef(1);
  const hitCd     = useRef(false);
  const leftWing  = useRef<THREE.Mesh>(null);
  const rightWing = useRef<THREE.Mesh>(null);
  const t         = useRef(0);

  useFrame((_, delta) => {
    if (gameStatus !== 'playing' || !groupRef.current) return;
    t.current += delta;

    const minX = data.position[0] - data.patrolRange;
    const maxX = data.position[0] + data.patrolRange;

    posX.current += dir.current * PATROL_SPEED * delta;
    if (posX.current >= maxX) { posX.current = maxX; dir.current = -1; }
    if (posX.current <= minX) { posX.current = minX; dir.current =  1; }

    // Float and move
    groupRef.current.position.x = posX.current;
    groupRef.current.position.y = data.position[1] + Math.sin(t.current * 3.5) * 0.18;
    groupRef.current.scale.x = dir.current; // flip to face direction

    // Wing flap
    const flapAngle = 0.4 + Math.sin(t.current * 9) * 0.5;
    if (leftWing.current)  leftWing.current.rotation.z  =  flapAngle;
    if (rightWing.current) rightWing.current.rotation.z = -flapAngle;

    // Player hit detection
    const dx = playerPosRef.current.x - posX.current;
    const dy = playerPosRef.current.y - data.position[1];
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < HIT_DIST && !hitCd.current) {
      hitCd.current = true;
      onPlayerHit();
      setTimeout(() => { hitCd.current = false; }, 2200);
    }
  });

  return (
    <group ref={groupRef} position={data.position}>
      {/* Body */}
      <mesh>
        <boxGeometry args={[0.52, 0.44, 0.32]} />
        <meshStandardMaterial color="#4a0e78" emissive="#7a2fa8" emissiveIntensity={0.55} />
      </mesh>
      {/* Left wing */}
      <mesh ref={leftWing} position={[-0.48, 0.06, 0]}>
        <boxGeometry args={[0.52, 0.11, 0.05]} />
        <meshStandardMaterial color="#6a1b9a" transparent opacity={0.72} />
      </mesh>
      {/* Right wing */}
      <mesh ref={rightWing} position={[0.48, 0.06, 0]}>
        <boxGeometry args={[0.52, 0.11, 0.05]} />
        <meshStandardMaterial color="#6a1b9a" transparent opacity={0.72} />
      </mesh>
      {/* Eyes */}
      <mesh position={[ 0.13, 0.09, 0.17]}>
        <sphereGeometry args={[0.058, 6, 6]} />
        <meshStandardMaterial color="#ff1744" emissive="#ff1744" emissiveIntensity={2.5} />
      </mesh>
      <mesh position={[-0.13, 0.09, 0.17]}>
        <sphereGeometry args={[0.058, 6, 6]} />
        <meshStandardMaterial color="#ff1744" emissive="#ff1744" emissiveIntensity={2.5} />
      </mesh>
      <pointLight color="#8b00ff" intensity={0.7} distance={2} decay={2} />
    </group>
  );
}
