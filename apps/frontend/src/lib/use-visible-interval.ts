'use client';

import { useEffect, useRef } from 'react';

/** Runs callback on an interval only while the document tab is visible. */
export function useVisibleInterval(
  callback: () => void,
  intervalMs: number,
  enabled = true,
): void {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    if (!enabled || intervalMs <= 0) {
      return;
    }

    let timer: ReturnType<typeof setInterval> | null = null;

    const stop = (): void => {
      if (timer !== null) {
        clearInterval(timer);
        timer = null;
      }
    };

    const start = (): void => {
      stop();
      timer = setInterval(() => {
        callbackRef.current();
      }, intervalMs);
    };

    const onVisibilityChange = (): void => {
      if (document.visibilityState === 'visible') {
        callbackRef.current();
        start();
        return;
      }
      stop();
    };

    if (document.visibilityState === 'visible') {
      start();
    }

    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      stop();
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [enabled, intervalMs]);
}
