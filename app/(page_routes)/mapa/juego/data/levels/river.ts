import type { PlatformData, CollectibleData, EnemyData, PowerUpData } from '../../types';

// ─────────────────────────────────────────────────────────────────────────
//  LEVEL 5 – "Las Plataformas del Río"  (Plataforma del Río)
//  Shape: drop → very low river platforms → UP → DOWN → UP → goal
//  Secret: underwater grotto – platforms very close to the river death zone
// ─────────────────────────────────────────────────────────────────────────

export const platforms: PlatformData[] = [
  // ── Main path ─────────────────────────────────────────────────────
  { id: 'p1',  position: [2.5,  5.5,  0], size: [7.0, 1.0,  2.4], kind: 'river' },
  { id: 'p2',  position: [8.0,  3.5,  0], size: [3.0, 0.85, 2.0], kind: 'rock'  },
  { id: 'p3',  position: [12.5, 1.5,  0], size: [3.0, 0.85, 2.0], kind: 'river' },
  { id: 'p4',  position: [17.0, -0.5, 0], size: [3.0, 0.85, 2.0], kind: 'rock'  },
  { id: 'p5',  position: [21.5, -2.0, 0], size: [3.5, 0.85, 2.1], kind: 'river' },
  { id: 'p6',  position: [26.0, -3.5, 0], size: [3.5, 0.85, 2.1], kind: 'rock'  },  // low!
  // UP over the river – relief and key milestone
  { id: 'p7',  position: [30.0, -1.5, 0], size: [3.5, 0.85, 2.1], kind: 'bridge'},
  { id: 'p8',  position: [34.5, -3.0, 0], size: [3.5, 0.85, 2.1], kind: 'river' },
  { id: 'p9',  position: [38.5, -1.2, 0], size: [3.0, 0.85, 2.0], kind: 'rock'  },
  { id: 'p10', position: [42.5, -3.2, 0], size: [3.0, 0.85, 2.0], kind: 'bridge'},
  { id: 'p11', position: [46.0, -1.8, 0], size: [3.0, 0.85, 2.0], kind: 'river' },
  { id: 'p12', position: [47.0, -4.15,0], size: [6.5, 1.0,  2.4], kind: 'river' },
  // ── Secret grotto: below p6, very close to river death zone ───────
  { id: 'sec5-a',    position: [23.5, -4.5, 0], size: [2.5, 0.6,  1.5], kind: 'river' },
  { id: 'sec5-b',    position: [20.5, -5.0, 0], size: [2.5, 0.6,  1.5], kind: 'rock'  },
  { id: 'sec5-c',    position: [17.5, -5.0, 0], size: [3.5, 0.6,  1.5], kind: 'river' },
  { id: 'sec5-wall', position: [15.8, -4.25,0], size: [0.6, 2.5,  1.5], kind: 'rock'  },
  { id: 'sec5-lid',  position: [19.5, -3.45,0], size: [7.2, 0.45, 1.5], kind: 'river' },
];

export const collectibles: CollectibleData[] = [
  { id: 'c1',  position: [2.5,  7.15,  0] },
  { id: 'c2',  position: [8.0,  5.2,   0] },
  { id: 'c3',  position: [12.5, 3.2,   0] },
  { id: 'c4',  position: [17.0, 1.2,   0] },
  { id: 'c5',  position: [21.5, -0.3,  0] },
  { id: 'c6',  position: [26.0, -1.8,  0] },
  { id: 'c7',  position: [30.0, 0.2,   0] },  // above the danger – rewarding!
  { id: 'c8',  position: [34.5, -1.3,  0] },
  { id: 'c9',  position: [38.5, 0.5,   0] },
  { id: 'c10', position: [42.5, -1.5,  0] },
  { id: 'c11', position: [46.0, 0.0,   0] },
  { id: 'c12', position: [47.0, -2.4,  0] },
  // Three hidden emeralds in the river grotto – very risky!
  { id: 'esm-rv1', position: [17.0, -3.9, 0], kind: 'emerald' },
  { id: 'esm-rv2', position: [18.6, -3.9, 0], kind: 'emerald' },
  { id: 'esm-rv3', position: [20.2, -3.9, 0], kind: 'emerald' },
];

export const enemies: EnemyData[] = [
  { id: 'e1', position: [12.5, 2.85,  0], patrolRange: 1.1 },
  { id: 'e2', position: [17.0, 0.85,  0], patrolRange: 1.1 },
  { id: 'e3', position: [21.5, -0.65, 0], patrolRange: 1.3 },
  { id: 'e4', position: [26.0, -2.15, 0], patrolRange: 1.3 },  // guarding low platform
  { id: 'e5', position: [30.0, -0.65, 0], patrolRange: 1.3 },
  { id: 'e6', position: [34.5, -1.65, 0], patrolRange: 1.3 },
  { id: 'e7', position: [38.5, -0.35, 0], patrolRange: 1.1 },
  { id: 'e8', position: [42.5, -1.85, 0], patrolRange: 1.1 },
  { id: 'e9', position: [46.0, -0.45, 0], patrolRange: 1.0 },
];

export const powerUps: PowerUpData[] = [
  { id: 'pu-r5',  position: [8.0,  4.6,   0], kind: 'ruby'     },
  { id: 'pu-s5',  position: [26.0, -1.55, 0], kind: 'sapphire' },  // near river danger
  { id: 'pu-r5b', position: [38.5, 0.1,   0], kind: 'ruby'     },
  { id: 'pu-s5b', position: [46.0, 0.4,   0], kind: 'sapphire' },
];
