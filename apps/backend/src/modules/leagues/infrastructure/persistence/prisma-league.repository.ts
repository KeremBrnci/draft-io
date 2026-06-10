import { Injectable } from '@nestjs/common';

import type { ExternalProvider } from '../../../../core/external-reference/external-provider';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import type { League } from '../../domain/entities/league.entity';
import type { LeagueRepository } from '../../domain/repositories/league.repository';
import type { LeagueId } from '../../domain/value-objects/league-id.vo';
import { toLeagueDomain, toLeaguePersistence } from '../mappers/league.mapper';

@Injectable()
export class PrismaLeagueRepository implements LeagueRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: LeagueId): Promise<League | null> {
    const record = await this.prisma.league.findUnique({ where: { id: id.value } });
    return record === null ? null : toLeagueDomain(record);
  }

  async findByExternalReference(
    provider: ExternalProvider,
    externalId: string,
  ): Promise<League | null> {
    const record = await this.prisma.league.findUnique({
      where: { provider_externalId: { provider, externalId } },
    });

    return record === null ? null : toLeagueDomain(record);
  }

  async findAll(): Promise<readonly League[]> {
    const records = await this.prisma.league.findMany({ orderBy: { name: 'asc' } });
    return records.map((record) => toLeagueDomain(record));
  }

  async count(): Promise<number> {
    return this.prisma.league.count();
  }

  async save(league: League): Promise<void> {
    const data = toLeaguePersistence(league);

    await this.prisma.league.upsert({
      where: { id: data.id },
      create: data,
      update: {
        provider: data.provider,
        externalId: data.externalId,
        slug: data.slug,
        name: data.name,
        countryId: data.countryId,
        country: data.country,
        logoUrl: data.logoUrl,
        updatedAt: data.updatedAt,
      },
    });
  }
}
