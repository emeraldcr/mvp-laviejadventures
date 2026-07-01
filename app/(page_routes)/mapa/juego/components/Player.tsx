'use client';
import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameContext } from '../context/GameContext';
import {
  SPEED, JUMP_VEL, JUMP2_VEL, GRAVITY, GLIDE_FALL, MAX_JUMPS,
  P_HALF_W, P_HALF_H, MAX_FRAME_DT, PHYSICS_STEP, COLLISION_EPS,
  RUBY_DURATION, SAPPH_DURATION, FIRE_COOLDOWN,
} from '../constants/physics';
import { DEATH_Y } from '../constants/world';

type PlatformBounds = {
  minX: number; maxX: number;
  minY: number; maxY: number;
  centerX: number;
};

export function Player() {
  const {
    state, keys, level, playerPosRef, bulletsRef,
    pendingPowerUpRef, playerImmuneRef, handlePowerUpChange, handleDie,
  } = useGameContext();
  const gameStatus = state.status;
  const platforms = level.platforms;
  const spawnPos = level.spawnPosition;

  const groupRef    = useRef<THREE.Group>(null);
  const visualRef   = useRef<THREE.Group>(null);
  const bodyMatRef  = useRef<THREE.MeshStandardMaterial>(null);
  const vel         = useRef(new THREE.Vector3());
  const grounded    = useRef(false);
  const jumpCount   = useRef(0);
  const jumpWas     = useRef(false);
  const fireWas     = useRef(false);
  const fireCd      = useRef(false);
  const deathFired  = useRef(false);
  const animT       = useRef(0);
  const facingR     = useRef(true);
  const nextBulletId = useRef(0);

  const rubyTimer   = useRef(0);
  const sapphTimer  = useRef(0);

  const eyeL = useRef<THREE.Mesh>(null);
  const eyeR = useRef<THREE.Mesh>(null);
  const blinkT = useRef(0);

  const platformBounds = useMemo<PlatformBounds[]>(
    () => platforms.map((p) => {
      const [px, py] = p.position;
      const [pw, ph] = p.size;
      return {
        minX: px - pw * 0.5, maxX: px + pw * 0.5,
        minY: py - ph * 0.5, maxY: py + ph * 0.5,
        centerX: px,
      };
    }),
    [platforms]
  );

  useEffect(() => {
    if (gameStatus === 'playing') {
      if (groupRef.current) groupRef.current.position.set(...spawnPos);
      vel.current.set(0, 0, 0);
      jumpCount.current = 0;
      deathFired.current = false;
      grounded.current = false;
      // Reset powerups on respawn
      rubyTimer.current = 0;
      sapphTimer.current = 0;
      playerImmuneRef.current = false;
      handlePowerUpChange(false, false);
    }
  }, [gameStatus, spawnPos, playerImmuneRef, handlePowerUpChange]);

  useFrame((_, delta) => {
    if (!groupRef.current || gameStatus !== 'playing') return;

    const pos = groupRef.current.position;
    const k = keys.current;
    const frameDt = Math.min(delta, MAX_FRAME_DT);
    const steps = Math.max(1, Math.ceil(frameDt / PHYSICS_STEP));
    const dt = frameDt / steps;

    animT.current += delta;
    blinkT.current += delta;

    // ── Pending power-up grant ──────────────────────────────────────────────
    const pending = pendingPowerUpRef.current;
    if (pending) {
      pendingPowerUpRef.current = null;
      if (pending === 'ruby') {
        rubyTimer.current = RUBY_DURATION;
      } else {
        sapphTimer.current = SAPPH_DURATION;
      }
      handlePowerUpChange(rubyTimer.current > 0, sapphTimer.current > 0);
    }

    // ── Power-up timers ────────────────────────────────────────────────────
    const hadRuby  = rubyTimer.current > 0;
    const hadSapph = sapphTimer.current > 0;
    if (rubyTimer.current  > 0) rubyTimer.current  -= delta;
    if (sapphTimer.current > 0) sapphTimer.current -= delta;
    const hasRuby  = rubyTimer.current > 0;
    const hasSapph = sapphTimer.current > 0;
    if (hadRuby !== hasRuby || hadSapph !== hasSapph) {
      handlePowerUpChange(hasRuby, hasSapph);
    }
    playerImmuneRef.current = hasRuby;

    // ── Visual colour update ───────────────────────────────────────────────
    if (bodyMatRef.current) {
      const mat = bodyMatRef.current;
      if (hasRuby) {
        const flash = Math.sin(animT.current * 10) > 0;
        mat.emissive.set(flash ? '#ff1744' : '#ff6b6b');
        mat.emissiveIntensity = flash ? 2.8 : 1.0;
        mat.color.set(flash ? '#ffcdd2' : '#ff8a80');
      } else if (hasSapph) {
        mat.emissive.set('#0d47a1');
        mat.emissiveIntensity = 2.0;
        mat.color.set('#bbdefb');
      } else {
        mat.emissive.set('#4fc3f7');
        mat.emissiveIntensity = 0.65;
        mat.color.set('#d4f0ff');
      }
    }

    // ── Sapphire shooting ─────────────────────────────────────────────────
    const fireNow = k.fire;
    if (hasSapph && fireNow && !fireWas.current && !fireCd.current) {
      fireCd.current = true;
      const bx = pos.x + (facingR.current ? 0.55 : -0.55);
      bulletsRef.current.push({ id: nextBulletId.current++, x: bx, y: pos.y, dir: facingR.current ? 1 : -1 });
      setTimeout(() => { fireCd.current = false; }, FIRE_COOLDOWN * 1000);
    }
    fireWas.current = fireNow;

    // ── Movement ───────────────────────────────────────────────────────────
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
      for (const p of platformBounds) {
        const overlapsX = pos.x + P_HALF_W > p.minX && pos.x - P_HALF_W < p.maxX;
        const overlapsY = pos.y + P_HALF_H > p.minY && pos.y - P_HALF_H < p.maxY;
        const standingOnTop = pos.y - P_HALF_H >= p.maxY - COLLISION_EPS;
        if (overlapsX && overlapsY && !standingOnTop) {
          const pushLeft = p.minX - P_HALF_W;
          const pushRight = p.maxX + P_HALF_W;
          pos.x = pos.x < p.centerX ? pushLeft : pushRight;
          vel.current.x = 0;
        }
      }

      const prevY = pos.y;
      pos.y += vel.current.y * dt;
      for (const p of platformBounds) {
        const overlapsX = pos.x + P_HALF_W > p.minX && pos.x - P_HALF_W < p.maxX;
        const overlapsY = pos.y + P_HALF_H > p.minY && pos.y - P_HALF_H < p.maxY;
        if (overlapsX && overlapsY) {
          if (prevY - P_HALF_H >= p.maxY - COLLISION_EPS && vel.current.y <= 0) {
            pos.y = p.maxY + P_HALF_H;
            vel.current.y = 0;
            grounded.current = true;
            jumpCount.current = 0;
          } else if (prevY + P_HALF_H <= p.minY + COLLISION_EPS && vel.current.y > 0) {
            pos.y = p.minY - P_HALF_H;
            vel.current.y = 0;
          }
        }
      }
    }

    if (pos.y < DEATH_Y && !deathFired.current) {
      deathFired.current = true;
      handleDie();
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
            ref={bodyMatRef}
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
