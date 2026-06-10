import type { CardRepository } from '../../domain/repositories/card.repository';
import type { CardDetail } from '../read-models/card-detail';
import type { ListCardsByPlayerQuery } from '../queries/list-cards-by-player.query';
import type { CardEnrichmentService } from '../services/card-enrichment.service';

export class ListCardsByPlayerUseCase {
  constructor(
    private readonly cardRepository: CardRepository,
    private readonly cardEnrichmentService: CardEnrichmentService,
  ) {}

  async execute(query: ListCardsByPlayerQuery): Promise<readonly CardDetail[]> {
    const cards = await this.cardRepository.findByPlayerId(query.playerId, query.filter);
    return this.cardEnrichmentService.enrichCards(cards);
  }
}
