'use client';

import type { RoomChatMessageDto, RoomEventNameDto } from '@draft-io/shared-types';
import { useEffect, useRef } from 'react';
import { io, type Socket } from 'socket.io-client';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export type RoomSocketEventName = RoomEventNameDto | 'CHAT_MESSAGE';

export type RoomSocketHandler = (
  event: RoomSocketEventName,
  payload: unknown,
) => void;

interface RoomSocketEntry {
  socket: Socket;
  refCount: number;
  handlers: Set<RoomSocketHandler>;
}

const ROOM_SOCKET_EVENTS: RoomEventNameDto[] = [
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
  'CHAT_MESSAGE',
];

const socketEntries = new Map<string, RoomSocketEntry>();

function roomSocketUrl(): string {
  return `${API_BASE.replace(/\/$/, '')}/rooms`;
}

function normalizeChatPayload(payload: unknown): RoomChatMessageDto | null {
  if (typeof payload !== 'object' || payload === null) {
    return null;
  }

  const record = payload as Record<string, unknown>;
  const id = typeof record.id === 'string' ? record.id : record.messageId;
  if (
    typeof id !== 'string' ||
    typeof record.participantId !== 'string' ||
    typeof record.displayName !== 'string' ||
    typeof record.body !== 'string' ||
    typeof record.sentAt !== 'string'
  ) {
    return null;
  }

  const lobbyCode =
    typeof record.lobbyCode === 'string' ? record.lobbyCode.trim().toUpperCase() : '';

  return {
    id,
    lobbyCode,
    participantId: record.participantId,
    displayName: record.displayName,
    body: record.body,
    sentAt: record.sentAt,
  };
}

function dispatchRoomEvent(code: string, event: RoomSocketEventName, payload: unknown): void {
  const entry = socketEntries.get(code);
  if (entry === undefined) {
    return;
  }

  if (event === 'CHAT_MESSAGE') {
    const message = normalizeChatPayload(payload);
    if (message === null) {
      return;
    }

    for (const handler of entry.handlers) {
      handler(event, message);
    }
    return;
  }

  for (const handler of entry.handlers) {
    handler(event, payload);
  }
}

function acquireRoomSocket(code: string): RoomSocketEntry {
  const normalizedCode = code.toUpperCase();
  const existing = socketEntries.get(normalizedCode);
  if (existing !== undefined) {
    existing.refCount += 1;
    return existing;
  }

  const socket: Socket = io(roomSocketUrl(), {
    transports: ['websocket'],
    autoConnect: true,
  });

  const entry: RoomSocketEntry = {
    socket,
    refCount: 1,
    handlers: new Set(),
  };

  socket.on('connect', () => {
    socket.emit('join_room', { code: normalizedCode });
  });

  for (const event of ROOM_SOCKET_EVENTS) {
    socket.on(event, (payload: unknown) => {
      dispatchRoomEvent(normalizedCode, event, payload);
    });
  }

  socketEntries.set(normalizedCode, entry);
  return entry;
}

function releaseRoomSocket(code: string): void {
  const normalizedCode = code.toUpperCase();
  const entry = socketEntries.get(normalizedCode);
  if (entry === undefined) {
    return;
  }

  entry.refCount -= 1;
  if (entry.refCount > 0) {
    return;
  }

  entry.socket.emit('leave_room', { code: normalizedCode });
  entry.socket.disconnect();
  socketEntries.delete(normalizedCode);
}

export function subscribeRoomSocket(code: string, handler: RoomSocketHandler): () => void {
  if (code.length === 0) {
    return () => undefined;
  }

  const entry = acquireRoomSocket(code);
  entry.handlers.add(handler);

  return () => {
    entry.handlers.delete(handler);
    releaseRoomSocket(code);
  };
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

    return subscribeRoomSocket(lobbyCode, (event, payload) => {
      if (event === 'CHAT_MESSAGE') {
        return;
      }

      handlerRef.current(event, payload);
    });
  }, [lobbyCode]);
}

export function parseRoomChatMessage(payload: unknown): RoomChatMessageDto | null {
  if (typeof payload === 'object' && payload !== null) {
    const record = payload as Record<string, unknown>;
    if (
      typeof record.id === 'string' &&
      typeof record.participantId === 'string' &&
      typeof record.displayName === 'string' &&
      typeof record.body === 'string' &&
      typeof record.sentAt === 'string' &&
      typeof record.lobbyCode === 'string'
    ) {
      return payload as RoomChatMessageDto;
    }
  }

  return normalizeChatPayload(payload);
}
