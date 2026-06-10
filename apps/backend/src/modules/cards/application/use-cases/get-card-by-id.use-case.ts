import { CardNotFoundError } from '../../domain/errors/card.errors';
import type { CardRepository } from '../../domain/repositories/card.repository';
import { CardId } from '../../domain/value-objects/card-id.vo';
import type { GetCardByIdQuery } from '../queries/get-card-by-id.query';
import type { CardDetail } from '../read-models/card-detail';
import type { CardEnrichmentService } from '../services/card-enrichment.service';

export class GetCardByIdUseCase {
  constructor(
    private readonly cardRepository: CardRepository,
    private readonly cardEnrichmentService: CardEnrichmentService,
  ) {}

  async execute(query: GetCardByIdQuery): Promise<CardDetail> {
    const card = await this.cardRepository.findById(CardId.create(query.cardId));

    if (card === null) {
      throw new CardNotFoundError(query.cardId);
    }

    const enriched = await this.cardEnrichmentService.enrichCards([card]);

    if (enriched[0] === undefined) {
      throw new CardNotFoundError(query.cardId);
    }

    return enriched[0];
  }
}
