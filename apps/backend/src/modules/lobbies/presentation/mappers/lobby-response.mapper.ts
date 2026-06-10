import type { LobbySessionDto, LobbySummaryDto } from '@draft-io/shared-types';

import type { Lobby } from '../../domain/entities/lobby.entity';
import type { LobbyParticipant } from '../../domain/entities/lobby-participant.entity';
import type { LobbySession } from '../../application/read-models/lobby-session';

export function toLobbySummary(lobby: Lobby): LobbySummaryDto {
  return {
    id: lobby.id.value,
    name: lobby.name.value,
    code: lobby.code.value,
    status: lobby.status,
    phase: lobby.phase,
    maxPlayers: lobby.maxPlayers,
    participantCount: lobby.participants.length,
    participants: lobby.participants.map(toLobbyParticipantDto),
    formationSelectionStartedAt: lobby.formationSelectionStartedAt?.toISOString() ?? null,
    formationSelectionDeadline: lobby.formationSelectionDeadline?.toISOString() ?? null,
    createdAt: lobby.createdAt.toISOString(),
    expiresAt: lobby.expiresAt.toISOString(),
  };
}

export function toLobbySessionDto(session: LobbySession): LobbySessionDto {
  return {
    lobby: toLobbySummary(session.lobby),
    participantId: session.participant.id,
    sessionToken: session.participant.sessionToken.value,
  };
}

function toLobbyParticipantDto(participant: LobbyParticipant): LobbySummaryDto['participants'][number] {
  return {
    id: participant.id,
    displayName: participant.displayName.value,
    isHost: participant.isHost,
    isReady: participant.isReady,
    phaseStatus: participant.phaseStatus,
    selectedFormationId: participant.selectedFormationId,
    joinedAt: participant.joinedAt.toISOString(),
  };
}
