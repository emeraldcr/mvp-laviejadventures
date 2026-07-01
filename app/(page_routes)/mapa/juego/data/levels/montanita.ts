import type { PlatformData, CollectibleData, EnemyData, PowerUpData } from '../../types';

// ─────────────────────────────────────────────────────────────────────────
//  LEVEL 3 – "La Cima de la Montañita"  (Montañita → Cañón)
//  Shape: CLIMB UP to peak → steep descent
//  Secret: secret summit above the peak, going left
// ─────────────────────────────────────────────────────────────────────────

export const platforms: PlatformData[] = [
  // ── Main path: first half climbs UP ───────────────────────────────
  { id: 'p1', position: [2.5,  5.5,  0], size: [7.0, 1.0,  2.3], kind: 'rock'  },
  { id: 'p2', position: [7.5,  6.5,  0], size: [2.8, 0.85, 1.9], kind: 'rock'  },
  { id: 'p3', position: [12.0, 7.5,  0], size: [2.8, 0.85, 1.9], kind: 'rock'  },
  { id: 'p4', position: [16.5, 8.5,  0], size: [3.0, 0.85, 2.0], kind: 'rock'  },
  { id: 'p5', position: [21.0, 9.5,  0], size: [3.5, 0.9,  2.2], kind: 'trail' },  // PEAK
  // Second half: steep descent
  { id: 'p6', position: [26.0, 7.5,  0], size: [3.0, 0.85, 2.0], kind: 'rock'  },
  { id: 'p7', position: [31.0, 5.0,  0], size: [3.5, 0.85, 2.1], kind: 'trail' },
  { id: 'p8', position: [36.0, 2.5,  0], size: [3.5, 0.85, 2.1], kind: 'rock'  },
  { id: 'p9', position: [40.5, 0.0,  0], size: [3.5, 0.85, 2.0], kind: 'root'  },
  { id: 'p10',position: [44.0, -2.5, 0], size: [3.0, 0.85, 2.0], kind: 'rock'  },
  { id: 'p11',position: [47.0, -4.15,0], size: [6.5, 1.0,  2.3], kind: 'rock'  },
  // ── Secret summit (above peak, goes right then loops left) ────────
  { id: 'sec3-a',    position: [23.0, 11.2, 0], size: [1.8, 0.55, 1.4], kind: 'rock'  },
  { id: 'sec3-b',    position: [20.0, 12.6, 0], size: [2.0, 0.55, 1.4], kind: 'rock'  },
  { id: 'sec3-c',    position: [17.0, 12.6, 0], size: [3.0, 0.55, 1.4], kind: 'trail' },
  { id: 'sec3-wall', position: [15.5, 13.5, 0], size: [0.6, 2.4,  1.4], kind: 'rock'  },
  { id: 'sec3-lid',  position: [18.8, 14.15,0], size: [6.5, 0.45, 1.4], kind: 'rock'  },
];

export const collectibles: CollectibleData[] = [
  { id: 'c1',  position: [2.5,  7.15,  0] },
  { id: 'c2',  position: [7.5,  8.2,   0] },
  { id: 'c3',  position: [12.0, 9.2,   0] },
  { id: 'c4',  position: [16.5, 10.2,  0] },
  { id: 'c5',  position: [21.0, 11.25, 0] },  // peak – floats very high
  { id: 'c6',  position: [26.0, 9.2,   0] },
  { id: 'c7',  position: [31.0, 6.7,   0] },
  { id: 'c8',  position: [36.0, 4.2,   0] },
  { id: 'c9',  position: [40.5, 1.7,   0] },
  { id: 'c10', position: [44.0, -0.8,  0] },
  { id: 'c11', position: [47.0, -2.4,  0] },
  // Three hidden emeralds at the true summit
  { id: 'esm-m1a', position: [16.2, 13.7, 0], kind: 'emerald' },
  { id: 'esm-m1b', position: [17.8, 13.7, 0], kind: 'emerald' },
  { id: 'esm-m1c', position: [19.4, 13.7, 0], kind: 'emerald' },
];

export const enemies: EnemyData[] = [
  { id: 'e1', position: [12.0, 8.85,  0], patrolRange: 1.0 },
  { id: 'e2', position: [16.5, 9.85,  0], patrolRange: 1.2 },
  { id: 'e3', position: [21.0, 10.85, 0], patrolRange: 1.3 },  // peak guardian!
  { id: 'e4', position: [31.0, 6.35,  0], patrolRange: 1.4 },
  { id: 'e5', position: [36.0, 3.85,  0], patrolRange: 1.4 },
  { id: 'e6', position: [40.5, 1.35,  0], patrolRange: 1.4 },
  { id: 'e7', position: [44.0, -1.15, 0], patrolRange: 1.1 },
];

export const powerUps: PowerUpData[] = [
  { id: 'pu-r3', position: [7.5,  7.6, 0], kind: 'ruby'     },
  { id: 'pu-s3', position: [31.0, 5.8, 0], kind: 'sapphire' },  // top of descent
];
