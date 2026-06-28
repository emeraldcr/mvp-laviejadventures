'use client';
import { useState, useCallback, useRef } from 'react';
import type { GameState } from '../types';
import { COLLECTIBLES } from '../data/levelData';

const TOTAL = COLLECTIBLES.length;

const INITIAL: GameState = {
  lives: 3,
  score: 0,
  crystals: 0,
  totalCrystals: TOTAL,
  status: 'playing',
  restartKey: 0,
};

export function useGameState() {
  const [state, setState] = useState<GameState>(INITIAL);
  const collectedRef = useRef(new Set<string>());

  const collectCrystal = useCallback((id: string) => {
    if (collectedRef.current.has(id)) return;
    collectedRef.current.add(id);
    setState(s => ({ ...s, crystals: s.crystals + 1, score: s.score + 100 }));
  }, []);

  const die = useCallback(() => {
    setState(s => {
      const lives = s.lives - 1;
      return { ...s, lives, status: lives <= 0 ? 'gameover' : 'dead' };
    });
  }, []);

  const respawn = useCallback(() => {
    setState(s => ({ ...s, status: 'playing' }));
  }, []);

  const win = useCallback(() => {
    setState(s => ({ ...s, status: 'win', score: s.score + 500 }));
  }, []);

  const restart = useCallback(() => {
    collectedRef.current.clear();
    setState(s => ({ ...INITIAL, restartKey: s.restartKey + 1 }));
  }, []);

  return { state, collectCrystal, die, respawn, win, restart };
}
