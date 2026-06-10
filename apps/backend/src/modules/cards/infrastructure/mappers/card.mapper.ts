import type { Card as PrismaCard } from '@prisma/client';

import { Card } from '../../domain/entities/card.entity';
import { type CardOverallSource } from '../../domain/enums/card-overall-source.enum';
import { CardId } from '../../domain/value-objects/card-id.vo';
import { CardOverall } from '../../domain/value-objects/card-overall.vo';
import { CardVersion } from '../../domain/value-objects/card-version.vo';
import { ReferenceId } from '../../domain/value-objects/reference-id.vo';

export function toCardDomain(record: PrismaCard): Card {
  return Card.reconstitute({
    id: CardId.create(record.id),
    playerId: record.playerId,
    cardTypeId: ReferenceId.create(record.cardTypeId),
    cardRarityId: ReferenceId.create(record.cardRarityId),
    cardTemplateId: ReferenceId.create(record.cardTemplateId),
    overall: CardOverall.create(record.overall),
    overallSource: record.overallSource as CardOverallSource,
    cardVersion: CardVersion.create(record.cardVersion),
    releaseDate: record.releaseDate,
    isActive: record.isActive,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  });
}

export function toCardPersistence(card: Card) {
  return {
    id: card.id.value,
    playerId: card.playerId,
    cardTypeId: card.cardTypeId.value,
    cardRarityId: card.cardRarityId.value,
    cardTemplateId: card.cardTemplateId.value,
    overall: card.overall.value,
    overallSource: card.overallSource,
    cardVersion: card.cardVersion.value,
    releaseDate: card.releaseDate,
    isActive: card.isActive,
    createdAt: card.createdAt,
    updatedAt: card.updatedAt,
  };
}
