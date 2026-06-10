import { CardOverallSource } from '../../../cards/domain/enums/card-overall-source.enum';
import type { CardRepository } from '../../../cards/domain/repositories/card.repository';

export class ManualOverrideGuardService {
  constructor(private readonly cardRepository: CardRepository) {}

  async hasManualOverride(playerId: string): Promise<boolean> {
    const cards = await this.cardRepository.findByPlayerId(playerId, { isActive: true });
    return cards.some((card) => card.overallSource === CardOverallSource.MANUAL_OVERRIDE);
  }
}
