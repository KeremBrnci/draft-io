import type { PaginationParams } from '@draft-io/shared-types';
import {
  translateLeagueName,
  translateNationality,
  translatePositionCode,
} from '@draft-io/shared-utils';
import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';

import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import {
  DataQualityIssueCode,
  type DataQualityIssueCode as DataQualityIssueCodeType,
} from '../../domain/enums/data-quality-issue-code';
import type {
  DataQualityIssue,
  DataQualityIssuesFilter,
  DataQualityIssuesPage,
  DataQualityRepository,
  DataQualitySummary,
} from '../../domain/repositories/data-quality.repository';
import {
  hasValidPlayerPosition,
  isValidStoredMarketValue,
} from '../../domain/services/market-value-validation';

@Injectable()
export class PrismaDataQualityRepository implements DataQualityRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary(): Promise<DataQualitySummary> {
    const [
      totalPlayers,
      totalClubs,
      totalCompetitions,
      playersWithMarketValue,
      playersWithImage,
      playersWithAge,
      playersWithPosition,
      byCompetition,
      byPosition,
      byNationality,
      marketBuckets,
      ageBuckets,
    ] = await Promise.all([
      this.prisma.player.count(),
      this.prisma.team.count(),
      this.prisma.league.count(),
      this.prisma.player.count({ where: { marketValue: { not: null } } }),
      this.prisma.player.count({ where: { imageUrl: { not: null } } }),
      this.prisma.player.count({ where: { birthDate: { not: null } } }),
      this.prisma.player.count({
        where: {
          positions: {
            some: {
              isPrimary: true,
              positionCode: { notIn: ['', 'UNK', 'UNKNOWN'] },
            },
          },
        },
      }),
      this.prisma.player.groupBy({
        by: ['leagueId'],
        _count: { _all: true },
        where: { leagueId: { not: null } },
      }),
      this.prisma.playerPosition.groupBy({
        by: ['positionCode'],
        where: { isPrimary: true },
        _count: { _all: true },
        orderBy: { _count: { positionCode: 'desc' } },
        take: 20,
      }),
      this.prisma.player.groupBy({
        by: ['nationality'],
        _count: { _all: true },
        orderBy: { _count: { nationality: 'desc' } },
      }),
      this.marketValueDistribution(),
      this.ageDistribution(),
    ]);

    const leagueIds = byCompetition
      .map((row) => row.leagueId)
      .filter((id): id is string => id !== null);
    const leagues =
      leagueIds.length > 0
        ? await this.prisma.league.findMany({
            where: { id: { in: leagueIds } },
            select: { id: true, name: true, externalId: true },
          })
        : [];
    const leagueNames = new Map(
      leagues.map((league) => [
        league.id,
        translateLeagueName(league.name, league.externalId),
      ]),
    );

    return {
      totalPlayers,
      totalClubs,
      totalCompetitions,
      playersWithMarketValue,
      playersWithoutMarketValue: totalPlayers - playersWithMarketValue,
      playersWithImage,
      playersWithoutImage: totalPlayers - playersWithImage,
      playersWithPosition,
      playersWithoutPosition: totalPlayers - playersWithPosition,
      playersWithAge,
      playersWithoutAge: totalPlayers - playersWithAge,
      playersByCompetition: byCompetition.map((row) => ({
        leagueName: leagueNames.get(row.leagueId ?? '') ?? 'Bilinmiyor',
        count: row._count._all,
      })),
      playersByPosition: byPosition.map((row) => ({
        position: translatePositionCode(row.positionCode, { long: true }),
        count: row._count._all,
      })),
      playersByNationality: byNationality.map((row) => ({
        nationality: translateNationality(row.nationality),
        count: row._count._all,
      })),
      marketValueDistribution: marketBuckets,
      ageDistribution: ageBuckets,
    };
  }

  async findIssues(
    filter: DataQualityIssuesFilter,
    pagination: PaginationParams,
  ): Promise<DataQualityIssuesPage> {
    const players = await this.prisma.player.findMany({
      select: {
        id: true,
        displayName: true,
        provider: true,
        externalId: true,
        birthDate: true,
        positions: {
          where: { isPrimary: true },
          take: 1,
          select: { positionCode: true },
        },
        marketValue: true,
        imageUrl: true,
        teamId: true,
        leagueId: true,
      },
      orderBy: { displayName: 'asc' },
    });

    const duplicateKeys = await this.findDuplicateProviderKeys();

    const issues: DataQualityIssue[] = [];

    for (const player of players) {
      const codes = this.evaluatePlayerIssues(player, duplicateKeys);

      if (codes.length === 0) {
        continue;
      }

      if (filter.issueCode !== undefined && !codes.includes(filter.issueCode)) {
        continue;
      }

      issues.push({
        playerId: player.id,
        displayName: player.displayName,
        issueCodes: codes,
      });
    }

    const skip = (pagination.page - 1) * pagination.pageSize;
    const items = issues.slice(skip, skip + pagination.pageSize);

    return { items, totalItems: issues.length };
  }

  private evaluatePlayerIssues(
    player: {
      id: string;
      provider: string | null;
      externalId: string | null;
      birthDate: Date | null;
      positions: readonly { positionCode: string }[];
      marketValue: Prisma.Decimal | null;
      imageUrl: string | null;
      teamId: string | null;
      leagueId: string | null;
    },
    duplicateKeys: ReadonlySet<string>,
  ): DataQualityIssueCodeType[] {
    const codes: DataQualityIssueCodeType[] = [];
    const marketValue =
      player.marketValue === null ? null : Number(player.marketValue.toString());

    if (player.marketValue === null) {
      codes.push(DataQualityIssueCode.MISSING_MARKET_VALUE);
    } else if (!isValidStoredMarketValue(marketValue)) {
      codes.push(DataQualityIssueCode.INVALID_MARKET_VALUE);
    }

    const primaryPosition = player.positions[0]?.positionCode ?? '';

    if (!hasValidPlayerPosition(primaryPosition)) {
      codes.push(DataQualityIssueCode.MISSING_POSITION);
    }

    if (player.birthDate === null) {
      codes.push(DataQualityIssueCode.MISSING_AGE);
    }

    if (player.imageUrl === null || player.imageUrl.trim().length === 0) {
      codes.push(DataQualityIssueCode.MISSING_IMAGE);
    }

    if (player.teamId === null) {
      codes.push(DataQualityIssueCode.MISSING_CLUB);
    }

    if (player.leagueId === null) {
      codes.push(DataQualityIssueCode.MISSING_COMPETITION);
    }

    if (
      player.provider !== null &&
      player.externalId !== null &&
      duplicateKeys.has(`${player.provider}:${player.externalId}`)
    ) {
      codes.push(DataQualityIssueCode.DUPLICATE_PROVIDER_EXTERNAL_ID);
    }

    return codes;
  }

  private async findDuplicateProviderKeys(): Promise<ReadonlySet<string>> {
    const rows = await this.prisma.$queryRaw<
      readonly { provider: string; external_id: string }[]
    >`
      SELECT provider, external_id
      FROM players
      WHERE provider IS NOT NULL AND external_id IS NOT NULL
      GROUP BY provider, external_id
      HAVING COUNT(*) > 1
    `;

    return new Set(rows.map((row) => `${row.provider}:${row.external_id}`));
  }

  private async marketValueDistribution(): Promise<
    readonly { bucket: string; count: number }[]
  > {
    const buckets = [
      { label: '0', min: 0, max: 0 },
      { label: '1-1M', min: 1, max: 1_000_000 },
      { label: '1M-10M', min: 1_000_001, max: 10_000_000 },
      { label: '10M-50M', min: 10_000_001, max: 50_000_000 },
      { label: '50M+', min: 50_000_001, max: Number.MAX_SAFE_INTEGER },
    ] as const;

    const results: { bucket: string; count: number }[] = [];

    for (const bucket of buckets) {
      const count = await this.prisma.player.count({
        where: {
          marketValue: {
            gte: bucket.min,
            lte: bucket.max,
          },
        },
      });
      results.push({ bucket: bucket.label, count });
    }

    return results;
  }

  private async ageDistribution(): Promise<readonly { bucket: string; count: number }[]> {
    const today = new Date();
    const ranges = [
      { label: '15-20', min: 15, max: 20 },
      { label: '21-25', min: 21, max: 25 },
      { label: '26-30', min: 26, max: 30 },
      { label: '31-35', min: 31, max: 35 },
      { label: '36+', min: 36, max: 50 },
    ] as const;

    const results: { bucket: string; count: number }[] = [];

    for (const range of ranges) {
      const youngest = new Date(today);
      youngest.setFullYear(youngest.getFullYear() - range.min);
      const oldest = new Date(today);
      oldest.setFullYear(oldest.getFullYear() - range.max);

      const count = await this.prisma.player.count({
        where: {
          birthDate: {
            gte: oldest,
            lte: youngest,
          },
        },
      });

      results.push({ bucket: range.label, count });
    }

    const unknown = await this.prisma.player.count({ where: { birthDate: null } });
    return [...results, { bucket: 'Bilinmiyor', count: unknown }];
  }
}
