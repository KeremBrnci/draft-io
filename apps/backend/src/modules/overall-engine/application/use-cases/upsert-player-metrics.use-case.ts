import { DEFAULT_CAREER_SCORE, DEFAULT_LEGACY_SCORE } from '../../domain/config/overall-v1.config';
import type { PlayerMetrics } from '../../domain/entities/player-metrics.entity';
import { OVERALL_ALGORITHM_V1 } from '../../domain/enums/overall-algorithm-version.enum';
import type { OverallProfileTag } from '../../domain/enums/overall-profile-tag.enum';
import type { OverallAlgorithmVersionRepository } from '../../domain/repositories/overall-algorithm-version.repository';
import type { PlayerMetricsRepository } from '../../domain/repositories/player-metrics.repository';

export interface UpsertPlayerMetricsCommand {
  readonly playerId: string;
  readonly careerScore?: number;
  readonly legacyScore?: number;
  readonly profileTag?: OverallProfileTag | null;
}

export class UpsertPlayerMetricsUseCase {
  constructor(
    private readonly playerMetricsRepository: PlayerMetricsRepository,
    private readonly algorithmVersionRepository: OverallAlgorithmVersionRepository,
  ) {}

  async execute(command: UpsertPlayerMetricsCommand): Promise<PlayerMetrics> {
    const version = await this.algorithmVersionRepository.ensureVersion(
      OVERALL_ALGORITHM_V1,
      'Overall Engine V1',
    );

    const existing = await this.playerMetricsRepository.findByPlayerId(command.playerId);

    if (existing === null) {
      return this.playerMetricsRepository.upsert({
        playerId: command.playerId,
        algorithmVersionId: version.id,
        marketValueScore: 0,
        careerScore: command.careerScore ?? DEFAULT_CAREER_SCORE,
        ageScore: 0,
        leagueScore: 0,
        legacyScore: command.legacyScore ?? DEFAULT_LEGACY_SCORE,
        profileTag: command.profileTag ?? null,
      });
    }

    return this.playerMetricsRepository.updateManualInputs(command.playerId, {
      ...(command.careerScore !== undefined ? { careerScore: command.careerScore } : {}),
      ...(command.legacyScore !== undefined ? { legacyScore: command.legacyScore } : {}),
      ...(command.profileTag !== undefined ? { profileTag: command.profileTag } : {}),
    });
  }
}
