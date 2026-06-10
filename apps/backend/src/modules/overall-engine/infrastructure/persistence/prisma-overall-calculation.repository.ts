import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import type { OverallCalculation } from '../../domain/entities/overall-calculation.entity';
import type {
  CreateOverallCalculationInput,
  OverallCalculationRepository,
} from '../../domain/repositories/overall-calculation.repository';
import { toOverallCalculationDomain } from '../mappers/overall-calculation.mapper';

@Injectable()
export class PrismaOverallCalculationRepository implements OverallCalculationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateOverallCalculationInput): Promise<OverallCalculation> {
    const record = await this.prisma.overallCalculation.create({
      data: {
        playerId: input.playerId,
        algorithmVersionId: input.algorithmVersionId,
        marketValueScore: input.marketValueScore,
        careerScore: input.careerScore,
        ageScore: input.ageScore,
        leagueScore: input.leagueScore,
        legacyScore: input.legacyScore,
        rawScore: input.rawScore,
        finalOverall: input.finalOverall,
        profileTag: input.profileTag,
        appliedFloor: input.appliedFloor,
        appliedCeiling: input.appliedCeiling,
      },
    });

    return toOverallCalculationDomain(record);
  }

  async findHistoryByPlayerId(playerId: string): Promise<readonly OverallCalculation[]> {
    const records = await this.prisma.overallCalculation.findMany({
      where: { playerId },
      orderBy: { createdAt: 'desc' },
    });

    return records.map(toOverallCalculationDomain);
  }
}
