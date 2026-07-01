import type { PlatformData, CollectibleData, EnemyData, PowerUpData } from '../../types';

// ─────────────────────────────────────────────────────────────────────────
//  LEVEL 2 – "Laberinto del Cafetal"  (Cafetales → Montañita)
//  Shape: DOWN → deep valley → UP to ridge → big drop → canyon zigzag
//  Secret: enclosed grove reached by jumping left from ridge top
// ─────────────────────────────────────────────────────────────────────────

export const platforms: PlatformData[] = [
  // ── Main path ─────────────────────────────────────────────────────
  { id: 'p1',  position: [2.5,  5.5,  0], size: [7.0, 1.0,  2.3], kind: 'mud'   },
  { id: 'p2',  position: [8.5,  3.8,  0], size: [3.2, 0.85, 2.1], kind: 'root'  },
  { id: 'p3',  position: [13.0, 1.8,  0], size: [3.0, 0.85, 2.0], kind: 'mud'   },
  { id: 'p4',  position: [17.5, -0.2, 0], size: [3.0, 0.85, 2.0], kind: 'root'  },
  // Valley floor – lowest point of level
  { id: 'p5',  position: [21.5, -1.5, 0], size: [3.2, 0.85, 2.0], kind: 'trail' },
  // Climb back UP toward the ridge
  { id: 'p6',  position: [25.5, 0.5,  0], size: [3.0, 0.85, 2.0], kind: 'mud'   },
  { id: 'p7',  position: [29.5, 2.5,  0], size: [3.0, 0.85, 2.0], kind: 'root'  },
  { id: 'p8',  position: [33.5, 4.5,  0], size: [3.5, 0.9,  2.2], kind: 'trail' },  // RIDGE
  // Big drop off the ridge into the canyon
  { id: 'p9',  position: [37.5, 2.0,  0], size: [3.5, 0.85, 2.1], kind: 'mud'   },
  { id: 'p10', position: [41.0, -0.5, 0], size: [3.0, 0.85, 2.0], kind: 'root'  },
  { id: 'p11', position: [44.0, -2.5, 0], size: [3.0, 0.85, 2.0], kind: 'trail' },
  { id: 'p12', position: [47.0, -4.15,0], size: [6.5, 1.0,  2.3], kind: 'trail' },
  // ── Secret grove left of ridge (backtrack path) ───────────────────
  { id: 'sec2-a',    position: [31.5, 6.2,  0], size: [2.0, 0.6,  1.5], kind: 'root'  },
  { id: 'sec2-b',    position: [28.5, 7.8,  0], size: [2.5, 0.6,  1.5], kind: 'mud'   },
  { id: 'sec2-c',    position: [25.0, 7.8,  0], size: [3.5, 0.6,  1.5], kind: 'trail' },
  { id: 'sec2-wall', position: [23.3, 8.65, 0], size: [0.62,2.5,  1.5], kind: 'root'  },
  { id: 'sec2-lid',  position: [26.8, 9.55, 0], size: [7.0, 0.45, 1.5], kind: 'root'  },
];

export const collectibles: CollectibleData[] = [
  { id: 'c1',  position: [2.5,  7.15, 0] },
  { id: 'c2',  position: [8.5,  5.5,  0] },
  { id: 'c3',  position: [13.0, 3.5,  0] },
  { id: 'c4',  position: [17.5, 1.5,  0] },
  { id: 'c5',  position: [21.5, 0.3,  0] },  // valley – very low
  { id: 'c6',  position: [25.5, 2.2,  0] },
  { id: 'c7',  position: [29.5, 4.2,  0] },
  { id: 'c8',  position: [33.5, 6.2,  0] },  // ridge – very high
  { id: 'c9',  position: [37.5, 3.7,  0] },
  { id: 'c10', position: [41.0, 1.2,  0] },
  { id: 'c11', position: [44.0, -0.8, 0] },
  { id: 'c12', position: [47.0, -2.4, 0] },
  // Hidden emeralds inside the secret grove
  { id: 'esm-c1a', position: [24.5, 8.65, 0], kind: 'emerald' },
  { id: 'esm-c1b', position: [26.2, 8.65, 0], kind: 'emerald' },
];

export const enemies: EnemyData[] = [
  { id: 'e1', position: [13.0, 2.75,  0], patrolRange: 1.1 },
  { id: 'e2', position: [21.5, -0.65, 0], patrolRange: 1.2 },  // valley guardian
  { id: 'e3', position: [29.5, 3.85,  0], patrolRange: 1.1 },
  { id: 'e4', position: [33.5, 5.85,  0], patrolRange: 1.7 },  // ridge guardian
  { id: 'e5', position: [37.5, 2.95,  0], patrolRange: 1.4 },
  { id: 'e6', position: [41.0, 0.35,  0], patrolRange: 1.1 },
  { id: 'e7', position: [44.0, -1.15, 0], patrolRange: 1.1 },
];

export const powerUps: PowerUpData[] = [
  { id: 'pu-r2', position: [8.5,  4.85,  0], kind: 'ruby'     },
  { id: 'pu-s2', position: [21.5, -0.35, 0], kind: 'sapphire' },  // valley floor help
];
