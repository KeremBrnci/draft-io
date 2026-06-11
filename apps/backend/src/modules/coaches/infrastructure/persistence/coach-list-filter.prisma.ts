import type { Prisma } from '@prisma/client';

import type { CoachListFilter, CoachListSort } from '../../domain/repositories/coach.repository';

export function toPrismaCoachWhere(filter: CoachListFilter): Prisma.CoachWhereInput {
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
    ...(filter.role !== undefined && filter.role.length > 0
      ? { role: { equals: filter.role, mode: 'insensitive' } }
      : {}),
    ...(filter.teamId !== undefined ? { teamId: filter.teamId } : {}),
    ...(filter.leagueId !== undefined ? { leagueId: filter.leagueId } : {}),
    ...(filter.leagueIds !== undefined && filter.leagueIds.length > 0
      ? { leagueId: { in: [...filter.leagueIds] } }
      : {}),
    ...(filter.nationality !== undefined
      ? { nationality: { contains: filter.nationality, mode: 'insensitive' } }
      : {}),
    ...(filter.hasImage === true ? { imageUrl: { not: null } } : {}),
    ...(filter.hasImage === false ? { imageUrl: null } : {}),
    ...(filter.hasAge === true ? { age: { not: null } } : {}),
    ...(filter.hasAge === false ? { age: null } : {}),
  };
}

export function toPrismaCoachOrderBy(sort: CoachListSort): Prisma.CoachOrderByWithRelationInput {
  if (sort.field === 'age') {
    return { age: sort.direction };
  }

  if (sort.field === 'appointedDate') {
    return { appointedDate: sort.direction };
  }

  if (sort.field === 'createdAt') {
    return { createdAt: sort.direction };
  }

  if (sort.field === 'updatedAt') {
    return { updatedAt: sort.direction };
  }

  return { displayName: sort.direction };
}
