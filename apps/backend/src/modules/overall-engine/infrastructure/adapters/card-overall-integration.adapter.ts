import { Inject, Injectable } from '@nestjs/common';

import { CardOverallSource } from '../../../cards/domain/enums/card-overall-source.enum';
import type { CardRepository } from '../../../cards/domain/repositories/card.repository';
import { CARD_REPOSITORY } from '../../../cards/domain/repositories/card.repository';
import { CardOverall } from '../../../cards/domain/value-objects/card-overall.vo';
import type { CardOverallIntegrationPort } from '../../domain/ports/card-overall-integration.port';

@Injectable()
export class CardOverallIntegrationAdapter implements CardOverallIntegrationPort {
  constructor(@Inject(CARD_REPOSITORY) private readonly cardRepository: CardRepository) {}

  async applyCalculatedOverallToBaseCards(
    playerId: string,
    overall: number,
  ): Promise<{ readonly updatedCardCount: number; readonly skippedManualOverrideCount: number }> {
    const cards = await this.cardRepository.findByPlayerId(playerId, { isActive: true });
    let updatedCardCount = 0;
    let skippedManualOverrideCount = 0;

    for (const card of cards) {
      if (card.overallSource === CardOverallSource.MANUAL_OVERRIDE) {
        skippedManualOverrideCount += 1;
        continue;
      }

      card.applyCalculatedOverall(CardOverall.create(overall));
      await this.cardRepository.save(card);
      updatedCardCount += 1;
    }

    return { updatedCardCount, skippedManualOverrideCount };
  }
}
