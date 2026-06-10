import type { OverallCalculation } from '../../domain/entities/overall-calculation.entity';
import type { OverallCalculationRepository } from '../../domain/repositories/overall-calculation.repository';

export class GetOverallHistoryUseCase {
  constructor(private readonly overallCalculationRepository: OverallCalculationRepository) {}

  async execute(playerId: string): Promise<readonly OverallCalculation[]> {
    return this.overallCalculationRepository.findHistoryByPlayerId(playerId);
  }
}
