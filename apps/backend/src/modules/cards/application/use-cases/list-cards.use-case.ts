import type { CardRepository } from '../../domain/repositories/card.repository';
import type { ListCardsQuery } from '../queries/list-cards.query';
import type { CardDetail } from '../read-models/card-detail';
import type { CardEnrichmentService } from '../services/card-enrichment.service';

export class ListCardsUseCase {
  constructor(
    private readonly cardRepository: CardRepository,
    private readonly cardEnrichmentService: CardEnrichmentService,
  ) {}

  async execute(query: ListCardsQuery): Promise<readonly CardDetail[]> {
    const cards = await this.cardRepository.findAll(query.filter);
    return this.cardEnrichmentService.enrichCards(cards);
  }
}
