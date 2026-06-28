'use client';
import { useRef, useEffect, type MutableRefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { KeyState } from '../hooks/useKeyboard';
import type { PlatformData } from '../types';
import { DEATH_Y } from '../data/levelData';

// Physics constants
const SPEED         = 6;
const JUMP_VEL      = 12;
const JUMP2_VEL     = 10.5;
const GRAVITY       = -28;
const GLIDE_FALL    = -4.2;   // max fall speed while gliding (holding jump)
const MAX_JUMPS     = 2;
const P_HALF_W      = 0.28;
const P_HALF_H      = 0.42;

interface Props {
  keys:         MutableRefObject<KeyState>;
  platforms:    PlatformData[];
  spawnPos:     [number, number, number];
  playerPosRef: MutableRefObject<THREE.Vector3>;
  gameStatus:   string;
  onDie:        () => void;
}

export function Player({ keys, platforms, spawnPos, playerPosRef, gameStatus, onDie }: Props) {
  const groupRef   = useRef<THREE.Group>(null);
  const vel        = useRef(new THREE.Vector3());
  const grounded   = useRef(false);
  const jumpCount  = useRef(0);
  const jumpWas    = useRef(false);
  const deathFired = useRef(false);
  const animT      = useRef(0);
  const facingR    = useRef(true);

  // Eyes refs for blinking
  const eyeL = useRef<THREE.Mesh>(null);
  const eyeR = useRef<THREE.Mesh>(null);
  const blinkT = useRef(0);

  // Reset player state on respawn / restart
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
    const k   = keys.current;
    const dt  = Math.min(delta, 0.05);

    animT.current += delta;
    blinkT.current += delta;

    const wasGrounded = grounded.current;
    grounded.current  = false;

    // ── Horizontal ──────────────────────────────────────────
    const moveX = (k.right ? 1 : 0) - (k.left ? 1 : 0);
    vel.current.x = moveX * SPEED;
    if (moveX !== 0) facingR.current = moveX > 0;

    // ── Gravity ──────────────────────────────────────────────
    vel.current.y += GRAVITY * dt;

    // Glide: hold jump while falling after at least 1 jump
    if (k.jump && vel.current.y < GLIDE_FALL && jumpCount.current >= 1) {
      vel.current.y = GLIDE_FALL;
    }

    // ── Jump (edge-detect on press) ───────────────────────────
    const jumpNow = k.jump;
    if (jumpNow && !jumpWas.current) {
      if (wasGrounded) {
        vel.current.y   = JUMP_VEL;
        jumpCount.current = 1;
      } else if (jumpCount.current < MAX_JUMPS) {
        vel.current.y = JUMP2_VEL;
        jumpCount.current++;
      }
    }
    jumpWas.current = jumpNow;

    // ── Apply velocity ────────────────────────────────────────
    pos.x += vel.current.x * dt;
    pos.y += vel.current.y * dt;

    // ── AABB Platform collision ───────────────────────────────
    for (const p of platforms) {
      const [px, py] = p.position;
      const [pw, ph] = p.size;

      // Signed overlap on each axis (negative = penetrating)
      const ox = Math.abs(pos.x - px) - (pw * 0.5 + P_HALF_W);
      const oy = Math.abs(pos.y - py) - (ph * 0.5 + P_HALF_H);

      if (ox < 0 && oy < 0) {
        // Resolve minimum penetration axis
        if (ox > oy) {
          // Less penetration in X → horizontal collision
          const pushX = pw * 0.5 + P_HALF_W - Math.abs(pos.x - px);
          pos.x += pos.x > px ? pushX : -pushX;
          vel.current.x = 0;
        } else {
          // Less penetration in Y → vertical collision
          if (pos.y > py) {
            // Land on top
            pos.y = py + ph * 0.5 + P_HALF_H;
            if (vel.current.y < 0) vel.current.y = 0;
            grounded.current  = true;
            jumpCount.current = 0;
          } else {
            // Hit ceiling
            pos.y = py - ph * 0.5 - P_HALF_H;
            if (vel.current.y > 0) vel.current.y = 0;
          }
        }
      }
    }

    // ── Death zone ────────────────────────────────────────────
    if (pos.y < DEATH_Y && !deathFired.current) {
      deathFired.current = true;
      onDie();
    }

    // Broadcast position to other components
    playerPosRef.current.copy(pos);

    // ── Visual animations ─────────────────────────────────────
    const g = groupRef.current;

    // Flip based on facing
    g.scale.x = facingR.current ? 1 : -1;

    if (grounded.current) {
      // Ghost hover wobble
      g.position.y += Math.sin(animT.current * 4.5) * 0.007;
      // Running lean
      g.rotation.z = THREE.MathUtils.lerp(g.rotation.z, -moveX * 0.14, 0.14);
      // Squash to normal
      g.scale.y = THREE.MathUtils.lerp(g.scale.y, 1,    0.18);
    } else {
      // Stretch on ascent, squish on descent
      const stretch = vel.current.y > 0 ? 1.28 : 0.84;
      g.scale.y  = THREE.MathUtils.lerp(g.scale.y,  stretch, 0.14);
      g.rotation.z = THREE.MathUtils.lerp(g.rotation.z, 0, 0.09);
    }

    // Eye blink every ~3 sec
    const blink = blinkT.current % 3 < 0.1;
    const eyeScaleY = blink ? 0.15 : 1;
    if (eyeL.current) eyeL.current.scale.y = eyeScaleY;
    if (eyeR.current) eyeR.current.scale.y = eyeScaleY;
  });

  return (
    <group ref={groupRef} position={spawnPos}>
      {/* Ghost body sphere */}
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

      {/* Ghost skirt / tail cone */}
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

      {/* Wavy skirt lobes */}
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

      {/* Left eye */}
      <mesh ref={eyeL} position={[0.12, 0.08, 0.29]}>
        <sphereGeometry args={[0.062, 8, 8]} />
        <meshStandardMaterial color="#001e3c" emissive="#1565c0" emissiveIntensity={1.8} />
      </mesh>
      {/* Right eye */}
      <mesh ref={eyeR} position={[-0.12, 0.08, 0.29]}>
        <sphereGeometry args={[0.062, 8, 8]} />
        <meshStandardMaterial color="#001e3c" emissive="#1565c0" emissiveIntensity={1.8} />
      </mesh>

      {/* Ghostly glow point light */}
      <pointLight color="#4fc3f7" intensity={2.2} distance={3.8} decay={2} />
    </group>
  );
}
