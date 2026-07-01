import type { PlatformData, CollectibleData, EnemyData, LevelData, TrailStation } from '../types';

export const SPAWN_POSITION: [number, number, number] = [0, 2, 0];
export const GOAL_POSITION: [number, number, number] = [43, 1.5, 0];
export const DEATH_Y = -5;
export const RIVER_Y = -3;
const LEVEL_SPAWN: [number, number, number] = [0, 2, 0];
const LEVEL_GOAL: [number, number, number] = [43, 1.5, 0];

export const TRAIL_STATIONS: TrailStation[] = [
  {
    id: 'recepcion',
    name: 'Recepcion',
    shortName: 'Inicio',
    x: 22,
    y: 28,
    description: 'Punto de salida del fantasma hacia Ciudad Esmeralda.',
  },
  {
    id: 'sendero-cafetales',
    name: 'Sendero Cafetales',
    shortName: 'Cafetales',
    x: 40,
    y: 39,
    description: 'Tramo entre cafetales, barro bonito y bosque joven.',
  },
  {
    id: 'montanita',
    name: 'Montanita',
    shortName: 'Montanita',
    x: 55,
    y: 60,
    description: 'Mirador natural con ruta alternativa por el sendero alto.',
  },
  {
    id: 'descenso-canon',
    name: 'Descenso al Canon',
    shortName: 'Canon',
    x: 74,
    y: 48,
    description: 'Bajada tecnica hacia el borde del Rio La Vieja.',
  },
  {
    id: 'plataforma-rio',
    name: 'Plataforma del Rio',
    shortName: 'Rio',
    x: 88,
    y: 72,
    description: 'Ultimo punto antes de cerrar la travesia esmeralda.',
  },
];

export const TRAIL_CONNECTIONS = [
  { from: 'recepcion', to: 'sendero-cafetales', kind: 'main' },
  { from: 'recepcion', to: 'montanita', kind: 'alt' },
  { from: 'sendero-cafetales', to: 'montanita', kind: 'main' },
  { from: 'sendero-cafetales', to: 'descenso-canon', kind: 'alt' },
  { from: 'montanita', to: 'descenso-canon', kind: 'main' },
  { from: 'montanita', to: 'plataforma-rio', kind: 'alt' },
  { from: 'descenso-canon', to: 'plataforma-rio', kind: 'main' },
] as const;

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

const makeLevel = (
  id: string,
  title: string,
  subtitle: string,
  theme: LevelData['theme'],
  stationId: string,
  nextStationId: string | undefined,
  platforms: PlatformData[],
  collectibles: CollectibleData[],
  enemies: EnemyData[],
): LevelData => ({
  id,
  title,
  subtitle,
  theme,
  stationId,
  nextStationId,
  spawnPosition: LEVEL_SPAWN,
  goalPosition: LEVEL_GOAL,
  platforms,
  collectibles,
  enemies,
});

const stairsToCanon: PlatformData[] = [
  { id: 'p1', position: [2, 0, 0], size: [7, 1, 2.2], kind: 'trail' },
  { id: 's1', position: [8.5, -0.35, 0], size: [2.2, 0.7, 2], kind: 'stair' },
  { id: 's2', position: [11.4, -0.8, 0], size: [2.1, 0.7, 2], kind: 'stair' },
  { id: 's3', position: [14.2, -1.25, 0], size: [2, 0.7, 2], kind: 'stair' },
  { id: 's4', position: [17, -1.7, 0], size: [1.9, 0.7, 2], kind: 'stair' },
  { id: 'rest1', position: [21, -2.05, 0], size: [4.8, 0.85, 2.15], kind: 'rock' },
  { id: 's5', position: [25.8, -1.55, 0], size: [2, 0.7, 2], kind: 'stair' },
  { id: 's6', position: [28.9, -1.05, 0], size: [2, 0.7, 2], kind: 'stair' },
  { id: 'bridge1', position: [33.5, -0.35, 0], size: [4.5, 0.55, 1.65], kind: 'bridge' },
  { id: 'p7', position: [40, 0, 0], size: [6, 1, 2.25], kind: 'rock' },
];

export const GAME_LEVELS: LevelData[] = [
  makeLevel(
    'recepcion-cafetales',
    'Recepcion -> Sendero Cafetales',
    'Primer tramo: salida de recepcion, sendero ancho y entrada al cafetal.',
    'reception',
    'recepcion',
    'sendero-cafetales',
    [
      { id: 'p1', position: [2, 0, 0], size: [8, 1, 2.4], kind: 'trail' },
      { id: 'p2', position: [12, 0.2, 0], size: [5, 0.85, 2.2], kind: 'mud' },
      { id: 'p3', position: [18, 0.75, 0], size: [3.4, 0.8, 2], kind: 'trail' },
      { id: 'p4', position: [23.5, 0.1, 0], size: [3.2, 0.85, 2.2], kind: 'mud' },
      { id: 'p5', position: [29.5, 0.15, 0], size: [4.4, 0.9, 2.1], kind: 'trail' },
      { id: 'p6', position: [35.5, 0.55, 0], size: [3.3, 0.85, 2], kind: 'root' },
      { id: 'p7', position: [40, 0, 0], size: [6, 1, 2.25], kind: 'trail' },
    ],
    [
      { id: 'c1', position: [2, 2.2, 0] },
      { id: 'c2', position: [7, 2.2, 0] },
      { id: 'c3', position: [12, 2.4, 0] },
      { id: 'c4', position: [18, 2.95, 0] },
      { id: 'c5', position: [23.5, 2.35, 0] },
      { id: 'c6', position: [29.5, 2.35, 0] },
      { id: 'c7', position: [35.5, 2.75, 0] },
      { id: 'c8', position: [40, 2.2, 0] },
    ],
    ENEMIES,
  ),
  makeLevel(
    'cafetales-montanita',
    'Sendero Cafetales -> Montanita',
    'Cafetales y raices: saltos cortos, camino alto y barro vacilon.',
    'cafetal',
    'sendero-cafetales',
    'montanita',
    [
      { id: 'p1', position: [2, 0, 0], size: [7, 1, 2], kind: 'mud' },
      { id: 'p2', position: [9.5, 1.05, 0], size: [3.2, 0.8, 1.8], kind: 'root' },
      { id: 'p3', position: [15.3, 0.25, 0], size: [3.1, 0.85, 2.1], kind: 'mud' },
      { id: 'p4', position: [21.8, 1.55, 0], size: [4, 0.8, 1.7], kind: 'root' },
      { id: 'p5', position: [28.8, 0.35, 0], size: [3.2, 0.85, 2], kind: 'trail' },
      { id: 'p6', position: [35, 1.2, 0], size: [3, 0.8, 1.8], kind: 'root' },
      { id: 'p7', position: [40, 0, 0], size: [6, 1, 2.2], kind: 'trail' },
    ],
    [
      { id: 'c1', position: [2, 2.2, 0] },
      { id: 'c2', position: [10, 3.4, 0] },
      { id: 'c3', position: [16, 2.6, 0] },
      { id: 'c4', position: [22, 3.8, 0] },
      { id: 'c5', position: [29, 2.6, 0] },
      { id: 'c6', position: [35, 3.3, 0] },
      { id: 'c7', position: [40, 2.2, 0] },
    ],
    [
      { id: 'e1', position: [22, 2.6, 0], patrolRange: 1.7 },
      { id: 'e2', position: [35, 2.1, 0], patrolRange: 1.4 },
    ],
  ),
  makeLevel(
    'montanita-descenso',
    'Montanita -> Descenso al Canon',
    'Mirador de montanita: piedras altas antes de buscar la bajada.',
    'montanita',
    'montanita',
    'descenso-canon',
    [
      { id: 'p1', position: [2, 0, 0], size: [8, 1, 2.2], kind: 'rock' },
      { id: 'p2', position: [10.5, 1.1, 0], size: [2.8, 0.85, 1.8], kind: 'rock' },
      { id: 'p3', position: [16, 2.1, 0], size: [3.2, 0.85, 1.8], kind: 'rock' },
      { id: 'p4', position: [22.4, 2.85, 0], size: [4.2, 0.85, 1.7], kind: 'rock' },
      { id: 'p5', position: [29, 1.7, 0], size: [3.1, 0.85, 1.9], kind: 'root' },
      { id: 'p6', position: [35, 0.75, 0], size: [3, 0.85, 2], kind: 'trail' },
      { id: 'p7', position: [40, 0, 0], size: [6, 1, 2.2], kind: 'rock' },
    ],
    [
      { id: 'c1', position: [3, 2.2, 0] },
      { id: 'c2', position: [10.5, 3.3, 0] },
      { id: 'c3', position: [16, 4.3, 0] },
      { id: 'c4', position: [22.4, 5.05, 0] },
      { id: 'c5', position: [29, 3.9, 0] },
      { id: 'c6', position: [35, 2.95, 0] },
      { id: 'c7', position: [40, 2.2, 0] },
    ],
    [
      { id: 'e1', position: [16, 3.1, 0], patrolRange: 1.2 },
      { id: 'e2', position: [29, 2.7, 0], patrolRange: 1.5 },
    ],
  ),
  makeLevel(
    'escaleras-canon',
    'Descenso al Canon',
    'Aqui si, mae: escaleras hacia abajo, pared de canon y paso fino.',
    'stairs',
    'descenso-canon',
    'plataforma-rio',
    stairsToCanon,
    [
      { id: 'c1', position: [2, 2.2, 0] },
      { id: 'c2', position: [8.5, 1.45, 0] },
      { id: 'c3', position: [11.4, 1, 0] },
      { id: 'c4', position: [14.2, 0.55, 0] },
      { id: 'c5', position: [21, 0.15, 0] },
      { id: 'c6', position: [28.9, 1.15, 0] },
      { id: 'c7', position: [33.5, 1.55, 0] },
      { id: 'c8', position: [40, 2.2, 0] },
    ],
    [
      { id: 'e1', position: [21, -1, 0], patrolRange: 1.8 },
      { id: 'e2', position: [33.5, 0.65, 0], patrolRange: 1.2 },
    ],
  ),
  makeLevel(
    'descenso-rio',
    'Plataforma del Rio',
    'Piedra mojada, pozas verdes y cierre frente al Rio La Vieja.',
    'river',
    'descenso-canon',
    'plataforma-rio',
    [
      { id: 'p1', position: [2, 0, 0], size: [7, 1, 2.2], kind: 'river' },
      { id: 'p2', position: [10.8, 0.65, 0], size: [2.8, 0.85, 2], kind: 'rock' },
      { id: 'p3', position: [16.8, 1.35, 0], size: [2.6, 0.85, 1.9], kind: 'rock' },
      { id: 'p4', position: [23, 0.15, 0], size: [3, 0.85, 2], kind: 'river' },
      { id: 'p5', position: [29, -0.35, 0], size: [2.6, 0.85, 2], kind: 'rock' },
      { id: 'p6', position: [35, 0.85, 0], size: [3, 0.85, 1.9], kind: 'bridge' },
      { id: 'p7', position: [40, 0, 0], size: [6, 1, 2.25], kind: 'river' },
    ],
    [
      { id: 'c1', position: [2, 2.2, 0] },
      { id: 'c2', position: [11, 2.9, 0] },
      { id: 'c3', position: [17, 3.6, 0] },
      { id: 'c4', position: [23, 2.4, 0] },
      { id: 'c5', position: [29, 1.9, 0] },
      { id: 'c6', position: [35, 3.1, 0] },
      { id: 'c7', position: [40, 2.2, 0] },
      { id: 'c8', position: [42, 2.2, 0] },
    ],
    [
      { id: 'e1', position: [17, 2.4, 0], patrolRange: 1.1 },
      { id: 'e2', position: [29, 0.7, 0], patrolRange: 1.2 },
      { id: 'e3', position: [35, 1.9, 0], patrolRange: 1.5 },
    ],
  ),
];
