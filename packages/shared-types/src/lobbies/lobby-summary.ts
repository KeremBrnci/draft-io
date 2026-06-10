import type { ParticipantPhaseStatusDto, RoomPhaseDto } from '../rooms/room-phase.js';

export type LobbyStatusDto = 'OPEN' | 'FULL' | 'STARTED' | 'CLOSED';

export type { RoomPhaseDto, ParticipantPhaseStatusDto };

export interface LobbyParticipantDto {
  readonly id: string;
  readonly displayName: string;
  readonly isHost: boolean;
  readonly isReady: boolean;
  readonly phaseStatus: ParticipantPhaseStatusDto;
  readonly selectedFormationId: string | null;
  readonly joinedAt: string;
}

export interface LobbySummaryDto {
  readonly id: string;
  readonly name: string;
  readonly code: string;
  readonly status: LobbyStatusDto;
  readonly phase: RoomPhaseDto;
  readonly maxPlayers: number;
  readonly participantCount: number;
  readonly participants: readonly LobbyParticipantDto[];
  readonly formationSelectionStartedAt: string | null;
  readonly formationSelectionDeadline: string | null;
  readonly createdAt: string;
  readonly expiresAt: string;
}

export interface LobbySessionDto {
  readonly lobby: LobbySummaryDto;
  readonly participantId: string;
  readonly sessionToken: string;
}

export interface CreateLobbyCommandDto {
  readonly name: string;
  readonly displayName: string;
  readonly maxPlayers?: number;
}

export interface JoinLobbyCommandDto {
  readonly code: string;
  readonly displayName: string;
}

export interface SetParticipantReadyCommandDto {
  readonly sessionToken: string;
  readonly isReady: boolean;
}

export interface StartLobbyCommandDto {
  readonly sessionToken: string;
}

export interface StartLobbyResultDto {
  readonly lobby: LobbySummaryDto;
}
