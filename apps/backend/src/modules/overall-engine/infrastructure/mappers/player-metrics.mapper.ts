import type { PlayerMetrics as PrismaPlayerMetrics } from '@prisma/client';

import { PlayerMetrics } from '../../domain/entities/player-metrics.entity';
import type { OverallProfileTag } from '../../domain/enums/overall-profile-tag.enum';
import { PlayerMetricsId } from '../../domain/value-objects/player-metrics-id.vo';

export function toPlayerMetricsDomain(record: PrismaPlayerMetrics): PlayerMetrics {
  return PlayerMetrics.reconstitute({
    id: PlayerMetricsId.create(record.id),
    playerId: record.playerId,
    algorithmVersionId: record.algorithmVersionId,
    components: {
      marketValueScore: decimalToNumber(record.marketValueScore),
      careerScore: decimalToNumber(record.careerScore),
      ageScore: decimalToNumber(record.ageScore),
      leagueScore: decimalToNumber(record.leagueScore),
      legacyScore: decimalToNumber(record.legacyScore),
    },
    profileTag: record.profileTag as OverallProfileTag | null,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  });
}

function decimalToNumber(value: PrismaPlayerMetrics['marketValueScore']): number {
  return Number(value);
}
