import type { Card } from '../../domain/entities/card.entity';
import type { CardRarityRepository } from '../../domain/repositories/card-rarity.repository';
import type { CardTemplateRepository } from '../../domain/repositories/card-template.repository';
import type { CardTypeRepository } from '../../domain/repositories/card-type.repository';
import { indexById, toCardDetail } from '../mappers/card-detail.mapper';
import type { CardDetail } from '../read-models/card-detail';

export class CardEnrichmentService {
  constructor(
    private readonly cardTypeRepository: CardTypeRepository,
    private readonly cardRarityRepository: CardRarityRepository,
    private readonly cardTemplateRepository: CardTemplateRepository,
  ) {}

  async enrichCards(cards: readonly Card[]): Promise<readonly CardDetail[]> {
    const [types, rarities, templates] = await Promise.all([
      this.cardTypeRepository.findAll(),
      this.cardRarityRepository.findAll(),
      this.cardTemplateRepository.findAll(),
    ]);

    const typeById = indexById(types);
    const rarityById = indexById(rarities);
    const templateById = indexById(templates);

    return cards.flatMap((card) => {
      const cardType = typeById.get(card.cardTypeId.value);
      const cardRarity = rarityById.get(card.cardRarityId.value);
      const cardTemplate = templateById.get(card.cardTemplateId.value);

      if (cardType === undefined || cardRarity === undefined || cardTemplate === undefined) {
        return [];
      }

      return [toCardDetail(card, cardType, cardRarity, cardTemplate)];
    });
  }
}
