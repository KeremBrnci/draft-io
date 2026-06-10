import type { PaginationParams } from '@draft-io/shared-types';
import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';

import type { ExternalProvider } from '../../../../core/external-reference/external-provider';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import type { Player } from '../../domain/entities/player.entity';
import type {
  PlayerListFilter,
  PlayerListSort,
  PlayerRepository,
} from '../../domain/repositories/player.repository';
import type { PlayerId } from '../../domain/value-objects/player-id.vo';
import { toPlayerPositionPersistence } from '../mappers/player-position.mapper';
import { toPlayerDomain, toPlayerPersistence } from '../mappers/player.mapper';

import { toPrismaPlayerOrderBy, toPrismaPlayerWhere } from './player-list-filter.prisma';

const POSITIONS_INCLUDE = {
  positions: {
    orderBy: [
      { isPrimary: 'desc' },
      { createdAt: 'asc' },
    ] satisfies Prisma.PlayerPositionOrderByWithRelationInput[],
  },
} satisfies Prisma.PlayerInclude;

@Injectable()
export class PrismaPlayerRepository implements PlayerRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: PlayerId): Promise<Player | null> {
    const record = await this.prisma.player.findUnique({
      where: { id: id.value },
      include: POSITIONS_INCLUDE,
    });

    return record === null ? null : toPlayerDomain(record);
  }

  async findByExternalReference(
    provider: ExternalProvider,
    externalId: string,
  ): Promise<Player | null> {
    const record = await this.prisma.player.findUnique({
      where: {
        provider_externalId: {
          provider,
          externalId,
        },
      },
      include: POSITIONS_INCLUDE,
    });

    return record === null ? null : toPlayerDomain(record);
  }

  async findAll(): Promise<readonly Player[]> {
    const records = await this.prisma.player.findMany({
      orderBy: { displayName: 'asc' },
      include: POSITIONS_INCLUDE,
    });

    return records.map((record) => toPlayerDomain(record));
  }

  async findPaginated(
    filter: PlayerListFilter,
    sort: PlayerListSort,
    pagination: PaginationParams,
  ): Promise<{ items: readonly Player[]; totalItems: number }> {
    const where = toPrismaPlayerWhere(filter);
    const skip = (pagination.page - 1) * pagination.pageSize;

    const [records, totalItems] = await Promise.all([
      this.prisma.player.findMany({
        where,
        orderBy: toPrismaPlayerOrderBy(sort),
        skip,
        take: pagination.pageSize,
        include: POSITIONS_INCLUDE,
      }),
      this.prisma.player.count({ where }),
    ]);

    return {
      items: records.map((record) => toPlayerDomain(record)),
      totalItems,
    };
  }

  async count(): Promise<number> {
    return this.prisma.player.count();
  }

  async countCreatedSince(since: Date): Promise<number> {
    return this.prisma.player.count({
      where: { createdAt: { gte: since } },
    });
  }

  async save(player: Player): Promise<void> {
    const data = toPlayerPersistence(player);
    const positionRows = player.positions.assignments.map(toPlayerPositionPersistence);

    await this.prisma.$transaction(async (tx) => {
      await tx.player.upsert({
        where: { id: data.id },
        create: data,
        update: {
          provider: data.provider,
          externalId: data.externalId,
          firstName: data.firstName,
          lastName: data.lastName,
          displayName: data.displayName,
          birthDate: data.birthDate,
          nationality: data.nationality,
          countryId: data.countryId,
          teamId: data.teamId,
          leagueId: data.leagueId,
          marketValue: data.marketValue,
          marketValueCurrency: data.marketValueCurrency,
          imageUrl: data.imageUrl,
          status: data.status,
          updatedAt: data.updatedAt,
        },
      });

      await tx.playerPosition.deleteMany({ where: { playerId: data.id } });

      if (positionRows.length > 0) {
        await tx.playerPosition.createMany({ data: positionRows });
      }
    });
  }
}
