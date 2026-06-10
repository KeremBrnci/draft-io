export type OverallAlgorithmVersionCodeDto = 'V1';

export type OverallProfileTagDto =
  | 'LEGEND_ACTIVE_OLD'
  | 'ELITE_CURRENT'
  | 'YOUNG_SUPERSTAR'
  | 'NORMAL_PLAYER';

export interface PlayerMetricsDto {
  readonly playerId: string;
  readonly algorithmVersion: OverallAlgorithmVersionCodeDto;
  readonly marketValueScore: number;
  readonly careerScore: number;
  readonly ageScore: number;
  readonly leagueScore: number;
  readonly legacyScore: number;
  readonly profileTag: OverallProfileTagDto | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface OverallCalculationDto {
  readonly id: string;
  readonly playerId: string;
  readonly algorithmVersion: OverallAlgorithmVersionCodeDto;
  readonly marketValueScore: number;
  readonly careerScore: number;
  readonly ageScore: number;
  readonly leagueScore: number;
  readonly legacyScore: number;
  readonly rawScore: number;
  readonly finalOverall: number;
  readonly profileTag: OverallProfileTagDto | null;
  readonly appliedFloor: number | null;
  readonly appliedCeiling: number | null;
  readonly createdAt: string;
}

export interface CalculateOverallResultDto {
  readonly calculation: OverallCalculationDto;
  readonly metrics: PlayerMetricsDto;
  readonly skippedDueToManualOverride: boolean;
}

export interface RecalculateOverallCommandDto {
  readonly playerIds?: readonly string[];
  readonly leagueId?: string;
  readonly algorithmVersion?: OverallAlgorithmVersionCodeDto;
  readonly force?: boolean;
}

export interface RecalculateOverallResultDto {
  readonly processed: number;
  readonly calculated: number;
  readonly skippedManualOverride: number;
  readonly failed: number;
}

export interface UpsertPlayerMetricsCommandDto {
  readonly careerScore?: number;
  readonly legacyScore?: number;
  readonly profileTag?: OverallProfileTagDto | null;
}
