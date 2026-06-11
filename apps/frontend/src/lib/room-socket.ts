'use client';

import type { RoomEventNameDto } from '@draft-io/shared-types';
import { useEffect, useRef } from 'react';
import { io, type Socket } from 'socket.io-client';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

function roomSocketUrl(): string {
  return `${API_BASE.replace(/\/$/, '')}/rooms`;
}

export function useRoomSocket(
  lobbyCode: string,
  onEvent: (event: RoomEventNameDto, payload: unknown) => void,
): void {
  const handlerRef = useRef(onEvent);
  handlerRef.current = onEvent;

  useEffect(() => {
    if (lobbyCode.length === 0) {
      return;
    }

    const socket: Socket = io(roomSocketUrl(), {
      transports: ['websocket'],
      autoConnect: true,
    });

    const code = lobbyCode.toUpperCase();
    const events: RoomEventNameDto[] = [
      'FORMATION_SELECTION_STARTED',
      'PLAYER_SELECTED_FORMATION',
      'ALL_FORMATIONS_SELECTED',
      'DRAFT_READY',
      'DRAFT_PLAYER_READY',
      'DRAFT_COMPLETE',
      'COACH_SELECTION_STARTED',
      'PLAYER_SELECTED_COACH',
      'ALL_COACHES_SELECTED',
      'TEAMS_READY',
      'LEAGUE_READY',
      'MATCH_STARTED',
      'MATCH_MINUTE_UPDATED',
      'MATCH_EVENT_CREATED',
      'GOAL_SCORED',
      'HALF_TIME',
      'FULL_TIME',
      'LEAGUE_TABLE_UPDATED',
      'LEAGUE_COMPLETED',
      'LOBBY_RESET',
    ];

    socket.on('connect', () => {
      socket.emit('join_room', { code });
    });

    for (const event of events) {
      socket.on(event, (payload: unknown) => {
        handlerRef.current(event, payload);
      });
    }

    return () => {
      socket.emit('leave_room', { code });
      socket.disconnect();
    };
  }, [lobbyCode]);
}
