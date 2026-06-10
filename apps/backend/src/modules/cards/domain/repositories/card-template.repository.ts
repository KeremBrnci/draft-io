import type { CardTemplate } from '../entities/card-template.entity';
import type { ReferenceId } from '../value-objects/reference-id.vo';

export interface CardTemplateRepository {
  findById(id: ReferenceId): Promise<CardTemplate | null>;
  findByCardTypeId(cardTypeId: ReferenceId): Promise<readonly CardTemplate[]>;
  findAll(options?: { readonly activeOnly?: boolean }): Promise<readonly CardTemplate[]>;
  save(cardTemplate: CardTemplate): Promise<void>;
}

export const CARD_TEMPLATE_REPOSITORY = Symbol('CARD_TEMPLATE_REPOSITORY');
