'use client';

import { useCallback, useRef } from 'react';

import {
  isLobbyGoneError,
  isTransientApiError,
  normalizeApiErrorMessage,
} from '@/lib/api/resilience';

const TRANSIENT_FAILURE_WARNING_THRESHOLD = 4;

export function useBackgroundLoadErrors(): {
  readonly onLoadSuccess: () => void;
  readonly resolvePollError: (error: unknown, fallbackMessage: string) => string | null;
  readonly reset: () => void;
} {
  const hasDataRef = useRef(false);
  const transientFailuresRef = useRef(0);

  const onLoadSuccess = useCallback((): void => {
    hasDataRef.current = true;
    transientFailuresRef.current = 0;
  }, []);

  const reset = useCallback((): void => {
    hasDataRef.current = false;
    transientFailuresRef.current = 0;
  }, []);

  const resolvePollError = useCallback(
    (error: unknown, fallbackMessage: string): string | null => {
      if (isLobbyGoneError(error)) {
        return null;
      }

      if (!hasDataRef.current) {
        return normalizeApiErrorMessage(error, fallbackMessage);
      }

      if (isTransientApiError(error)) {
        transientFailuresRef.current += 1;
        if (transientFailuresRef.current >= TRANSIENT_FAILURE_WARNING_THRESHOLD) {
          return 'Bağlantı kararsız. Otomatik yeniden deneniyor…';
        }
        return null;
      }

      return null;
    },
    [],
  );

  return { onLoadSuccess, resolvePollError, reset };
}
