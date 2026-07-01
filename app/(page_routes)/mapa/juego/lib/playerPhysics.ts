import type * as THREE from 'three';
import { COLLISION_EPS, P_HALF_H, P_HALF_W } from '../constants/physics';
import type { PlatformData } from '../types';

export type PlatformBounds = {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  centerX: number;
};

export const buildPlatformBounds = (platforms: PlatformData[]): PlatformBounds[] => (
  platforms.map((platform) => {
    const [px, py] = platform.position;
    const [pw, ph] = platform.size;
    return {
      minX: px - pw * 0.5,
      maxX: px + pw * 0.5,
      minY: py - ph * 0.5,
      maxY: py + ph * 0.5,
      centerX: px,
    };
  })
);

export const resolveHorizontalCollisions = (
  pos: THREE.Vector3,
  velocity: THREE.Vector3,
  platformBounds: PlatformBounds[],
) => {
  for (const platform of platformBounds) {
    const overlapsX = pos.x + P_HALF_W > platform.minX && pos.x - P_HALF_W < platform.maxX;
    const overlapsY = pos.y + P_HALF_H > platform.minY && pos.y - P_HALF_H < platform.maxY;
    const standingOnTop = pos.y - P_HALF_H >= platform.maxY - COLLISION_EPS;
    if (overlapsX && overlapsY && !standingOnTop) {
      const pushLeft = platform.minX - P_HALF_W;
      const pushRight = platform.maxX + P_HALF_W;
      pos.x = pos.x < platform.centerX ? pushLeft : pushRight;
      velocity.x = 0;
    }
  }
};

export const resolveVerticalCollisions = (
  pos: THREE.Vector3,
  velocity: THREE.Vector3,
  platformBounds: PlatformBounds[],
  prevY: number,
) => {
  let landed = false;

  for (const platform of platformBounds) {
    const overlapsX = pos.x + P_HALF_W > platform.minX && pos.x - P_HALF_W < platform.maxX;
    const overlapsY = pos.y + P_HALF_H > platform.minY && pos.y - P_HALF_H < platform.maxY;
    if (!overlapsX || !overlapsY) continue;

    if (prevY - P_HALF_H >= platform.maxY - COLLISION_EPS && velocity.y <= 0) {
      pos.y = platform.maxY + P_HALF_H;
      velocity.y = 0;
      landed = true;
    } else if (prevY + P_HALF_H <= platform.minY + COLLISION_EPS && velocity.y > 0) {
      pos.y = platform.minY - P_HALF_H;
      velocity.y = 0;
    }
  }

  return landed;
};
