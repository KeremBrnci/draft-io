import type { PlayerMetrics } from '../entities/player-metrics.entity';

export interface UpsertPlayerMetricsInput {
  readonly playerId: string;
  readonly algorithmVersionId: string;
  readonly marketValueScore: number;
  readonly careerScore: number;
  readonly ageScore: number;
  readonly leagueScore: number;
  readonly legacyScore: number;
  readonly profileTag: string | null;
}

export interface PlayerMetricsRepository {
  findByPlayerId(playerId: string): Promise<PlayerMetrics | null>;
  upsert(input: UpsertPlayerMetricsInput): Promise<PlayerMetrics>;
  updateManualInputs(
    playerId: string,
    input: {
      readonly careerScore?: number;
      readonly legacyScore?: number;
      readonly profileTag?: string | null;
    },
  ): Promise<PlayerMetrics>;
}

export const PLAYER_METRICS_REPOSITORY = Symbol('PLAYER_METRICS_REPOSITORY');
