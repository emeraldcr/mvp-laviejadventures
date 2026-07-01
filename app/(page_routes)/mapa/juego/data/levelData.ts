import type { PlatformData, CollectibleData, EnemyData, LevelData, PowerUpData, TrailStation } from '../types';

export const SPAWN_POSITION: [number, number, number] = [0, 6.42, 0];
export const GOAL_POSITION: [number, number, number] = [27, -3.65, 0];
export const DEATH_Y = -10;
export const RIVER_Y = -6.2;
const LEVEL_SPAWN: [number, number, number] = [0, 6.42, 0];
const LEVEL_GOAL: [number, number, number] = [27, -3.65, 0];

export const TRAIL_STATIONS: TrailStation[] = [
  {
    id: 'recepcion',
    name: 'Recepcion',
    shortName: 'Inicio',
    x: 23,
    y: 14,
    description: 'Punto alto de salida antes de bajar hacia Ciudad Esmeralda.',
  },
  {
    id: 'sendero-cafetales',
    name: 'Sendero Cafetales',
    shortName: 'Cafetales',
    x: 37,
    y: 30,
    description: 'Primeras gradas naturales entre cafetales, barro bonito y bosque joven.',
  },
  {
    id: 'montanita',
    name: 'Montanita',
    shortName: 'Montanita',
    x: 50,
    y: 47,
    description: 'Mirador natural antes de entrar al descenso fuerte.',
  },
  {
    id: 'descenso-canon',
    name: 'Descenso al Canon',
    shortName: 'Escaleras',
    x: 64,
    y: 64,
    description: 'Escaleras y plataformas angostas pegadas a la pared del canon.',
  },
  {
    id: 'plataforma-rio',
    name: 'Plataforma del Rio',
    shortName: 'Rio',
    x: 79,
    y: 83,
    description: 'Ultimo punto antes de cerrar la travesia esmeralda.',
  },
];

export const TRAIL_CONNECTIONS: Array<{ from: string; to: string; kind: 'main' | 'alt' }> = [
  { from: 'recepcion', to: 'sendero-cafetales', kind: 'main' },
  { from: 'sendero-cafetales', to: 'montanita', kind: 'main' },
  { from: 'montanita', to: 'descenso-canon', kind: 'main' },
  { from: 'descenso-canon', to: 'plataforma-rio', kind: 'main' },
];

// Each platform: [centerX, centerY, centerZ], [width, height, depth]
export const PLATFORMS: PlatformData[] = [
  { id: 'p1', position: [2, 5.5, 0], size: [6.8, 1, 2] },
  { id: 'p2', position: [7.3, 4.25, 0], size: [3.3, 0.85, 2] },
  { id: 'p3', position: [11.3, 2.95, 0], size: [3, 0.85, 2] },
  { id: 'p4', position: [15.3, 1.55, 0], size: [3.2, 0.85, 2] },
  { id: 'p5', position: [19.4, 0.1, 0], size: [3.2, 0.85, 2] },
  { id: 'p6', position: [23.2, -1.45, 0], size: [3, 0.85, 2] },
  { id: 'p7', position: [27, -4.15, 0], size: [6.2, 1, 2] },
];

export const COLLECTIBLES: CollectibleData[] = [
  { id: 'c1', position: [2, 7.15, 0] },
  { id: 'c2', position: [7.3, 5.75, 0] },
  { id: 'c3', position: [11.3, 4.45, 0] },
  { id: 'c4', position: [15.3, 3.05, 0] },
  { id: 'c5', position: [19.4, 1.6, 0] },
  { id: 'c6', position: [23.2, 0.1, 0] },
  { id: 'c7', position: [27, -2.5, 0] },
];

export const ENEMIES: EnemyData[] = [
  { id: 'e1', position: [19.4, 1.25, 0], patrolRange: 1.4 },
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
  powerUps: PowerUpData[] = [],
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
  powerUps,
});

const stairsToCanon: PlatformData[] = [
  { id: 'p1', position: [2, 5.5, 0], size: [6.8, 1, 2.2], kind: 'trail' },
  { id: 's1', position: [6.1, 4.72, 0], size: [2, 0.68, 2], kind: 'stair' },
  { id: 's2', position: [8.7, 3.95, 0], size: [1.9, 0.68, 2], kind: 'stair' },
  { id: 's3', position: [11.3, 3.15, 0], size: [1.9, 0.68, 2], kind: 'stair' },
  { id: 's4', position: [13.9, 2.32, 0], size: [1.9, 0.68, 2], kind: 'stair' },
  { id: 'rest1', position: [17.2, 1.18, 0], size: [4, 0.85, 2.15], kind: 'rock' },
  { id: 's5', position: [20.8, 0.25, 0], size: [1.9, 0.68, 2], kind: 'stair' },
  { id: 's6', position: [23.2, -0.82, 0], size: [1.8, 0.68, 2], kind: 'stair' },
  { id: 'bridge1', position: [25.3, -2.05, 0], size: [3, 0.58, 1.65], kind: 'bridge' },
  { id: 'p7', position: [27, -4.15, 0], size: [6.2, 1, 2.25], kind: 'rock' },
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
      { id: 'p1', position: [2, 5.5, 0], size: [7, 1, 2.4], kind: 'trail' },
      { id: 'p2', position: [7.5, 4.35, 0], size: [3.6, 0.85, 2.2], kind: 'mud' },
      { id: 'p3', position: [11.6, 3.2, 0], size: [3.2, 0.8, 2], kind: 'trail' },
      { id: 'p4', position: [15.5, 1.9, 0], size: [3.2, 0.85, 2.2], kind: 'mud' },
      { id: 'p5', position: [19.6, 0.55, 0], size: [3.6, 0.9, 2.1], kind: 'trail' },
      { id: 'p6', position: [23.3, -1.05, 0], size: [3, 0.85, 2], kind: 'root' },
      { id: 'p7', position: [27, -4.15, 0], size: [6.2, 1, 2.25], kind: 'trail' },
    ],
    [
      { id: 'c1', position: [2, 7.15, 0] },
      { id: 'c2', position: [7.5, 5.85, 0] },
      { id: 'c3', position: [11.6, 4.65, 0] },
      { id: 'c4', position: [15.5, 3.4, 0] },
      { id: 'c5', position: [19.6, 2.15, 0] },
      { id: 'c6', position: [23.3, 0.45, 0] },
      { id: 'c7', position: [27, -2.5, 0] },
    ],
    [
      { id: 'e1', position: [19.6, 1.6, 0], patrolRange: 1.3 },
    ],
    [
      { id: 'pu-r1', position: [11.6, 4.25, 0], kind: 'ruby' },
      { id: 'pu-s1', position: [23.3, 0.15, 0], kind: 'sapphire' },
    ],
  ),
  makeLevel(
    'cafetales-montanita',
    'Sendero Cafetales -> Montanita',
    'Cafetales y raices: saltos cortos, camino alto y barro vacilon.',
    'cafetal',
    'sendero-cafetales',
    'montanita',
    [
      { id: 'p1', position: [2, 5.5, 0], size: [6.8, 1, 2], kind: 'mud' },
      { id: 'p2', position: [6.8, 4.05, 0], size: [3, 0.8, 1.8], kind: 'root' },
      { id: 'p3', position: [10.4, 2.75, 0], size: [3, 0.85, 2.1], kind: 'mud' },
      { id: 'p4', position: [14.6, 1.25, 0], size: [3.4, 0.8, 1.7], kind: 'root' },
      { id: 'p5', position: [18.7, -0.25, 0], size: [3, 0.85, 2], kind: 'trail' },
      { id: 'p6', position: [22.6, -1.9, 0], size: [3, 0.8, 1.8], kind: 'root' },
      { id: 'p7', position: [27, -4.15, 0], size: [6.2, 1, 2.2], kind: 'trail' },
    ],
    [
      { id: 'c1', position: [2, 7.15, 0] },
      { id: 'c2', position: [6.8, 5.45, 0] },
      { id: 'c3', position: [10.4, 4.25, 0] },
      { id: 'c4', position: [14.6, 2.65, 0] },
      { id: 'c5', position: [18.7, 1.25, 0] },
      { id: 'c6', position: [22.6, -0.5, 0] },
      { id: 'c7', position: [27, -2.5, 0] },
    ],
    [
      { id: 'e1', position: [14.6, 2.25, 0], patrolRange: 1.2 },
      { id: 'e2', position: [22.6, -0.95, 0], patrolRange: 1.2 },
    ],
    [
      { id: 'pu-r2', position: [10.4, 3.85, 0], kind: 'ruby' },
      { id: 'pu-s2', position: [18.7, 0.9, 0], kind: 'sapphire' },
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
      { id: 'p1', position: [2, 5.5, 0], size: [7, 1, 2.2], kind: 'rock' },
      { id: 'p2', position: [6.9, 4.0, 0], size: [2.8, 0.85, 1.8], kind: 'rock' },
      { id: 'p3', position: [10.2, 2.45, 0], size: [2.8, 0.85, 1.8], kind: 'rock' },
      { id: 'p4', position: [14, 0.95, 0], size: [3.3, 0.85, 1.7], kind: 'rock' },
      { id: 'p5', position: [18.1, -0.65, 0], size: [3, 0.85, 1.9], kind: 'root' },
      { id: 'p6', position: [22.3, -2.25, 0], size: [3, 0.85, 2], kind: 'trail' },
      { id: 'p7', position: [27, -4.15, 0], size: [6.2, 1, 2.2], kind: 'rock' },
    ],
    [
      { id: 'c1', position: [3, 7.15, 0] },
      { id: 'c2', position: [6.9, 5.5, 0] },
      { id: 'c3', position: [10.2, 3.95, 0] },
      { id: 'c4', position: [14, 2.45, 0] },
      { id: 'c5', position: [18.1, 0.85, 0] },
      { id: 'c6', position: [22.3, -0.75, 0] },
      { id: 'c7', position: [27, -2.5, 0] },
    ],
    [
      { id: 'e1', position: [10.2, 3.5, 0], patrolRange: 1.1 },
      { id: 'e2', position: [18.1, 0.4, 0], patrolRange: 1.2 },
    ],
    [
      { id: 'pu-r3', position: [6.9, 5.1, 0], kind: 'ruby' },
      { id: 'pu-s3', position: [14, 2.05, 0], kind: 'sapphire' },
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
      { id: 'c1', position: [2, 7.15, 0] },
      { id: 'c2', position: [6.1, 5.95, 0] },
      { id: 'c3', position: [8.7, 5.15, 0] },
      { id: 'c4', position: [11.3, 4.35, 0] },
      { id: 'c5', position: [17.2, 2.7, 0] },
      { id: 'c6', position: [23.2, 0.25, 0] },
      { id: 'c7', position: [25.3, -0.9, 0] },
      { id: 'c8', position: [27, -2.5, 0] },
    ],
    [
      { id: 'e1', position: [17.2, 2.1, 0], patrolRange: 1.6 },
      { id: 'e2', position: [25.3, -1.35, 0], patrolRange: 1 },
    ],
    [
      { id: 'pu-r4', position: [13.9, 3.45, 0], kind: 'ruby' },
      { id: 'pu-s4', position: [20.8, 1.35, 0], kind: 'sapphire' },
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
      { id: 'p1', position: [2, 5.5, 0], size: [6.8, 1, 2.2], kind: 'river' },
      { id: 'p2', position: [6.8, 4.15, 0], size: [2.9, 0.85, 2], kind: 'rock' },
      { id: 'p3', position: [10.4, 2.65, 0], size: [2.8, 0.85, 1.9], kind: 'rock' },
      { id: 'p4', position: [14.5, 1.05, 0], size: [3, 0.85, 2], kind: 'river' },
      { id: 'p5', position: [18.6, -0.7, 0], size: [2.8, 0.85, 2], kind: 'rock' },
      { id: 'p6', position: [22.8, -2.25, 0], size: [3, 0.85, 1.9], kind: 'bridge' },
      { id: 'p7', position: [27, -4.15, 0], size: [6.2, 1, 2.25], kind: 'river' },
    ],
    [
      { id: 'c1', position: [2, 7.15, 0] },
      { id: 'c2', position: [6.8, 5.65, 0] },
      { id: 'c3', position: [10.4, 4.15, 0] },
      { id: 'c4', position: [14.5, 2.55, 0] },
      { id: 'c5', position: [18.6, 0.8, 0] },
      { id: 'c6', position: [22.8, -0.75, 0] },
      { id: 'c7', position: [27, -2.5, 0] },
      { id: 'c8', position: [29, -2.5, 0] },
    ],
    [
      { id: 'e1', position: [10.4, 3.7, 0], patrolRange: 1 },
      { id: 'e2', position: [18.6, 0.35, 0], patrolRange: 1 },
      { id: 'e3', position: [22.8, -1.3, 0], patrolRange: 1.2 },
    ],
    [
      { id: 'pu-r5', position: [6.8, 5.25, 0], kind: 'ruby' },
      { id: 'pu-s5', position: [14.5, 2.15, 0], kind: 'sapphire' },
    ],
  ),
];
