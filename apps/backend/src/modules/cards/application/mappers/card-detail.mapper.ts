import type { CardRarity } from '../../domain/entities/card-rarity.entity';
import type { CardTemplate } from '../../domain/entities/card-template.entity';
import type { CardType } from '../../domain/entities/card-type.entity';
import type { Card } from '../../domain/entities/card.entity';
import type { CardDetail } from '../read-models/card-detail';

export function toCardDetail(
  card: Card,
  cardType: CardType,
  cardRarity: CardRarity,
  cardTemplate: CardTemplate,
): CardDetail {
  return {
    card,
    cardTypeCode: cardType.code.value,
    cardRarityCode: cardRarity.code.value,
    cardTemplateName: cardTemplate.name,
  };
}

export function indexById<T extends { id: { value: string } }>(
  items: readonly T[],
): ReadonlyMap<string, T> {
  return new Map(items.map((item) => [item.id.value, item]));
}
