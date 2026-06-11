import { RECENTLY_OFFERED_PLAYER_LIMIT } from '../constants/pick-board-profile.constants';

import type { DraftPoolCard } from './draft-pool-card';

export interface DraftSlotAssignment {
  readonly slotIndex: number;
  readonly cardId: string;
  readonly positionCode: string;
  readonly slotLabel: string;
}

export interface ParticipantDraftState {
  readonly participantId: string;
  readonly surpriseDebt: number;
  readonly surpriseCredit: number;
  readonly elitePicksTaken: number;
  readonly draftedCardIds: readonly string[];
  readonly recentlyOfferedPlayerIds: readonly string[];
  readonly slotAssignments: readonly DraftSlotAssignment[];
  readonly pickCount: number;
}

export function createParticipantDraftState(input: {
  readonly participantId: string;
}): ParticipantDraftState {
  return {
    participantId: input.participantId,
    surpriseDebt: 0,
    surpriseCredit: 0,
    elitePicksTaken: 0,
    draftedCardIds: [],
    recentlyOfferedPlayerIds: [],
    slotAssignments: [],
    pickCount: 0,
  };
}

export function recordOfferedPlayers(
  state: ParticipantDraftState,
  playerIds: readonly string[],
): ParticipantDraftState {
  const merged = [...state.recentlyOfferedPlayerIds, ...playerIds];
  const unique = [...new Set(merged)];
  return {
    ...state,
    recentlyOfferedPlayerIds: unique.slice(-RECENTLY_OFFERED_PLAYER_LIMIT),
  };
}

export function picksRemaining(state: ParticipantDraftState, rosterSize: number): number {
  return Math.max(0, rosterSize - state.pickCount);
}

export function applyPick(
  state: ParticipantDraftState,
  card: DraftPoolCard,
  input: {
    readonly isElite: boolean;
    readonly eliteDebtAmount: number;
    readonly eliteCreditAmount: number;
    readonly slotAssignment?: DraftSlotAssignment;
  },
): ParticipantDraftState {
  return {
    ...state,
    surpriseDebt: input.isElite
      ? state.surpriseDebt + input.eliteDebtAmount
      : Math.max(0, state.surpriseDebt - input.eliteCreditAmount),
    surpriseCredit: input.isElite
      ? Math.max(0, state.surpriseCredit - input.eliteCreditAmount)
      : state.surpriseCredit,
    elitePicksTaken: input.isElite ? state.elitePicksTaken + 1 : state.elitePicksTaken,
    draftedCardIds: [...state.draftedCardIds, card.cardId],
    slotAssignments:
      input.slotAssignment === undefined
        ? state.slotAssignments
        : [...state.slotAssignments, input.slotAssignment],
    pickCount: state.pickCount + 1,
  };
}

export function averageDraftedOverall(
  cards: readonly DraftPoolCard[],
  state: ParticipantDraftState,
): number {
  if (state.draftedCardIds.length === 0) {
    return 0;
  }

  const drafted = cards.filter((card) => state.draftedCardIds.includes(card.cardId));
  if (drafted.length === 0) {
    return 0;
  }

  const sum = drafted.reduce((total, card) => total + card.overall, 0);
  return sum / drafted.length;
}

export function swapSlotAssignments(
  state: ParticipantDraftState,
  input: {
    readonly fromSlotIndex: number;
    readonly toSlotIndex: number;
    readonly toSlotMetadata: { readonly positionCode: string; readonly slotLabel: string };
    readonly fromSlotMetadata: { readonly positionCode: string; readonly slotLabel: string };
  },
): ParticipantDraftState {
  const fromAssignment = state.slotAssignments.find(
    (assignment) => assignment.slotIndex === input.fromSlotIndex,
  );
  const toAssignment = state.slotAssignments.find(
    (assignment) => assignment.slotIndex === input.toSlotIndex,
  );

  if (fromAssignment === undefined || toAssignment === undefined) {
    return state;
  }

  const slotAssignments = state.slotAssignments.map((assignment) => {
    if (assignment.slotIndex === input.fromSlotIndex) {
      return {
        ...assignment,
        slotIndex: input.toSlotIndex,
        positionCode: input.toSlotMetadata.positionCode,
        slotLabel: input.toSlotMetadata.slotLabel,
      };
    }

    if (assignment.slotIndex === input.toSlotIndex) {
      return {
        ...assignment,
        slotIndex: input.fromSlotIndex,
        positionCode: input.fromSlotMetadata.positionCode,
        slotLabel: input.fromSlotMetadata.slotLabel,
      };
    }

    return assignment;
  });

  return {
    ...state,
    slotAssignments,
  };
}

export function findNextEmptySlotIndex(
  slotIndexes: readonly number[],
  assignments: readonly DraftSlotAssignment[],
): number | null {
  const filled = new Set(assignments.map((assignment) => assignment.slotIndex));
  for (const slotIndex of [...slotIndexes].sort((left, right) => left - right)) {
    if (!filled.has(slotIndex)) {
      return slotIndex;
    }
  }

  return null;
}
