'use client';
import { useEffect, useRef } from 'react';

export interface KeyState {
  left: boolean;
  right: boolean;
  jump: boolean;
}

export function useKeyboard() {
  const keys = useRef<KeyState>({ left: false, right: false, jump: false });

  useEffect(() => {
    const GAME_KEYS = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space'];

    const onDown = (e: KeyboardEvent) => {
      if (GAME_KEYS.includes(e.code)) e.preventDefault();
      switch (e.code) {
        case 'ArrowLeft':  case 'KeyA': keys.current.left  = true; break;
        case 'ArrowRight': case 'KeyD': keys.current.right = true; break;
        case 'Space': case 'ArrowUp': case 'KeyW': keys.current.jump = true; break;
      }
    };
    const onUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'ArrowLeft':  case 'KeyA': keys.current.left  = false; break;
        case 'ArrowRight': case 'KeyD': keys.current.right = false; break;
        case 'Space': case 'ArrowUp': case 'KeyW': keys.current.jump = false; break;
      }
    };

    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup',   onUp);
    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup',   onUp);
    };
  }, []);

  return keys;
}
