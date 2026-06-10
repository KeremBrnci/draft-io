import type { PaginationParams } from '@draft-io/shared-types';
import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import type { ExternalProvider } from '../../../../core/external-reference/external-provider';
import type { Coach } from '../../domain/entities/coach.entity';
import type {
  CoachListFilter,
  CoachListSort,
  CoachRepository,
} from '../../domain/repositories/coach.repository';
import type { CoachId } from '../../domain/value-objects/coach-id.vo';
import { toCoachDomain, toCoachPersistence } from '../mappers/coach.mapper';
import { toPrismaCoachOrderBy, toPrismaCoachWhere } from './coach-list-filter.prisma';

@Injectable()
export class PrismaCoachRepository implements CoachRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: CoachId): Promise<Coach | null> {
    const record = await this.prisma.coach.findUnique({ where: { id: id.value } });
    return record === null ? null : toCoachDomain(record);
  }

  async findByExternalReference(
    provider: ExternalProvider,
    externalId: string,
  ): Promise<Coach | null> {
    const record = await this.prisma.coach.findUnique({
      where: {
        provider_externalId: {
          provider,
          externalId,
        },
      },
    });

    return record === null ? null : toCoachDomain(record);
  }

  async findPaginated(
    filter: CoachListFilter,
    sort: CoachListSort,
    pagination: PaginationParams,
  ): Promise<{ items: readonly Coach[]; totalItems: number }> {
    const where = toPrismaCoachWhere(filter);
    const skip = (pagination.page - 1) * pagination.pageSize;

    const [records, totalItems] = await Promise.all([
      this.prisma.coach.findMany({
        where,
        orderBy: toPrismaCoachOrderBy(sort),
        skip,
        take: pagination.pageSize,
      }),
      this.prisma.coach.count({ where }),
    ]);

    return {
      items: records.map((record) => toCoachDomain(record)),
      totalItems,
    };
  }

  async save(coach: Coach): Promise<void> {
    const data = toCoachPersistence(coach);

    await this.prisma.coach.upsert({
      where: { id: data.id },
      create: data,
      update: {
        provider: data.provider,
        externalId: data.externalId,
        firstName: data.firstName,
        lastName: data.lastName,
        displayName: data.displayName,
        role: data.role,
        nationality: data.nationality,
        age: data.age,
        birthDate: data.birthDate,
        imageUrl: data.imageUrl,
        appointedDate: data.appointedDate,
        contractExpires: data.contractExpires,
        teamId: data.teamId,
        leagueId: data.leagueId,
        updatedAt: data.updatedAt,
      },
    });
  }
}
