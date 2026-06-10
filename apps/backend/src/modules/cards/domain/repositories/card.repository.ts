import type { Card } from '../entities/card.entity';
import type { CardId } from '../value-objects/card-id.vo';

export interface CardListFilter {
  readonly cardTypeCode?: string;
  readonly cardRarityCode?: string;
  readonly minOverall?: number;
  readonly maxOverall?: number;
  readonly playerId?: string;
  readonly isActive?: boolean;
}

export interface CardRepository {
  findById(id: CardId): Promise<Card | null>;
  findAll(filter?: CardListFilter): Promise<readonly Card[]>;
  findByPlayerId(playerId: string, filter?: CardListFilter): Promise<readonly Card[]>;
  save(card: Card): Promise<void>;
}

export const CARD_REPOSITORY = Symbol('CARD_REPOSITORY');
