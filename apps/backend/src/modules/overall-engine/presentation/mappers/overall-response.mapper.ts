import type {
  CalculateOverallResultDto,
  OverallCalculationDto,
  PlayerMetricsDto,
  RecalculateOverallResultDto,
} from '@draft-io/shared-types';

import type { CalculatePlayerOverallResult } from '../../application/use-cases/calculate-player-overall.use-case';
import type { RecalculateOverallResult } from '../../application/use-cases/recalculate-overall.use-case';
import type { OverallCalculation } from '../../domain/entities/overall-calculation.entity';
import type { PlayerMetrics } from '../../domain/entities/player-metrics.entity';
import type { OverallAlgorithmVersionRecord } from '../../domain/repositories/overall-algorithm-version.repository';

export function toPlayerMetricsDto(
  metrics: PlayerMetrics,
  version: OverallAlgorithmVersionRecord,
): PlayerMetricsDto {
  return {
    playerId: metrics.playerId,
    algorithmVersion: version.code as PlayerMetricsDto['algorithmVersion'],
    marketValueScore: metrics.components.marketValueScore,
    careerScore: metrics.components.careerScore,
    ageScore: metrics.components.ageScore,
    leagueScore: metrics.components.leagueScore,
    legacyScore: metrics.components.legacyScore,
    profileTag: metrics.profileTag,
    createdAt: metrics.createdAt.toISOString(),
    updatedAt: metrics.updatedAt.toISOString(),
  };
}

export function toOverallCalculationDto(
  calculation: OverallCalculation,
  version: OverallAlgorithmVersionRecord,
): OverallCalculationDto {
  return {
    id: calculation.id.value,
    playerId: calculation.playerId,
    algorithmVersion: version.code as OverallCalculationDto['algorithmVersion'],
    marketValueScore: calculation.components.marketValueScore,
    careerScore: calculation.components.careerScore,
    ageScore: calculation.components.ageScore,
    leagueScore: calculation.components.leagueScore,
    legacyScore: calculation.components.legacyScore,
    rawScore: calculation.rawScore,
    finalOverall: calculation.finalOverall,
    profileTag: calculation.profileTag,
    appliedFloor: calculation.appliedFloor,
    appliedCeiling: calculation.appliedCeiling,
    createdAt: calculation.createdAt.toISOString(),
  };
}

export function toCalculateOverallResultDto(
  result: CalculatePlayerOverallResult,
  version: OverallAlgorithmVersionRecord,
): CalculateOverallResultDto {
  return {
    calculation: toOverallCalculationDto(result.calculation, version),
    metrics: toPlayerMetricsDto(result.metrics, version),
    skippedDueToManualOverride: result.skippedDueToManualOverride,
  };
}

export function toRecalculateOverallResultDto(
  result: RecalculateOverallResult,
): RecalculateOverallResultDto {
  return {
    processed: result.processed,
    calculated: result.calculated,
    skippedManualOverride: result.skippedManualOverride,
    failed: result.failed,
  };
}
