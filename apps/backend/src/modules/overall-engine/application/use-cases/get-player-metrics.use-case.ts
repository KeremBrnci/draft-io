import type { PlayerMetrics } from '../../domain/entities/player-metrics.entity';
import { PlayerMetricsNotFoundError } from '../../domain/errors/overall-engine.errors';
import type { PlayerMetricsRepository } from '../../domain/repositories/player-metrics.repository';

export class GetPlayerMetricsUseCase {
  constructor(private readonly playerMetricsRepository: PlayerMetricsRepository) {}

  async execute(playerId: string): Promise<PlayerMetrics> {
    const metrics = await this.playerMetricsRepository.findByPlayerId(playerId);

    if (metrics === null) {
      throw new PlayerMetricsNotFoundError(playerId);
    }

    return metrics;
  }
}
