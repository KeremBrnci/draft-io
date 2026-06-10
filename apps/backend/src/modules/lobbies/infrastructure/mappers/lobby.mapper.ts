import type {
  LobbyParticipant as PrismaLobbyParticipant,
  Lobby as PrismaLobby,
  LobbyParticipantCoachOption as PrismaCoachOption,
  LobbyParticipantFormationOption as PrismaFormationOption,
} from '@prisma/client';

import { LobbyParticipant } from '../../domain/entities/lobby-participant.entity';
import { Lobby } from '../../domain/entities/lobby.entity';
import { LobbyStatus } from '../../domain/enums/lobby-status.enum';
import { ParticipantPhaseStatus, RoomPhase } from '../../domain/enums/room-phase.enum';
import { LobbyExpirationService } from '../../domain/services/lobby-expiration.service';
import { LobbyCode } from '../../domain/value-objects/lobby-code.vo';
import { LobbyId } from '../../domain/value-objects/lobby-id.vo';
import { LobbyName } from '../../domain/value-objects/lobby-name.vo';
import { ParticipantDisplayName } from '../../domain/value-objects/participant-display-name.vo';
import { SessionToken } from '../../domain/value-objects/session-token.vo';

type LobbyWithParticipants = PrismaLobby & {
  readonly participants: readonly (PrismaLobbyParticipant & {
    readonly formationOptions: readonly PrismaFormationOption[];
    readonly coachOptions: readonly PrismaCoachOption[];
  })[];
};

const expirationService = new LobbyExpirationService();

export function toLobbyDomain(record: LobbyWithParticipants): Lobby {
  return Lobby.reconstitute({
    id: LobbyId.create(record.id),
    name: LobbyName.create(record.name),
    code: LobbyCode.create(record.code),
    status: parseLobbyStatus(record.status),
    phase: parseRoomPhase(record.phase),
    maxPlayers: record.maxPlayers,
    participants: record.participants.map(toParticipantDomain),
    expiresAt: record.expiresAt ?? expirationService.initialExpiresAt(record.createdAt),
    formationSelectionStartedAt: record.formationSelectionStartedAt,
    formationSelectionDeadline: record.formationSelectionDeadline,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  });
}

export function toLobbyPersistence(lobby: Lobby): {
  readonly lobby: Omit<PrismaLobby, 'participants'>;
  readonly participants: readonly (Omit<PrismaLobbyParticipant, 'lobby'> & {
    readonly formationOptionIds: readonly string[];
    readonly coachOptionIds: readonly string[];
  })[];
} {
  return {
    lobby: {
      id: lobby.id.value,
      name: lobby.name.value,
      code: lobby.code.value,
      status: lobby.status,
      phase: lobby.phase,
      maxPlayers: lobby.maxPlayers,
      expiresAt: lobby.expiresAt,
      formationSelectionStartedAt: lobby.formationSelectionStartedAt,
      formationSelectionDeadline: lobby.formationSelectionDeadline,
      createdAt: lobby.createdAt,
      updatedAt: lobby.updatedAt,
    },
    participants: lobby.participants.map((participant) => ({
      id: participant.id,
      lobbyId: lobby.id.value,
      displayName: participant.displayName.value,
      isHost: participant.isHost,
      isReady: participant.isReady,
      phaseStatus: participant.phaseStatus,
      selectedFormationId: participant.selectedFormationId,
      selectedCoachId: participant.selectedCoachId,
      sessionToken: participant.sessionToken.value,
      joinedAt: participant.joinedAt,
      formationOptionIds: participant.formationOptionIds,
      coachOptionIds: participant.coachOptionIds,
    })),
  };
}

function toParticipantDomain(
  record: PrismaLobbyParticipant & {
    readonly formationOptions: readonly PrismaFormationOption[];
    readonly coachOptions: readonly PrismaCoachOption[];
  },
): LobbyParticipant {
  const formationOptionIds = [...record.formationOptions]
    .sort((left, right) => left.sortOrder - right.sortOrder)
    .map((option) => option.formationId);
  const coachOptionIds = [...record.coachOptions]
    .sort((left, right) => left.sortOrder - right.sortOrder)
    .map((option) => option.coachId);

  return LobbyParticipant.reconstitute({
    id: record.id,
    displayName: ParticipantDisplayName.create(record.displayName),
    isHost: record.isHost,
    isReady: record.isReady,
    phaseStatus: parseParticipantPhaseStatus(record.phaseStatus),
    selectedFormationId: record.selectedFormationId,
    selectedCoachId: record.selectedCoachId,
    formationOptionIds,
    coachOptionIds,
    sessionToken: SessionToken.reconstitute(record.sessionToken),
    joinedAt: record.joinedAt,
  });
}

function parseLobbyStatus(value: string): LobbyStatus {
  if (Object.values(LobbyStatus).includes(value as LobbyStatus)) {
    return value as LobbyStatus;
  }

  return LobbyStatus.CLOSED;
}

function parseRoomPhase(value: string): RoomPhase {
  if (Object.values(RoomPhase).includes(value as RoomPhase)) {
    return value as RoomPhase;
  }

  return RoomPhase.LOBBY;
}

function parseParticipantPhaseStatus(value: string): ParticipantPhaseStatus {
  if (Object.values(ParticipantPhaseStatus).includes(value as ParticipantPhaseStatus)) {
    return value as ParticipantPhaseStatus;
  }

  return ParticipantPhaseStatus.IN_LOBBY;
}
