import type { CardRarity as PrismaCardRarity } from '@prisma/client';

import { CardRarity } from '../../domain/entities/card-rarity.entity';
import { ReferenceCode } from '../../domain/value-objects/reference-code.vo';
import { ReferenceId } from '../../domain/value-objects/reference-id.vo';

export function toCardRarityDomain(record: PrismaCardRarity): CardRarity {
  return CardRarity.reconstitute({
    id: ReferenceId.create(record.id),
    code: ReferenceCode.create(record.code),
    name: record.name,
    description: record.description,
    sortOrder: record.sortOrder,
    isActive: record.isActive,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  });
}

export function toCardRarityPersistence(cardRarity: CardRarity) {
  return {
    id: cardRarity.id.value,
    code: cardRarity.code.value,
    name: cardRarity.name,
    description: cardRarity.description,
    sortOrder: cardRarity.sortOrder,
    isActive: cardRarity.isActive,
    createdAt: cardRarity.createdAt,
    updatedAt: cardRarity.updatedAt,
  };
}
