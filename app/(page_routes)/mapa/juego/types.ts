export interface PlatformData {
  id: string;
  position: [number, number, number];
  size: [number, number, number];
}

export interface CollectibleData {
  id: string;
  position: [number, number, number];
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
  stationId: string;
  nextStationId?: string;
  spawnPosition: [number, number, number];
  goalPosition: [number, number, number];
  platforms: PlatformData[];
  collectibles: CollectibleData[];
  enemies: EnemyData[];
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
  totalCrystals: number;
  status: GameStatus;
  currentLevelIndex: number;
  unlockedStationIndex: number;
  restartKey: number;
}
