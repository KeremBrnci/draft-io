import type { CardType } from '../entities/card-type.entity';
import type { ReferenceCode } from '../value-objects/reference-code.vo';
import type { ReferenceId } from '../value-objects/reference-id.vo';

export interface CardTypeRepository {
  findById(id: ReferenceId): Promise<CardType | null>;
  findByCode(code: ReferenceCode): Promise<CardType | null>;
  findAll(options?: { readonly activeOnly?: boolean }): Promise<readonly CardType[]>;
  save(cardType: CardType): Promise<void>;
}

export const CARD_TYPE_REPOSITORY = Symbol('CARD_TYPE_REPOSITORY');
