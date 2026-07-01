'use client';
import { useEffect, useRef, type MutableRefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { KeyState } from '../hooks/useKeyboard';
import type { PlatformData } from '../types';
import { DEATH_Y } from '../data/levelData';

const SPEED = 6;
const JUMP_VEL = 12;
const JUMP2_VEL = 10.5;
const GRAVITY = -28;
const GLIDE_FALL = -4.2;
const MAX_JUMPS = 2;
const P_HALF_W = 0.28;
const P_HALF_H = 0.42;
const MAX_FRAME_DT = 1 / 30;
const PHYSICS_STEP = 1 / 120;

interface Props {
  keys: MutableRefObject<KeyState>;
  platforms: PlatformData[];
  spawnPos: [number, number, number];
  playerPosRef: MutableRefObject<THREE.Vector3>;
  gameStatus: string;
  onDie: () => void;
}

export function Player({ keys, platforms, spawnPos, playerPosRef, gameStatus, onDie }: Props) {
  const groupRef = useRef<THREE.Group>(null);
  const visualRef = useRef<THREE.Group>(null);
  const vel = useRef(new THREE.Vector3());
  const grounded = useRef(false);
  const jumpCount = useRef(0);
  const jumpWas = useRef(false);
  const deathFired = useRef(false);
  const animT = useRef(0);
  const facingR = useRef(true);

  const eyeL = useRef<THREE.Mesh>(null);
  const eyeR = useRef<THREE.Mesh>(null);
  const blinkT = useRef(0);

  useEffect(() => {
    if (gameStatus === 'playing') {
      if (groupRef.current) groupRef.current.position.set(...spawnPos);
      vel.current.set(0, 0, 0);
      jumpCount.current = 0;
      deathFired.current = false;
      grounded.current = false;
    }
  }, [gameStatus, spawnPos]);

  useFrame((_, delta) => {
    if (!groupRef.current || gameStatus !== 'playing') return;

    const pos = groupRef.current.position;
    const k = keys.current;
    const frameDt = Math.min(delta, MAX_FRAME_DT);
    const steps = Math.max(1, Math.ceil(frameDt / PHYSICS_STEP));
    const dt = frameDt / steps;

    animT.current += delta;
    blinkT.current += delta;

    const wasGrounded = grounded.current;
    const moveX = (k.right ? 1 : 0) - (k.left ? 1 : 0);
    vel.current.x = moveX * SPEED;
    if (moveX !== 0) facingR.current = moveX > 0;

    const jumpNow = k.jump;
    if (jumpNow && !jumpWas.current) {
      if (wasGrounded) {
        vel.current.y = JUMP_VEL;
        jumpCount.current = 1;
      } else if (jumpCount.current < MAX_JUMPS) {
        vel.current.y = JUMP2_VEL;
        jumpCount.current++;
      }
    }
    jumpWas.current = jumpNow;

    grounded.current = false;

    for (let step = 0; step < steps; step++) {
      vel.current.y += GRAVITY * dt;

      if (k.jump && vel.current.y < GLIDE_FALL && jumpCount.current >= 1) {
        vel.current.y = GLIDE_FALL;
      }

      pos.x += vel.current.x * dt;
      for (const p of platforms) {
        const [px, py] = p.position;
        const [pw, ph] = p.size;
        const ox = Math.abs(pos.x - px) - (pw * 0.5 + P_HALF_W);
        const oy = Math.abs(pos.y - py) - (ph * 0.5 + P_HALF_H);

        if (ox < 0 && oy < 0) {
          const pushX = pw * 0.5 + P_HALF_W - Math.abs(pos.x - px);
          pos.x += pos.x > px ? pushX : -pushX;
          vel.current.x = 0;
        }
      }

      const prevY = pos.y;
      pos.y += vel.current.y * dt;

      for (const p of platforms) {
        const [px, py] = p.position;
        const [pw, ph] = p.size;
        const platformTop = py + ph * 0.5;
        const platformBottom = py - ph * 0.5;
        const ox = Math.abs(pos.x - px) - (pw * 0.5 + P_HALF_W);
        const oy = Math.abs(pos.y - py) - (ph * 0.5 + P_HALF_H);

        if (ox < 0 && oy < 0) {
          if (prevY - P_HALF_H >= platformTop && vel.current.y <= 0) {
            pos.y = platformTop + P_HALF_H;
            vel.current.y = 0;
            grounded.current = true;
            jumpCount.current = 0;
          } else if (prevY + P_HALF_H <= platformBottom && vel.current.y > 0) {
            pos.y = platformBottom - P_HALF_H;
            vel.current.y = 0;
          }
        }
      }
    }

    if (pos.y < DEATH_Y && !deathFired.current) {
      deathFired.current = true;
      onDie();
    }

    playerPosRef.current.copy(pos);

    const g = groupRef.current;
    const v = visualRef.current;
    g.scale.x = facingR.current ? 1 : -1;

    if (grounded.current) {
      if (v) v.position.y = Math.sin(animT.current * 4.5) * 0.007;
      g.rotation.z = THREE.MathUtils.lerp(g.rotation.z, -moveX * 0.14, 0.14);
      g.scale.y = THREE.MathUtils.lerp(g.scale.y, 1, 0.18);
    } else {
      if (v) v.position.y = 0;
      const stretch = vel.current.y > 0 ? 1.28 : 0.84;
      g.scale.y = THREE.MathUtils.lerp(g.scale.y, stretch, 0.14);
      g.rotation.z = THREE.MathUtils.lerp(g.rotation.z, 0, 0.09);
    }

    const blink = blinkT.current % 3 < 0.1;
    const eyeScaleY = blink ? 0.15 : 1;
    if (eyeL.current) eyeL.current.scale.y = eyeScaleY;
    if (eyeR.current) eyeR.current.scale.y = eyeScaleY;
  });

  return (
    <group ref={groupRef} position={spawnPos}>
      <group ref={visualRef}>
        <mesh>
          <sphereGeometry args={[0.34, 18, 18]} />
          <meshStandardMaterial
            color="#d4f0ff"
            emissive="#4fc3f7"
            emissiveIntensity={0.65}
            transparent
            opacity={0.87}
          />
        </mesh>

        <mesh position={[0, -0.27, 0]}>
          <coneGeometry args={[0.34, 0.44, 8, 1, true]} />
          <meshStandardMaterial
            color="#c4e8ff"
            emissive="#4fc3f7"
            emissiveIntensity={0.5}
            transparent
            opacity={0.7}
            side={THREE.DoubleSide}
          />
        </mesh>

        {[-0.14, 0, 0.14].map((xoff, i) => (
          <mesh key={i} position={[xoff, -0.48, 0]}>
            <sphereGeometry args={[0.087, 8, 8]} />
            <meshStandardMaterial
              color="#c4e8ff"
              emissive="#4fc3f7"
              emissiveIntensity={0.4}
              transparent
              opacity={0.62}
            />
          </mesh>
        ))}

        <mesh ref={eyeL} position={[0.12, 0.08, 0.29]}>
          <sphereGeometry args={[0.062, 8, 8]} />
          <meshStandardMaterial color="#001e3c" emissive="#1565c0" emissiveIntensity={1.8} />
        </mesh>
        <mesh ref={eyeR} position={[-0.12, 0.08, 0.29]}>
          <sphereGeometry args={[0.062, 8, 8]} />
          <meshStandardMaterial color="#001e3c" emissive="#1565c0" emissiveIntensity={1.8} />
        </mesh>

        <pointLight color="#4fc3f7" intensity={2.2} distance={3.8} decay={2} />
      </group>
    </group>
  );
}
