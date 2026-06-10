import { expandPositionFilterCodes } from '@draft-io/shared-utils';
import type { Prisma } from '@prisma/client';

import type { PlayerListFilter, PlayerListSort } from '../../domain/repositories/player.repository';

const INVALID_POSITION_CODES = ['', 'UNK', 'UNKNOWN'] as const;

function birthDateRangeFromAge(
  minAge?: number,
  maxAge?: number,
): Prisma.DateTimeNullableFilter | undefined {
  if (minAge === undefined && maxAge === undefined) {
    return undefined;
  }

  const today = new Date();
  const filter: Prisma.DateTimeNullableFilter = {};

  if (maxAge !== undefined) {
    const oldest = new Date(today);
    oldest.setFullYear(oldest.getFullYear() - maxAge);
    filter.gte = oldest;
  }

  if (minAge !== undefined) {
    const youngest = new Date(today);
    youngest.setFullYear(youngest.getFullYear() - minAge);
    filter.lte = youngest;
  }

  return filter;
}

function positionSomeFilter(positionCode: string, isPrimary?: boolean): Prisma.PlayerWhereInput {
  const matchCodes = expandPositionFilterCodes(positionCode);

  if (matchCodes.length <= 1) {
    return {
      positions: {
        some: {
          positionCode: matchCodes[0] ?? positionCode,
          ...(isPrimary !== undefined ? { isPrimary } : {}),
        },
      },
    };
  }

  return {
    positions: {
      some: {
        positionCode: { in: [...matchCodes] },
        ...(isPrimary !== undefined ? { isPrimary } : {}),
      },
    },
  };
}

export function toPrismaPlayerWhere(filter: PlayerListFilter): Prisma.PlayerWhereInput {
  const birthDateFilter = birthDateRangeFromAge(filter.minAge, filter.maxAge);
  const marketValueFilter: Prisma.DecimalNullableFilter | undefined =
    filter.minMarketValue !== undefined || filter.maxMarketValue !== undefined
      ? {
          ...(filter.minMarketValue !== undefined ? { gte: filter.minMarketValue } : {}),
          ...(filter.maxMarketValue !== undefined ? { lte: filter.maxMarketValue } : {}),
        }
      : undefined;

  return {
    ...(filter.name !== undefined && filter.name.length > 0
      ? {
          OR: [
            { displayName: { contains: filter.name, mode: 'insensitive' } },
            { firstName: { contains: filter.name, mode: 'insensitive' } },
            { lastName: { contains: filter.name, mode: 'insensitive' } },
          ],
        }
      : {}),
    ...(filter.position !== undefined ? positionSomeFilter(filter.position) : {}),
    ...(filter.primaryPosition !== undefined
      ? positionSomeFilter(filter.primaryPosition, true)
      : {}),
    ...(filter.secondaryPosition !== undefined
      ? positionSomeFilter(filter.secondaryPosition, false)
      : {}),
    ...(filter.teamId !== undefined ? { teamId: filter.teamId } : {}),
    ...(filter.leagueId !== undefined ? { leagueId: filter.leagueId } : {}),
    ...(filter.nationality !== undefined
      ? { nationality: { contains: filter.nationality, mode: 'insensitive' } }
      : {}),
    ...(birthDateFilter !== undefined ? { birthDate: birthDateFilter } : {}),
    ...(marketValueFilter !== undefined ? { marketValue: marketValueFilter } : {}),
    ...(filter.hasImage === true ? { imageUrl: { not: null } } : {}),
    ...(filter.hasImage === false ? { imageUrl: null } : {}),
    ...(filter.hasMarketValue === true ? { marketValue: { not: null } } : {}),
    ...(filter.hasMarketValue === false ? { marketValue: null } : {}),
    ...(filter.hasAge === true ? { birthDate: { not: null } } : {}),
    ...(filter.hasAge === false ? { birthDate: null } : {}),
    ...(filter.hasPosition === true
      ? {
          positions: {
            some: {
              positionCode: { notIn: [...INVALID_POSITION_CODES] },
            },
          },
        }
      : {}),
    ...(filter.hasPosition === false
      ? {
          OR: [
            { positions: { none: {} } },
            {
              positions: {
                every: {
                  positionCode: { in: [...INVALID_POSITION_CODES] },
                },
              },
            },
          ],
        }
      : {}),
    ...(filter.hasMultiplePositions === true
      ? {
          positions: {
            some: {},
          },
          AND: {
            positions: {
              some: {
                isPrimary: false,
              },
            },
          },
        }
      : {}),
  };
}

export function toPrismaPlayerOrderBy(sort: PlayerListSort): Prisma.PlayerOrderByWithRelationInput {
  if (sort.field === 'marketValue') {
    return { marketValue: sort.direction };
  }

  if (sort.field === 'age') {
    return { birthDate: sort.direction === 'asc' ? 'desc' : 'asc' };
  }

  if (sort.field === 'createdAt') {
    return { createdAt: sort.direction };
  }

  if (sort.field === 'updatedAt') {
    return { updatedAt: sort.direction };
  }

  return { displayName: sort.direction };
}
