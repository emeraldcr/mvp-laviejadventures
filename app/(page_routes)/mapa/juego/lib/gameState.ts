import type { DeathCause, GameState } from '../types';
import { GAME_LEVELS } from '../data/levelData';
import { DEV_UNLOCK_ALL_LEVELS } from '../constants/storage';

export const PLAYER_NAME_MAX_LENGTH = 24;
export const DEATH_MESSAGE_COUNT = 4;

export const normalizePlayerName = (name: string) => (
  name.trim().slice(0, PLAYER_NAME_MAX_LENGTH)
);

export const randomDeathMessageIndex = () => (
  Math.floor(Math.random() * DEATH_MESSAGE_COUNT)
);

export const clampLevelIndex = (levelIndex: number) => (
  Math.max(0, Math.min(levelIndex, GAME_LEVELS.length - 1))
);

export const makeInitialState = (levelIndex = 0): GameState => ({
  lives: 3,
  score: 0,
  crystals: 0,
  lifetimeCrystals: 0,
  totalCrystals: GAME_LEVELS[levelIndex]?.collectibles.length ?? 0,
  status: 'map',
  currentLevelIndex: levelIndex,
  unlockedStationIndex: DEV_UNLOCK_ALL_LEVELS ? GAME_LEVELS.length : 0,
  restartKey: 0,
  playerName: null,
  deathCause: null,
  deathMessageIdx: 0,
});

export const applyDeath = (state: GameState, deathCause: DeathCause): GameState => {
  const lives = state.lives - 1;
  return {
    ...state,
    lives,
    status: lives <= 0 ? 'gameover' : 'dead',
    deathCause,
    deathMessageIdx: randomDeathMessageIndex(),
  };
};
