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
  powerBudget: number;
  spentBudget: number;
  surpriseDebt: number;
  surpriseCredit: number;
  elitePicksTaken: number;
  draftedCardIds: unknown;
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

  return {
    participantId: record.lobbyParticipantId,
    powerBudget: record.powerBudget,
    spentBudget: record.spentBudget,
    surpriseDebt: record.surpriseDebt,
    surpriseCredit: record.surpriseCredit,
    elitePicksTaken: record.elitePicksTaken,
    draftedCardIds,
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
    powerBudget: number;
    spentBudget: number;
    surpriseDebt: number;
    surpriseCredit: number;
    elitePicksTaken: number;
    draftedCardIds: Prisma.InputJsonValue;
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
      powerBudget: participant.powerBudget,
      spentBudget: participant.spentBudget,
      surpriseDebt: participant.surpriseDebt,
      surpriseCredit: participant.surpriseCredit,
      elitePicksTaken: participant.elitePicksTaken,
      draftedCardIds: [...participant.draftedCardIds],
      slotAssignments: [...participant.slotAssignments] as unknown as Prisma.InputJsonValue,
      pickCount: participant.pickCount,
    })),
  };
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
