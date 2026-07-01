export interface PlatformData {
  id: string;
  position: [number, number, number];
  size: [number, number, number];
  kind?: 'trail' | 'mud' | 'root' | 'rock' | 'stair' | 'bridge' | 'river';
}

export interface CollectibleData {
  id: string;
  position: [number, number, number];
  kind?: 'emerald';
}

export type PowerUpKind = 'ruby' | 'sapphire';

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
