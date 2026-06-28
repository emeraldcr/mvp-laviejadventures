import type { PlatformData, CollectibleData, EnemyData } from '../types';

export const SPAWN_POSITION: [number, number, number] = [0, 2, 0];
export const GOAL_POSITION: [number, number, number] = [43, 1.5, 0];
export const DEATH_Y = -5;
export const RIVER_Y = -3;

// Each platform: [centerX, centerY, centerZ], [width, height, depth]
export const PLATFORMS: PlatformData[] = [
  { id: 'p1', position: [2,   0,    0], size: [8, 1, 2] },   // start
  { id: 'p2', position: [13,  0.5,  0], size: [4, 1, 2] },   // +5 gap, up 0.5
  { id: 'p3', position: [19,  1,    0], size: [3, 1, 2] },   // +2.5 gap, up 0.5
  { id: 'p4', position: [24,  0.5,  0], size: [3, 1, 2] },   // +2 gap, down
  { id: 'p5', position: [29,  0,    0], size: [4, 1, 2] },   // +1.5 gap, enemy here
  { id: 'p6', position: [35,  0.5,  0], size: [3, 1, 2] },   // +2.5 gap
  { id: 'p7', position: [40,  0,    0], size: [6, 1, 2] },   // final + goal
];

export const COLLECTIBLES: CollectibleData[] = [
  { id: 'c1', position: [2,   2.2,  0] },
  { id: 'c2', position: [5,   2.2,  0] },
  { id: 'c3', position: [13,  2.7,  0] },
  { id: 'c4', position: [19,  3.2,  0] },
  { id: 'c5', position: [24,  2.7,  0] },
  { id: 'c6', position: [29,  2.2,  0] },
  { id: 'c7', position: [35,  2.7,  0] },
  { id: 'c8', position: [40,  2.2,  0] },
];

export const ENEMIES: EnemyData[] = [
  { id: 'e1', position: [29, 1.5, 0], patrolRange: 2 },
];
