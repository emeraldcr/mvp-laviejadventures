import type { PlatformData, CollectibleData, EnemyData, LevelData, TrailStation } from '../types';

export const SPAWN_POSITION: [number, number, number] = [0, 2, 0];
export const GOAL_POSITION: [number, number, number] = [43, 1.5, 0];
export const DEATH_Y = -5;
export const RIVER_Y = -3;

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
  stationId: string,
  nextStationId: string | undefined,
  platforms: PlatformData[],
  collectibles: CollectibleData[],
  enemies: EnemyData[],
): LevelData => ({
  id,
  title,
  subtitle,
  stationId,
  nextStationId,
  spawnPosition: SPAWN_POSITION,
  goalPosition: GOAL_POSITION,
  platforms,
  collectibles,
  enemies,
});

export const GAME_LEVELS: LevelData[] = [
  makeLevel(
    'recepcion-cafetales',
    'Recepcion -> Sendero Cafetales',
    'Primer tramo: agarre vuelo suave, mae, que la montana apenas esta despertando.',
    'recepcion',
    'sendero-cafetales',
    PLATFORMS,
    COLLECTIBLES,
    ENEMIES,
  ),
  makeLevel(
    'cafetales-montanita',
    'Sendero Cafetales -> Montanita',
    'Ruta con saltos mas cortos y camino alto para llegar al mirador.',
    'sendero-cafetales',
    'montanita',
    [
      { id: 'p1', position: [2, 0, 0], size: [7, 1, 2] },
      { id: 'p2', position: [10, 1.2, 0], size: [3, 1, 2] },
      { id: 'p3', position: [16, 0.4, 0], size: [3, 1, 2] },
      { id: 'p4', position: [22, 1.6, 0], size: [4, 1, 2] },
      { id: 'p5', position: [29, 0.4, 0], size: [3, 1, 2] },
      { id: 'p6', position: [35, 1.1, 0], size: [3, 1, 2] },
      { id: 'p7', position: [40, 0, 0], size: [6, 1, 2] },
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
    'El sendero baja y sube como tarde de lluvia: con calma y precision.',
    'montanita',
    'descenso-canon',
    [
      { id: 'p1', position: [2, 0, 0], size: [8, 1, 2] },
      { id: 'p2', position: [12, -0.2, 0], size: [3, 1, 2] },
      { id: 'p3', position: [18, -0.8, 0], size: [3, 1, 2] },
      { id: 'p4', position: [24, 0.8, 0], size: [2.7, 1, 2] },
      { id: 'p5', position: [30, 1.6, 0], size: [3, 1, 2] },
      { id: 'p6', position: [36, 0.7, 0], size: [3, 1, 2] },
      { id: 'p7', position: [40, 0, 0], size: [6, 1, 2] },
    ],
    [
      { id: 'c1', position: [3, 2.2, 0] },
      { id: 'c2', position: [12, 2, 0] },
      { id: 'c3', position: [18, 1.4, 0] },
      { id: 'c4', position: [24, 3, 0] },
      { id: 'c5', position: [30, 3.8, 0] },
      { id: 'c6', position: [36, 2.9, 0] },
      { id: 'c7', position: [40, 2.2, 0] },
    ],
    [
      { id: 'e1', position: [18, 0.2, 0], patrolRange: 1.2 },
      { id: 'e2', position: [30, 2.6, 0], patrolRange: 1.5 },
    ],
  ),
  makeLevel(
    'descenso-rio',
    'Descenso al Canon -> Plataforma del Rio',
    'Tramo final: piedra, brillo verde y llegada al rio con estilo pura vida.',
    'descenso-canon',
    'plataforma-rio',
    [
      { id: 'p1', position: [2, 0, 0], size: [7, 1, 2] },
      { id: 'p2', position: [11, 0.7, 0], size: [2.8, 1, 2] },
      { id: 'p3', position: [17, 1.4, 0], size: [2.6, 1, 2] },
      { id: 'p4', position: [23, 0.2, 0], size: [3, 1, 2] },
      { id: 'p5', position: [29, -0.3, 0], size: [2.6, 1, 2] },
      { id: 'p6', position: [35, 0.9, 0], size: [3, 1, 2] },
      { id: 'p7', position: [40, 0, 0], size: [6, 1, 2] },
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
