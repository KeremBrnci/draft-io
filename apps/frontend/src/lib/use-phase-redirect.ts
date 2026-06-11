'use client';

import type { RoomPhaseDto } from '@draft-io/shared-types';
import { useRouter } from 'next/navigation';
import { useCallback, useRef } from 'react';

import { routeForRoomPhase } from '@/lib/lobby-phase-routes';

export function usePhaseRedirect(code: string): (phase: RoomPhaseDto) => void {
  const router = useRouter();
  const lastRedirectPhaseRef = useRef<RoomPhaseDto | null>(null);

  return useCallback(
    (phase: RoomPhaseDto) => {
      if (lastRedirectPhaseRef.current === phase) {
        return;
      }

      const route = routeForRoomPhase(code, phase);
      if (route === null) {
        return;
      }

      lastRedirectPhaseRef.current = phase;
      router.replace(route);
    },
    [code, router],
  );
}
