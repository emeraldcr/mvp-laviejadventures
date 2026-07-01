export interface PlatformData {
  id: string;
  position: [number, number, number];
  size: [number, number, number];
  kind?: 'trail' | 'mud' | 'root' | 'rock' | 'stair' | 'bridge' | 'river';
}

export interface CollectibleData {
  id: string;
  position: [number, number, number];
}

export type PowerUpKind = 'ruby' | 'sapphire';
export type DeathCause = 'fall' | 'enemy';

export interface PowerUpData {
  id: string;
  position: [number, number, number];
  kind: PowerUpKind;
}

export interface BulletState {
  id: number;
  x: number;
  y: number;
  dir: number;
}

export interface EnemyData {
  id: string;
  position: [number, number, number];
  patrolRange: number;
}

export interface LevelData {
  id: string;
  title: string;
  subtitle: string;
  theme: 'reception' | 'cafetal' | 'montanita' | 'stairs' | 'river';
  stationId: string;
  nextStationId?: string;
  spawnPosition: [number, number, number];
  goalPosition: [number, number, number];
  platforms: PlatformData[];
  collectibles: CollectibleData[];
  enemies: EnemyData[];
  powerUps: PowerUpData[];
}

export interface TrailStation {
  id: string;
  name: string;
  shortName: string;
  x: number;
  y: number;
  description: string;
}

export type GameStatus = 'map' | 'playing' | 'dead' | 'gameover' | 'win' | 'complete';

export interface GameState {
  lives: number;
  score: number;
  crystals: number;
  lifetimeCrystals: number;
  totalCrystals: number;
  status: GameStatus;
  currentLevelIndex: number;
  unlockedStationIndex: number;
  restartKey: number;
  playerName: string | null;
  deathCause: DeathCause | null;
  deathMessageIdx: number;
}

export interface LeaderboardEntry {
  name: string;
  crystals: number;
  bestScore: number;
  lastPlayedAt: number;
}
