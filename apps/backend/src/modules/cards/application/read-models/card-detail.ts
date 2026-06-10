import type { Card } from '../../domain/entities/card.entity';

export interface CardDetail {
  readonly card: Card;
  readonly cardTypeCode: string;
  readonly cardRarityCode: string;
  readonly cardTemplateName: string;
}
