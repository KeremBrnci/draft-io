import type { OverallCalculation } from '../entities/overall-calculation.entity';

export interface CreateOverallCalculationInput {
  readonly playerId: string;
  readonly algorithmVersionId: string;
  readonly marketValueScore: number;
  readonly careerScore: number;
  readonly ageScore: number;
  readonly leagueScore: number;
  readonly legacyScore: number;
  readonly rawScore: number;
  readonly finalOverall: number;
  readonly profileTag: string | null;
  readonly appliedFloor: number | null;
  readonly appliedCeiling: number | null;
}

export interface OverallCalculationRepository {
  create(input: CreateOverallCalculationInput): Promise<OverallCalculation>;
  findHistoryByPlayerId(playerId: string): Promise<readonly OverallCalculation[]>;
}

export const OVERALL_CALCULATION_REPOSITORY = Symbol('OVERALL_CALCULATION_REPOSITORY');
