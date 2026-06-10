import type {
  CreateLobbyCommandDto,
  JoinLobbyCommandDto,
  LobbySessionDto,
  LobbySummaryDto,
  SetParticipantReadyCommandDto,
  StartLobbyCommandDto,
  StartLobbyResultDto,
} from '@draft-io/shared-types';

import { apiGet, apiPost } from './client';

export function createLobby(body: CreateLobbyCommandDto): Promise<LobbySessionDto> {
  return apiPost<LobbySessionDto>('/lobbies', body);
}

export function joinLobby(body: JoinLobbyCommandDto): Promise<LobbySessionDto> {
  return apiPost<LobbySessionDto>('/lobbies/join', body);
}

export function getLobbyByCode(code: string): Promise<LobbySummaryDto> {
  return apiGet<LobbySummaryDto>(`/lobbies/code/${encodeURIComponent(code.toUpperCase())}`);
}

export function setParticipantReady(
  code: string,
  body: SetParticipantReadyCommandDto,
): Promise<LobbySummaryDto> {
  return apiPost<LobbySummaryDto>(`/lobbies/code/${encodeURIComponent(code.toUpperCase())}/ready`, body);
}

export function startLobby(code: string, body: StartLobbyCommandDto): Promise<StartLobbyResultDto> {
  return apiPost<StartLobbyResultDto>(`/lobbies/code/${encodeURIComponent(code.toUpperCase())}/start`, body);
}
