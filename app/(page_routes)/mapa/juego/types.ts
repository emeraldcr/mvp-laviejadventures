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

export type GameStatus = 'playing' | 'dead' | 'gameover' | 'win';

export interface GameState {
  lives: number;
  score: number;
  crystals: number;
  totalCrystals: number;
  status: GameStatus;
  restartKey: number;
}
