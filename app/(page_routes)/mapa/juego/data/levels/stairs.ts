import type { PlatformData, CollectibleData, EnemyData, PowerUpData } from '../../types';

// ─────────────────────────────────────────────────────────────────────────
//  LEVEL 4 – "Las Gargantas del Cañón"  (Descenso → Río)
//  Shape: narrow canyon descent → canyon floor midpoint → dramatic zigzag
//  Secret: cave carved into the left canyon wall above the floor
// ─────────────────────────────────────────────────────────────────────────

export const platforms: PlatformData[] = [
  // ── Main path ─────────────────────────────────────────────────────
  { id: 'p1',  position: [2.5,  5.5,  0], size: [7.0, 1.0,  2.4], kind: 'stair' },
  { id: 'p2',  position: [8.5,  4.0,  0], size: [2.8, 0.85, 2.0], kind: 'rock'  },
  // Decorative canyon wall next to p2/p3
  { id: 'cw1', position: [11.5, 3.7,  0], size: [0.65,4.0,  2.0], kind: 'rock'  },
  { id: 'p3',  position: [13.0, 2.5,  0], size: [2.5, 0.85, 2.0], kind: 'rock'  },
  { id: 'p4',  position: [17.5, 0.8,  0], size: [2.5, 0.85, 2.0], kind: 'stair' },
  // Decorative wall beside p4/p5
  { id: 'cw2', position: [20.5, 0.5,  0], size: [0.65,4.0,  2.0], kind: 'rock'  },
  { id: 'p5',  position: [22.0, -1.0, 0], size: [2.8, 0.85, 2.0], kind: 'rock'  },
  { id: 'p6',  position: [26.5, -3.5, 0], size: [2.5, 0.85, 2.0], kind: 'stair' },
  // Small bridge connecting to canyon floor
  { id: 'brd', position: [24.8, -2.6, 0], size: [2.4, 0.55, 1.8], kind: 'bridge'},
  // Canyon floor midpoint – wide rest area
  { id: 'pF',  position: [27.5, -4.15,0], size: [6.5, 1.0,  2.4], kind: 'rock'  },
  // Post-floor narrow zigzag (dramatic ups and downs)
  { id: 'p7',  position: [32.0, -2.5, 0], size: [2.5, 0.85, 2.0], kind: 'stair' },
  { id: 'cw3', position: [30.5, -2.9, 0], size: [0.65,2.8,  2.0], kind: 'rock'  },
  { id: 'p8',  position: [36.0, -4.2, 0], size: [2.5, 0.85, 2.0], kind: 'rock'  },
  { id: 'p9',  position: [39.5, -2.2, 0], size: [2.5, 0.85, 2.0], kind: 'stair' },
  { id: 'cw4', position: [41.5, -2.6, 0], size: [0.65,2.8,  2.0], kind: 'rock'  },
  { id: 'p10', position: [43.0, -4.0, 0], size: [2.5, 0.85, 2.0], kind: 'rock'  },
  { id: 'p11', position: [46.0, -2.5, 0], size: [2.5, 0.85, 2.0], kind: 'stair' },
  { id: 'p12', position: [47.0, -4.15,0], size: [6.5, 1.0,  2.4], kind: 'rock'  },
  // ── Secret cave: above the canyon floor, going left ───────────────
  { id: 'sec4-a',    position: [29.5, -0.8, 0], size: [2.0, 0.6,  1.5], kind: 'stair' },
  { id: 'sec4-b',    position: [27.0, 0.8,  0], size: [2.0, 0.6,  1.5], kind: 'rock'  },
  { id: 'sec4-c',    position: [24.5, 2.2,  0], size: [3.0, 0.6,  1.5], kind: 'stair' },
  { id: 'sec4-wall', position: [22.8, 3.05, 0], size: [0.62,2.6,  1.5], kind: 'rock'  },
  { id: 'sec4-lid',  position: [25.8, 3.9,  0], size: [6.5, 0.45, 1.5], kind: 'rock'  },
];

export const collectibles: CollectibleData[] = [
  { id: 'c1',  position: [2.5,  7.15,  0] },
  { id: 'c2',  position: [8.5,  5.7,   0] },
  { id: 'c3',  position: [13.0, 4.2,   0] },
  { id: 'c4',  position: [17.5, 2.5,   0] },
  { id: 'c5',  position: [22.0, 0.7,   0] },
  { id: 'c6',  position: [26.5, -1.8,  0] },
  { id: 'c7',  position: [27.5, -2.5,  0] },  // canyon floor
  { id: 'c8',  position: [32.0, -0.8,  0] },
  { id: 'c9',  position: [36.0, -2.5,  0] },
  { id: 'c10', position: [39.5, -0.5,  0] },
  { id: 'c11', position: [43.0, -2.3,  0] },
  { id: 'c12', position: [46.0, -0.8,  0] },
  { id: 'c13', position: [47.0, -2.4,  0] },
  // Hidden emeralds inside the canyon cave
  { id: 'esm-s1a', position: [23.8, 3.65, 0], kind: 'emerald' },
  { id: 'esm-s1b', position: [25.5, 3.65, 0], kind: 'emerald' },
];

export const enemies: EnemyData[] = [
  { id: 'e1', position: [13.0, 3.35,  0], patrolRange: 0.9 },
  { id: 'e2', position: [17.5, 1.65,  0], patrolRange: 0.9 },
  { id: 'e3', position: [22.0, 0.35,  0], patrolRange: 1.0 },
  { id: 'e4', position: [27.5, -2.75, 0], patrolRange: 2.0 },  // floor patrol, wide!
  { id: 'e5', position: [32.0, -1.2,  0], patrolRange: 0.9 },
  { id: 'e6', position: [39.5, -0.85, 0], patrolRange: 0.9 },
  { id: 'e7', position: [43.0, -2.65, 0], patrolRange: 0.9 },
  { id: 'e8', position: [46.0, -1.15, 0], patrolRange: 0.9 },
];

export const powerUps: PowerUpData[] = [
  { id: 'pu-r4', position: [8.5,  5.3,   0], kind: 'ruby'     },
  { id: 'pu-s4', position: [27.5, -2.55, 0], kind: 'sapphire' },  // canyon floor
];
