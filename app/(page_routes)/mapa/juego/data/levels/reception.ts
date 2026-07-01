import type { PlatformData, CollectibleData, EnemyData, PowerUpData } from '../../types';

// ─────────────────────────────────────────────────────────────────────────────
//  LEVEL 1 – "El Sendero Verde"  (Recepción → Cafetales)
//  Shape: DOWN → UP to hilltop → BIG DROP → canyon zigzag up/down
//  Secret: enclosed bohío above the hilltop, reached going right-then-left
// ─────────────────────────────────────────────────────────────────────────────

export const platforms: PlatformData[] = [
  // ── Main path ─────────────────────────────────────────────────────
  { id: 'p1',  position: [2.5,  5.5,  0], size: [7.0, 1.0,  2.4], kind: 'trail' },
  { id: 'p2',  position: [9.0,  3.8,  0], size: [3.5, 0.85, 2.2], kind: 'mud'   },
  { id: 'p3',  position: [13.5, 2.2,  0], size: [3.2, 0.85, 2.0], kind: 'root'  },
  // Hill – goes UP before coming back down
  { id: 'p4',  position: [18.0, 3.8,  0], size: [3.2, 0.85, 2.2], kind: 'mud'   },
  { id: 'p5',  position: [22.5, 5.8,  0], size: [4.0, 0.9,  2.3], kind: 'trail' },
  // Descent from hilltop
  { id: 'p6',  position: [27.5, 3.2,  0], size: [3.0, 0.85, 2.0], kind: 'root'  },
  { id: 'p7',  position: [32.0, 0.5,  0], size: [3.5, 0.85, 2.1], kind: 'trail' },
  // Canyon zigzag – alternates up and down
  { id: 'p8',  position: [36.0, -1.8, 0], size: [3.5, 0.85, 2.0], kind: 'mud'   },
  { id: 'p9',  position: [39.5, -3.5, 0], size: [3.0, 0.85, 2.0], kind: 'root'  },
  { id: 'p10', position: [42.5, -1.5, 0], size: [3.0, 0.85, 2.0], kind: 'trail' },
  { id: 'p11', position: [45.5, -3.2, 0], size: [3.0, 0.85, 2.0], kind: 'mud'   },
  { id: 'p12', position: [47.0, -4.15,0], size: [6.5, 1.0,  2.3], kind: 'trail' },
  // ── Secret bohío above hilltop (go right of p5, then loop left) ──
  { id: 'sec-a',    position: [24.5, 7.5,  0], size: [2.0, 0.6,  1.5], kind: 'root'  },
  { id: 'sec-b',    position: [21.5, 9.0,  0], size: [2.5, 0.6,  1.5], kind: 'mud'   },
  { id: 'sec-c',    position: [18.0, 9.0,  0], size: [3.5, 0.6,  1.5], kind: 'trail' },
  { id: 'sec-wall', position: [16.3, 9.9,  0], size: [0.62,2.5,  1.5], kind: 'root'  },
  { id: 'sec-lid',  position: [19.8, 10.8, 0], size: [7.0, 0.45, 1.5], kind: 'root'  },
];

export const collectibles: CollectibleData[] = [
  { id: 'c1',  position: [2.5,  7.15, 0] },
  { id: 'c2',  position: [9.0,  5.5,  0] },
  { id: 'c3',  position: [13.5, 3.9,  0] },
  { id: 'c4',  position: [18.0, 5.5,  0] },
  { id: 'c5',  position: [22.5, 7.5,  0] },  // conspicuous on hilltop
  { id: 'c6',  position: [27.5, 4.9,  0] },
  { id: 'c7',  position: [32.0, 2.2,  0] },
  { id: 'c8',  position: [36.0, -0.1, 0] },
  { id: 'c9',  position: [39.5, -1.8, 0] },
  { id: 'c10', position: [42.5, 0.2,  0] },
  { id: 'c11', position: [45.5, -1.5, 0] },
  { id: 'c12', position: [47.0, -2.4, 0] },
  // Hidden emeralds inside the bohío
  { id: 'esm-r1a', position: [17.5, 10.2, 0], kind: 'emerald' },
  { id: 'esm-r1b', position: [19.2, 10.2, 0], kind: 'emerald' },
];

export const enemies: EnemyData[] = [
  { id: 'e1', position: [13.5, 3.15, 0], patrolRange: 1.1 },
  { id: 'e2', position: [22.5, 6.65, 0], patrolRange: 1.8 },  // hilltop guardian!
  { id: 'e3', position: [32.0, 1.35, 0], patrolRange: 1.35 },
  { id: 'e4', position: [36.0, -0.9, 0], patrolRange: 1.4  },
  { id: 'e5', position: [42.5, -0.5, 0], patrolRange: 1.2  },
  { id: 'e6', position: [45.5, -2.3, 0], patrolRange: 1.0  },
];

export const powerUps: PowerUpData[] = [
  { id: 'pu-r1', position: [9.0,  5.1,  0], kind: 'ruby'     },
  { id: 'pu-s1', position: [36.0, -0.7, 0], kind: 'sapphire' },
];
