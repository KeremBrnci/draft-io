'use client';

import { useCallback, useRef } from 'react';

/** Skips overlapping invocations while a prior async call is still in flight. */
export function useCoalescedCallback<T extends (...args: never[]) => void | Promise<void>>(
  callback: T,
): T {
  const inFlightRef = useRef(false);
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  return useCallback((async (...args) => {
    if (inFlightRef.current) {
      return;
    }

    inFlightRef.current = true;
    try {
      await callbackRef.current(...args);
    } finally {
      inFlightRef.current = false;
    }
  }) as T, []);
}
