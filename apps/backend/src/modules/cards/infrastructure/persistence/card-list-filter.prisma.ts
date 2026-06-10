import type { Prisma } from '@prisma/client';

import type { CardListFilter } from '../../domain/repositories/card.repository';

export function toPrismaCardWhere(filter?: CardListFilter): Prisma.CardWhereInput {
  if (filter === undefined) {
    return {};
  }

  const overallFilter: Prisma.IntFilter | undefined =
    filter.minOverall !== undefined || filter.maxOverall !== undefined
      ? {
          ...(filter.minOverall !== undefined ? { gte: filter.minOverall } : {}),
          ...(filter.maxOverall !== undefined ? { lte: filter.maxOverall } : {}),
        }
      : undefined;

  return {
    ...(filter.playerId !== undefined ? { playerId: filter.playerId } : {}),
    ...(filter.isActive !== undefined ? { isActive: filter.isActive } : {}),
    ...(overallFilter !== undefined ? { overall: overallFilter } : {}),
    ...(filter.cardTypeCode !== undefined
      ? { cardType: { code: filter.cardTypeCode.toUpperCase() } }
      : {}),
    ...(filter.cardRarityCode !== undefined
      ? { cardRarity: { code: filter.cardRarityCode.toUpperCase() } }
      : {}),
  };
}
