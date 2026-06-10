import type { CardType as PrismaCardType } from '@prisma/client';

import { CardType } from '../../domain/entities/card-type.entity';
import { ReferenceCode } from '../../domain/value-objects/reference-code.vo';
import { ReferenceId } from '../../domain/value-objects/reference-id.vo';

export function toCardTypeDomain(record: PrismaCardType): CardType {
  return CardType.reconstitute({
    id: ReferenceId.create(record.id),
    code: ReferenceCode.create(record.code),
    name: record.name,
    description: record.description,
    isActive: record.isActive,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  });
}

export function toCardTypePersistence(cardType: CardType) {
  return {
    id: cardType.id.value,
    code: cardType.code.value,
    name: cardType.name,
    description: cardType.description,
    isActive: cardType.isActive,
    createdAt: cardType.createdAt,
    updatedAt: cardType.updatedAt,
  };
}
