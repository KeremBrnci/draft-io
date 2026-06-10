import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import type { PlayerMetrics } from '../../domain/entities/player-metrics.entity';
import type {
  PlayerMetricsRepository,
  UpsertPlayerMetricsInput,
} from '../../domain/repositories/player-metrics.repository';
import { toPlayerMetricsDomain } from '../mappers/player-metrics.mapper';

@Injectable()
export class PrismaPlayerMetricsRepository implements PlayerMetricsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByPlayerId(playerId: string): Promise<PlayerMetrics | null> {
    const record = await this.prisma.playerMetrics.findUnique({ where: { playerId } });
    return record === null ? null : toPlayerMetricsDomain(record);
  }

  async upsert(input: UpsertPlayerMetricsInput): Promise<PlayerMetrics> {
    const record = await this.prisma.playerMetrics.upsert({
      where: { playerId: input.playerId },
      create: {
        playerId: input.playerId,
        algorithmVersionId: input.algorithmVersionId,
        marketValueScore: input.marketValueScore,
        careerScore: input.careerScore,
        ageScore: input.ageScore,
        leagueScore: input.leagueScore,
        legacyScore: input.legacyScore,
        profileTag: input.profileTag,
      },
      update: {
        algorithmVersionId: input.algorithmVersionId,
        marketValueScore: input.marketValueScore,
        careerScore: input.careerScore,
        ageScore: input.ageScore,
        leagueScore: input.leagueScore,
        legacyScore: input.legacyScore,
        profileTag: input.profileTag,
      },
    });

    return toPlayerMetricsDomain(record);
  }

  async updateManualInputs(
    playerId: string,
    input: {
      readonly careerScore?: number;
      readonly legacyScore?: number;
      readonly profileTag?: string | null;
    },
  ): Promise<PlayerMetrics> {
    const existing = await this.prisma.playerMetrics.findUnique({ where: { playerId } });

    if (existing === null) {
      throw new Error(`PlayerMetrics not found for player ${playerId}`);
    }

    const record = await this.prisma.playerMetrics.update({
      where: { playerId },
      data: {
        ...(input.careerScore !== undefined ? { careerScore: input.careerScore } : {}),
        ...(input.legacyScore !== undefined ? { legacyScore: input.legacyScore } : {}),
        ...(input.profileTag !== undefined ? { profileTag: input.profileTag } : {}),
      },
    });

    return toPlayerMetricsDomain(record);
  }
}
