'use client';

import type { DraftPickOptionsDto } from '@draft-io/shared-types';
import { useCallback, useEffect, useRef } from 'react';

import { getDraftPickOptions } from '@/lib/api/draft';

interface UseDraftPickOptionsCacheParams {
  readonly code: string;
  readonly sessionToken: string | null;
  readonly nextSlotIndex: number | null;
  readonly pickCount: number;
  readonly isRosterComplete: boolean;
  readonly enabled: boolean;
}

interface UseDraftPickOptionsCacheResult {
  readonly getCached: (slotIndex: number) => DraftPickOptionsDto | undefined;
  readonly fetchOptions: (
    slotIndex: number,
    options?: { readonly force?: boolean },
  ) => Promise<DraftPickOptionsDto>;
  readonly invalidate: () => void;
}

export function useDraftPickOptionsCache({
  code,
  sessionToken,
  nextSlotIndex,
  pickCount,
  isRosterComplete,
  enabled,
}: UseDraftPickOptionsCacheParams): UseDraftPickOptionsCacheResult {
  const cacheRef = useRef(new Map<number, DraftPickOptionsDto>());
  const inflightRef = useRef(new Map<number, Promise<DraftPickOptionsDto>>());

  const invalidate = useCallback((): void => {
    cacheRef.current.clear();
    inflightRef.current.clear();
  }, []);

  const fetchOptions = useCallback(
    async (
      slotIndex: number,
      options?: { readonly force?: boolean },
    ): Promise<DraftPickOptionsDto> => {
      if (sessionToken === null) {
        throw new Error('Missing lobby session');
      }

      if (!options?.force) {
        const cached = cacheRef.current.get(slotIndex);
        if (cached !== undefined) {
          return cached;
        }
      }

      const inflight = inflightRef.current.get(slotIndex);
      if (inflight !== undefined) {
        return inflight;
      }

      const request = getDraftPickOptions(code, sessionToken, slotIndex)
        .then((result) => {
          cacheRef.current.set(slotIndex, result);
          return result;
        })
        .finally(() => {
          inflightRef.current.delete(slotIndex);
        });

      inflightRef.current.set(slotIndex, request);
      return request;
    },
    [code, sessionToken],
  );

  const getCached = useCallback((slotIndex: number): DraftPickOptionsDto | undefined => {
    return cacheRef.current.get(slotIndex);
  }, []);

  useEffect(() => {
    if (!enabled || sessionToken === null || isRosterComplete || nextSlotIndex === null) {
      return;
    }

    if (cacheRef.current.has(nextSlotIndex) || inflightRef.current.has(nextSlotIndex)) {
      return;
    }

    void fetchOptions(nextSlotIndex).catch(() => {
      // Prefetch failures are non-blocking; the drawer fetch will retry.
    });
  }, [
    enabled,
    fetchOptions,
    isRosterComplete,
    nextSlotIndex,
    pickCount,
    sessionToken,
  ]);

  return { getCached, fetchOptions, invalidate };
}
