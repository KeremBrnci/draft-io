import type { OverallCalculation as PrismaOverallCalculation } from '@prisma/client';

import { OverallCalculation } from '../../domain/entities/overall-calculation.entity';
import type { OverallProfileTag } from '../../domain/enums/overall-profile-tag.enum';
import { OverallCalculationId } from '../../domain/value-objects/overall-calculation-id.vo';

export function toOverallCalculationDomain(record: PrismaOverallCalculation): OverallCalculation {
  return OverallCalculation.reconstitute({
    id: OverallCalculationId.create(record.id),
    playerId: record.playerId,
    algorithmVersionId: record.algorithmVersionId,
    components: {
      marketValueScore: Number(record.marketValueScore),
      careerScore: Number(record.careerScore),
      ageScore: Number(record.ageScore),
      leagueScore: Number(record.leagueScore),
      legacyScore: Number(record.legacyScore),
    },
    rawScore: Number(record.rawScore),
    finalOverall: record.finalOverall,
    profileTag: record.profileTag as OverallProfileTag | null,
    appliedFloor: record.appliedFloor,
    appliedCeiling: record.appliedCeiling,
    createdAt: record.createdAt,
  });
}
