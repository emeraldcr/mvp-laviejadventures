'use client';
import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { EnemyData, GameState } from '../types';
import { useGameRuntimeContext } from '../context/GameContext';

interface Props {
  data: EnemyData;
  gameStatus: GameState['status'];
}

const PATROL_SPEED = 2.4;
const SIDE_HIT_X   = 0.62;
const SIDE_HIT_Y   = 0.42;
const STOMP_X      = 0.58;
const STOMP_MIN_Y  = 0.36;
const STOMP_MAX_Y  = 0.92;
const BULLET_HIT_X = 0.52;
const BULLET_HIT_Y = 0.38;

export function Enemy({ data, gameStatus }: Props) {
  const { playerPosRef, bulletsRef, handlePlayerHit } = useGameRuntimeContext();
  const [defeated, setDefeated] = useState(false);
  const [defeatedPos, setDefeatedPos] = useState<[number, number, number]>(data.position);
  const groupRef  = useRef<THREE.Group>(null);
  const posX      = useRef(data.position[0]);
  const dir       = useRef(1);
  const hitCd     = useRef(false);
  const stomped   = useRef(false);
  const lastPlayerY = useRef(data.position[1] + STOMP_MAX_Y);
  const leftWing  = useRef<THREE.Mesh>(null);
  const rightWing = useRef<THREE.Mesh>(null);
  const t         = useRef(0);

  useFrame((_, delta) => {
    if (gameStatus !== 'playing' || !groupRef.current || defeated) return;
    t.current += delta;

    const minX = data.position[0] - data.patrolRange;
    const maxX = data.position[0] + data.patrolRange;

    posX.current += dir.current * PATROL_SPEED * delta;
    if (posX.current >= maxX) { posX.current = maxX; dir.current = -1; }
    if (posX.current <= minX) { posX.current = minX; dir.current =  1; }

    groupRef.current.position.x = posX.current;
    const enemyY = data.position[1] + Math.sin(t.current * 3.5) * 0.18;
    groupRef.current.position.y = enemyY;
    groupRef.current.scale.x = dir.current;

    const flapAngle = 0.4 + Math.sin(t.current * 9) * 0.5;
    if (leftWing.current)  leftWing.current.rotation.z  =  flapAngle;
    if (rightWing.current) rightWing.current.rotation.z = -flapAngle;

    // ── Bullet collision ───────────────────────────────────────────────────
    const bullets = bulletsRef.current;
    for (let i = bullets.length - 1; i >= 0; i--) {
      const b = bullets[i];
      if (Math.abs(b.x - posX.current) < BULLET_HIT_X && Math.abs(b.y - enemyY) < BULLET_HIT_Y) {
        bullets.splice(i, 1);
        setDefeatedPos([posX.current, enemyY, data.position[2]]);
        setDefeated(true);
        return;
      }
    }

    // ── Player collision ───────────────────────────────────────────────────
    const dx = playerPosRef.current.x - posX.current;
    const dy = playerPosRef.current.y - enemyY;
    const fallingOrLevel = playerPosRef.current.y <= lastPlayerY.current + 0.02;
    const stompHit = Math.abs(dx) < STOMP_X && dy > STOMP_MIN_Y && dy < STOMP_MAX_Y && fallingOrLevel;

    if (stompHit && !stomped.current) {
      stomped.current = true;
      setDefeatedPos([posX.current, enemyY, data.position[2]]);
      setDefeated(true);
      return;
    }

    const sideHit = Math.abs(dx) < SIDE_HIT_X && Math.abs(dy) < SIDE_HIT_Y;
    if (sideHit && !hitCd.current) {
      hitCd.current = true;
      handlePlayerHit();
      setTimeout(() => { hitCd.current = false; }, 2200);
    }

    lastPlayerY.current = playerPosRef.current.y;
  });

  if (defeated) {
    return (
      <group position={defeatedPos}>
        <mesh scale={[0.9, 0.18, 0.5]}>
          <sphereGeometry args={[0.42, 10, 8]} />
          <meshStandardMaterial color="#7a2fa8" emissive="#00e676" emissiveIntensity={0.7} transparent opacity={0.55} />
        </mesh>
        <pointLight color="#00e676" intensity={0.6} distance={1.5} decay={2} />
      </group>
    );
  }

  return (
    <group ref={groupRef} position={data.position}>
      <mesh>
        <boxGeometry args={[0.52, 0.44, 0.32]} />
        <meshStandardMaterial color="#4a0e78" emissive="#7a2fa8" emissiveIntensity={0.55} />
      </mesh>
      <mesh ref={leftWing} position={[-0.48, 0.06, 0]}>
        <boxGeometry args={[0.52, 0.11, 0.05]} />
        <meshStandardMaterial color="#6a1b9a" transparent opacity={0.72} />
      </mesh>
      <mesh ref={rightWing} position={[0.48, 0.06, 0]}>
        <boxGeometry args={[0.52, 0.11, 0.05]} />
        <meshStandardMaterial color="#6a1b9a" transparent opacity={0.72} />
      </mesh>
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
