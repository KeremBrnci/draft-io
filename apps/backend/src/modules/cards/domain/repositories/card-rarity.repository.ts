import type { CardRarity } from '../entities/card-rarity.entity';
import type { ReferenceCode } from '../value-objects/reference-code.vo';
import type { ReferenceId } from '../value-objects/reference-id.vo';

export interface CardRarityRepository {
  findById(id: ReferenceId): Promise<CardRarity | null>;
  findByCode(code: ReferenceCode): Promise<CardRarity | null>;
  findAll(options?: { readonly activeOnly?: boolean }): Promise<readonly CardRarity[]>;
  save(cardRarity: CardRarity): Promise<void>;
}

export const CARD_RARITY_REPOSITORY = Symbol('CARD_RARITY_REPOSITORY');
