import type { DraftSlotAssignmentDto } from './draft-board.js';

export interface ParticipantDraftStateDto {
  readonly participantId: string;
  readonly powerBudget: number;
  readonly spentBudget: number;
  readonly remainingBudget: number;
  readonly surpriseDebt: number;
  readonly surpriseCredit: number;
  readonly elitePicksTaken: number;
  readonly draftedCardIds: readonly string[];
  readonly slotAssignments: readonly DraftSlotAssignmentDto[];
  readonly pickCount: number;
}

export interface DraftSessionSummaryDto {
  readonly id: string;
  readonly lobbyId: string;
  readonly status: 'PENDING' | 'ACTIVE' | 'COMPLETED';
  readonly rosterSize: number;
  readonly participants: readonly ParticipantDraftStateDto[];
}

export interface DraftFairnessSimulationResultDto {
  readonly runCount: number;
  readonly participantCount: number;
  readonly averageTeamOverallMean: number;
  readonly averageTeamOverallStdDev: number;
  readonly averageOverallSpread: number;
  readonly maxOverallSpread: number;
  readonly averageChemistryMean: number;
  readonly averageMatchPowerMean: number;
  readonly perParticipantStats: readonly {
    readonly participantIndex: number;
    readonly meanOverall: number;
    readonly meanChemistry: number;
    readonly meanMatchPower: number;
    readonly elitePickRate: number;
  }[];
}
