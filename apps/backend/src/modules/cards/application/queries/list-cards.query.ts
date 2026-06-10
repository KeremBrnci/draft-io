import type { CardListFilter } from '../../domain/repositories/card.repository';

export interface ListCardsQuery {
  readonly filter?: CardListFilter;
}
