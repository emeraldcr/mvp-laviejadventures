// Path: hooks/useInterval.ts

import { useEffect, useRef } from 'react';

/**
 * Custom hook to manage intervals in a clean, React-friendly way.
 * @param callback The function to execute on each interval tick.
 * @param delay The delay in milliseconds, or null to stop the interval.
 */
export function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef(callback);

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    function tick() {
      // Execute the most recent callback function
      savedCallback.current();
    }
    if (delay !== null) {
      const id = setInterval(tick, delay);
      return () => clearInterval(id); // Cleanup function
    }
  }, [delay]);
}