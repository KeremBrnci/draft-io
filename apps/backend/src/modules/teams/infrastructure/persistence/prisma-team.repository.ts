import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import type { ExternalProvider } from '../../../../core/external-reference/external-provider';
import type { Team } from '../../domain/entities/team.entity';
import type { TeamRepository } from '../../domain/repositories/team.repository';
import type { TeamId } from '../../domain/value-objects/team-id.vo';
import { toTeamDomain, toTeamPersistence } from '../mappers/team.mapper';

@Injectable()
export class PrismaTeamRepository implements TeamRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: TeamId): Promise<Team | null> {
    const record = await this.prisma.team.findUnique({ where: { id: id.value } });
    return record === null ? null : toTeamDomain(record);
  }

  async findByExternalReference(
    provider: ExternalProvider,
    externalId: string,
  ): Promise<Team | null> {
    const record = await this.prisma.team.findUnique({
      where: { provider_externalId: { provider, externalId } },
    });

    return record === null ? null : toTeamDomain(record);
  }

  async findByLeagueId(leagueId: string): Promise<readonly Team[]> {
    const records = await this.prisma.team.findMany({
      where: { leagueId },
      orderBy: { name: 'asc' },
    });

    return records.map((record) => toTeamDomain(record));
  }

  async findAll(): Promise<readonly Team[]> {
    const records = await this.prisma.team.findMany({ orderBy: { name: 'asc' } });
    return records.map((record) => toTeamDomain(record));
  }

  async count(): Promise<number> {
    return this.prisma.team.count();
  }

  async save(team: Team): Promise<void> {
    const data = toTeamPersistence(team);

    await this.prisma.team.upsert({
      where: { id: data.id },
      create: data,
      update: {
        provider: data.provider,
        externalId: data.externalId,
        name: data.name,
        shortName: data.shortName,
        countryId: data.countryId,
        leagueId: data.leagueId,
        country: data.country,
        logoUrl: data.logoUrl,
        formationCode: data.formationCode,
        manager: data.manager,
        startingEleven: data.startingEleven,
        chemistryScore: data.chemistryScore,
        teamOverall: data.teamOverall,
        updatedAt: data.updatedAt,
      },
    });
  }
}
