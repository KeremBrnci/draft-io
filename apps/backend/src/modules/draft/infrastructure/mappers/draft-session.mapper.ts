import type { DraftBalanceConfigDto } from '@draft-io/shared-types';
import { type Prisma } from '@prisma/client';

import type { DraftSlotAssignment } from '../../domain/models/participant-draft-state';
import type { ParticipantDraftState } from '../../domain/models/participant-draft-state';
import type {
  DraftSession,
  DraftSessionStatus,
} from '../../domain/repositories/draft-session.repository';

interface DraftSessionRecord {
  id: string;
  lobbyId: string;
  status: string;
  rosterSize: number;
  config: unknown;
  createdAt: Date;
  updatedAt: Date;
  participants: readonly DraftParticipantRecord[];
}

interface DraftParticipantRecord {
  id: string;
  draftSessionId: string;
  lobbyParticipantId: string;
  surpriseDebt: number;
  surpriseCredit: number;
  elitePicksTaken: number;
  draftedCardIds: unknown;
  recentlyOfferedPlayerIds?: unknown;
  slotAssignments: unknown;
  pickCount: number;
}

export function toDraftSessionDomain(record: DraftSessionRecord): DraftSession {
  return {
    id: record.id,
    lobbyId: record.lobbyId,
    status: record.status as DraftSessionStatus,
    rosterSize: record.rosterSize,
    config: record.config as DraftBalanceConfigDto,
    participants: record.participants.map(toParticipantDomain),
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

export function toParticipantDomain(record: DraftParticipantRecord): ParticipantDraftState {
  const draftedCardIds = Array.isArray(record.draftedCardIds)
    ? record.draftedCardIds.filter((value): value is string => typeof value === 'string')
    : [];

  const slotAssignments = parseSlotAssignments(record.slotAssignments);
  const recentlyOfferedPlayerIds = parseStringArray(record.recentlyOfferedPlayerIds);

  return {
    participantId: record.lobbyParticipantId,
    surpriseDebt: record.surpriseDebt,
    surpriseCredit: record.surpriseCredit,
    elitePicksTaken: record.elitePicksTaken,
    draftedCardIds,
    recentlyOfferedPlayerIds,
    slotAssignments,
    pickCount: record.pickCount,
  };
}

export function toDraftSessionPersistence(session: DraftSession): {
  session: {
    id: string;
    lobbyId: string;
    status: string;
    rosterSize: number;
    config: Prisma.InputJsonValue;
    createdAt: Date;
    updatedAt: Date;
  };
  participants: readonly {
    id: string;
    draftSessionId: string;
    lobbyParticipantId: string;
    surpriseDebt: number;
    surpriseCredit: number;
    elitePicksTaken: number;
    draftedCardIds: Prisma.InputJsonValue;
    recentlyOfferedPlayerIds: Prisma.InputJsonValue;
    slotAssignments: Prisma.InputJsonValue;
    pickCount: number;
  }[];
} {
  return {
    session: {
      id: session.id,
      lobbyId: session.lobbyId,
      status: session.status,
      rosterSize: session.rosterSize,
      config: session.config as unknown as Prisma.InputJsonValue,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    },
    participants: session.participants.map((participant, index) => ({
      id: `${session.id}-participant-${index}`,
      draftSessionId: session.id,
      lobbyParticipantId: participant.participantId,
      surpriseDebt: participant.surpriseDebt,
      surpriseCredit: participant.surpriseCredit,
      elitePicksTaken: participant.elitePicksTaken,
      draftedCardIds: [...participant.draftedCardIds],
      recentlyOfferedPlayerIds: [...participant.recentlyOfferedPlayerIds],
      slotAssignments: [...participant.slotAssignments] as unknown as Prisma.InputJsonValue,
      pickCount: participant.pickCount,
    })),
  };
}

function parseStringArray(value: unknown): readonly string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((entry): entry is string => typeof entry === 'string');
}

function parseSlotAssignments(value: unknown): readonly DraftSlotAssignment[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((entry) => {
    if (typeof entry !== 'object' || entry === null) {
      return [];
    }

    const record = entry as Record<string, unknown>;
    if (
      typeof record.slotIndex !== 'number' ||
      typeof record.cardId !== 'string' ||
      typeof record.positionCode !== 'string' ||
      typeof record.slotLabel !== 'string'
    ) {
      return [];
    }

    return [
      {
        slotIndex: record.slotIndex,
        cardId: record.cardId,
        positionCode: record.positionCode,
        slotLabel: record.slotLabel,
      },
    ];
  });
}
