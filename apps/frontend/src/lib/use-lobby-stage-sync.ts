'use client';

import type { RoomEventNameDto } from '@draft-io/shared-types';
import { useEffect } from 'react';

import { useRoomSocket } from '@/lib/room-socket';
import { useCoalescedCallback } from '@/lib/use-coalesced-callback';
import { useVisibleInterval } from '@/lib/use-visible-interval';

interface LobbyStageSyncOptions {
  lobbyCode: string;
  onRefresh: () => void | Promise<void>;
  pollIntervalMs: number;
  enabled?: boolean;
  refreshEvents?: ReadonlySet<RoomEventNameDto>;
}

export function useLobbyStageSync({
  lobbyCode,
  onRefresh,
  pollIntervalMs,
  enabled = true,
  refreshEvents,
}: LobbyStageSyncOptions): void {
  const coalescedRefresh = useCoalescedCallback(onRefresh);

  useEffect(() => {
    void coalescedRefresh();
  }, [coalescedRefresh]);

  useVisibleInterval(
    () => {
      void coalescedRefresh();
    },
    pollIntervalMs,
    enabled,
  );

  useRoomSocket(lobbyCode, (event) => {
    if (refreshEvents !== undefined && !refreshEvents.has(event)) {
      return;
    }

    void coalescedRefresh();
  });
}
