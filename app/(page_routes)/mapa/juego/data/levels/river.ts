import type { PlatformData, CollectibleData, EnemyData, PowerUpData } from '../../types';

// ─────────────────────────────────────────────────────────────────────────
//  LEVEL 5 – "Las Plataformas del Río"  (Versión Maximizada)
//  Duración aproximada: 8-13 minutos
//  Concepto: Caída → Plataformas bajas peligrosas → Subidas de alivio → 
//            Nueva zona baja → Gruta secreta muy riesgosa
// ─────────────────────────────────────────────────────────────────────────

export const platforms: PlatformData[] = [
  // ── SECCIÓN 1: Entrada y primera caída ────────────────────────────
  { id: 'p1',  position: [2.0,  6.0, 0], size: [6.5, 1.0, 2.5], kind: 'river' },
  { id: 'p2',  position: [8.0,  4.3, 0], size: [3.0, 0.85, 2.0], kind: 'rock'  },
  { id: 'p3',  position: [12.0, 2.6, 0], size: [3.0, 0.85, 2.0], kind: 'river' },
  { id: 'p4',  position: [16.0, 0.9, 0], size: [3.0, 0.85, 2.0], kind: 'rock'  },

  // ── SECCIÓN 2: Zona baja peligrosa (cerca del río) ────────────────
  { id: 'p5',  position: [19.5, -0.8, 0], size: [3.2, 0.85, 2.1], kind: 'river' },
  { id: 'p6',  position: [23.5, -2.4, 0], size: [3.0, 0.85, 2.0], kind: 'rock'  }, // muy baja
  { id: 'p7',  position: [27.0, -3.9, 0], size: [3.5, 0.85, 2.1], kind: 'river' }, // peligro alto

  // ── SECCIÓN 3: Subida de alivio (cruzando el río) ─────────────────
  { id: 'p8',  position: [31.0, -2.0, 0], size: [3.5, 0.9, 2.2], kind: 'bridge' }, // puente 1
  { id: 'p9',  position: [35.0, -0.5, 0], size: [3.0, 0.85, 2.0], kind: 'rock'  },
  { id: 'p10', position: [38.5, 1.2,  0], size: [3.2, 0.85, 2.1], kind: 'river' },

  // ── SECCIÓN 4: Segunda zona baja + zigzag ─────────────────────────
  { id: 'p11', position: [42.5, -0.6, 0], size: [3.0, 0.85, 2.0], kind: 'rock'  },
  { id: 'p12', position: [46.0, -2.2, 0], size: [3.0, 0.85, 2.0], kind: 'river' },
  { id: 'p13', position: [49.5, -3.7, 0], size: [3.5, 0.85, 2.1], kind: 'rock'  }, // muy baja
  { id: 'p14', position: [53.5, -2.3, 0], size: [3.0, 0.85, 2.0], kind: 'bridge' }, // puente 2

  // ── SECCIÓN 5: Última subida hacia la meta ────────────────────────
  { id: 'p15', position: [57.0, -0.8, 0], size: [3.2, 0.85, 2.1], kind: 'river' },
  { id: 'p16', position: [60.5, 0.9,  0], size: [3.0, 0.85, 2.0], kind: 'rock'  },
  { id: 'p17', position: [64.0, 2.5,  0], size: [3.5, 0.9, 2.2], kind: 'trail' },
  { id: 'p18', position: [68.0, 1.0,  0], size: [3.0, 0.85, 2.0], kind: 'river' },
  { id: 'p19', position: [71.5, -0.8, 0], size: [4.0, 1.0, 2.3], kind: 'trail' }, // cerca de la meta

  // ── SECRETO: Gruta submarina (muy cerca de la muerte) ─────────────
  { id: 'sec-a', position: [24.5, -5.8, 0], size: [2.3, 0.55, 1.5], kind: 'river' },
  { id: 'sec-b', position: [21.5, -6.5, 0], size: [2.5, 0.55, 1.5], kind: 'rock'  },
  { id: 'sec-c', position: [18.0, -6.5, 0], size: [3.2, 0.55, 1.5], kind: 'river' },
  { id: 'sec-wall', position: [16.0, -5.7, 0], size: [0.6, 2.8, 1.5], kind: 'rock'  },
  { id: 'sec-lid',  position: [20.5, -4.85,0], size: [8.0, 0.45, 1.5], kind: 'river' },
];

// ── COLECCIONABLES ───────────────────────────────────────────────────
export const collectibles: CollectibleData[] = [
  // Ruta principal
  { id: 'c1',  position: [3.5,  7.65, 0] },
  { id: 'c2',  position: [9.5,  5.95, 0] },
  { id: 'c3',  position: [14.0, 3.15, 0] },
  { id: 'c4',  position: [18.0, 1.45, 0] },
  { id: 'c5',  position: [22.5, 0.75, 0] },
  { id: 'c6',  position: [25.5, -1.75, 0] },
  { id: 'c7',  position: [29.0, -2.85, 0] }, // zona muy baja
  { id: 'c8',  position: [33.0, -0.35, 0] }, // recompensa después de peligro
  { id: 'c9',  position: [40.0, 2.85,  0] },
  { id: 'c10', position: [45.0, 0.95,  0] },
  { id: 'c11', position: [51.5, -2.05, 0] },
  { id: 'c12', position: [56.5, -1.15, 0] },
  { id: 'c13', position: [62.0, 1.55,  0] },
  { id: 'c14', position: [66.5, 4.05,  0] },
  { id: 'c15', position: [72.5, 0.65,  0] },

  // Esmeraldas en la gruta secreta (muy arriesgadas)
  { id: 'esm-rv1', position: [18.5, -5.9, 0], kind: 'emerald' },
  { id: 'esm-rv2', position: [20.3, -5.9, 0], kind: 'emerald' },
  { id: 'esm-rv3', position: [22.1, -5.9, 0], kind: 'emerald' },
];

// ── ENEMIGOS ─────────────────────────────────────────────────────────
export const enemies: EnemyData[] = [
  { id: 'e1', position: [10.0, 5.05,  0], patrolRange: 1.2 },
  { id: 'e2', position: [15.0, 2.05,  0], patrolRange: 1.3 },
  { id: 'e3', position: [20.5, 0.05,  0], patrolRange: 1.4 },
  { id: 'e4', position: [25.0, -1.85, 0], patrolRange: 1.3 }, // zona baja
  { id: 'e5', position: [30.5, -0.95, 0], patrolRange: 1.4 },
  { id: 'e6', position: [36.5, -2.45, 0], patrolRange: 1.3 },
  { id: 'e7', position: [41.5, 0.05,  0], patrolRange: 1.2 },
  { id: 'e8', position: [48.0, -2.65, 0], patrolRange: 1.4 },
  { id: 'e9', position: [55.0, -2.15, 0], patrolRange: 1.3 },
  { id: 'e10', position: [63.5, 1.05,  0], patrolRange: 1.2 },
];

// ── POWER-UPS ────────────────────────────────────────────────────────
export const powerUps: PowerUpData[] = [
  { id: 'pu-r5',  position: [11.5, 3.15, 0], kind: 'ruby'     }, // antes de zona baja
  { id: 'pu-s5',  position: [24.5, -2.85, 0], kind: 'sapphire' }, // cerca del peligro (muy útil)
  { id: 'pu-r5b', position: [40.5, 2.85,  0], kind: 'ruby'     }, // zona de alivio
  { id: 'pu-s5b', position: [52.5, -2.05, 0], kind: 'sapphire' }, // segunda zona peligrosa
];