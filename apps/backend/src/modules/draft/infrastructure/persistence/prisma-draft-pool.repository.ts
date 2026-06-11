import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';

import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import type { DraftPoolCard, DraftPoolQuery } from '../../domain/models/draft-pool-card';
import type { DraftPoolRepository } from '../../domain/repositories/draft-pool.repository';
import { expandDraftEligiblePositionCodes } from '../../domain/services/expand-draft-position-codes';
import { resolvePlayerPresentation } from '../mappers/draft-card-face.mapper';

type DraftPoolRecord = Prisma.CardGetPayload<{
  include: {
    player: {
      include: {
        positions: true;
        league: { select: { name: true; logoUrl: true; externalId: true } };
        team: { select: { name: true; logoUrl: true; externalId: true } };
      };
    };
    cardType: { select: { code: true } };
    cardRarity: { select: { code: true } };
  };
}>;

const cardInclude = {
  player: {
    include: {
      positions: {
        orderBy: [{ isPrimary: 'desc' as const }, { createdAt: 'asc' as const }],
      },
      league: { select: { name: true, logoUrl: true, externalId: true } },
      team: { select: { name: true, logoUrl: true, externalId: true } },
    },
  },
  cardType: { select: { code: true } },
  cardRarity: { select: { code: true } },
} satisfies Prisma.CardInclude;

@Injectable()
export class PrismaDraftPoolRepository implements DraftPoolRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findEligibleCards(query: DraftPoolQuery): Promise<readonly DraftPoolCard[]> {
    const excludeIds = query.excludeCardIds ?? [];
    const overallFilter: Prisma.IntFilter = {};
    const positionCodes = expandDraftEligiblePositionCodes(
      query.positionCodes !== undefined && query.positionCodes.length > 0
        ? query.positionCodes
        : [query.positionCode],
    );

    if (query.minOverall !== undefined) {
      overallFilter.gte = query.minOverall;
    }
    if (query.maxOverall !== undefined) {
      overallFilter.lte = query.maxOverall;
    }

    const excludePlayerIds = query.excludePlayerIds ?? [];

    const leagueIds = query.leagueIds ?? [];
    const where: Prisma.CardWhereInput = {
      isActive: true,
      player: {
        positions: {
          some: {
            positionCode: { in: [...positionCodes] },
          },
        },
        ...(excludePlayerIds.length > 0 ? { id: { notIn: [...excludePlayerIds] } } : {}),
        ...(leagueIds.length > 0 ? { leagueId: { in: [...leagueIds] } } : {}),
      },
    };

    if (excludeIds.length > 0) {
      where.id = { notIn: [...excludeIds] };
    }

    if (Object.keys(overallFilter).length > 0) {
      where.overall = overallFilter;
    }

    const records = await this.prisma.card.findMany({
      where,
      include: cardInclude,
      orderBy: [{ overall: 'desc' }, { createdAt: 'desc' }],
      take: query.limit ?? 200,
    });

    return records.map((record) => this.toDraftPoolCard(record));
  }

  async findByIds(cardIds: readonly string[]): Promise<readonly DraftPoolCard[]> {
    if (cardIds.length === 0) {
      return [];
    }

    const records = await this.prisma.card.findMany({
      where: { id: { in: [...cardIds] } },
      include: cardInclude,
    });

    return records.map((record) => this.toDraftPoolCard(record));
  }

  private toDraftPoolCard(record: DraftPoolRecord): DraftPoolCard {
    const presentation = resolvePlayerPresentation({
      imageUrl: record.player.imageUrl,
      externalId: record.player.externalId,
      nationality: record.player.nationality,
      teamName: record.player.team?.name ?? null,
      teamLogoUrl: record.player.team?.logoUrl ?? null,
      teamExternalId: record.player.team?.externalId ?? null,
      leagueName: record.player.league?.name ?? null,
      leagueLogoUrl: record.player.league?.logoUrl ?? null,
      leagueExternalId: record.player.league?.externalId ?? null,
    });

    return {
      cardId: record.id,
      playerId: record.playerId,
      displayName: record.player.displayName,
      overall: record.overall,
      cardTypeCode: record.cardType.code,
      cardRarityCode: record.cardRarity.code,
      teamId: record.player.teamId,
      leagueId: record.player.leagueId,
      nationality: record.player.nationality,
      imageUrl: presentation.imageUrl,
      nationalityFlagUrl: presentation.nationalityFlagUrl,
      teamName: presentation.teamName,
      teamLogoUrl: presentation.teamLogoUrl,
      leagueName: presentation.leagueName,
      leagueLogoUrl: presentation.leagueLogoUrl,
      positions: record.player.positions.map((position, index) => ({
        positionCode: position.positionCode,
        isPrimary: position.isPrimary,
        sortOrder: index,
      })),
    };
  }
}
