import { P_HALF_H } from '../constants/physics';
import type { PlatformData } from '../types';

const SPAWN_Y_PAD = 0.04;

export const getPlatformTopY = (platform: PlatformData) => (
  platform.position[1] + platform.size[1] * 0.5
);

export const getSafeSpawnPosition = (platforms: PlatformData[]): [number, number, number] => {
  const firstPlatform = platforms[0];
  if (!firstPlatform) return [0, 6.42, 0];

  const [x, , z] = firstPlatform.position;
  return [x, getPlatformTopY(firstPlatform) + P_HALF_H + SPAWN_Y_PAD, z];
};
