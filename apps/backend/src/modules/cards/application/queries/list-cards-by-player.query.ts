import type { CardListFilter } from '../../domain/repositories/card.repository';

export interface ListCardsByPlayerQuery {
  readonly playerId: string;
  readonly filter?: Omit<CardListFilter, 'playerId'>;
}
