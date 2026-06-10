import type { OverallProfileTag } from '../../domain/enums/overall-profile-tag.enum';
import type { OverallCalculationContext } from '../../domain/models/overall-calculation-context';
import type { PlayerMetrics } from '../../domain/entities/player-metrics.entity';
import type { League } from '../../../leagues/domain/entities/league.entity';
import type { Player } from '../../../players/domain/entities/player.entity';

import { resolveProfileInputs } from './legend-profile-resolver.service';

export class OverallContextBuilderService {
  build(
    player: Player,
    league: League | null,
    metrics: PlayerMetrics | null,
  ): OverallCalculationContext {
    const profileInputs = resolveProfileInputs(player.externalReference?.externalId, metrics);

    return {
      playerId: player.id.value,
      positions: player.positions.assignments.map((assignment) => ({
        positionCode: assignment.positionCode,
        isPrimary: assignment.isPrimary,
      })),
      primaryPosition: player.primaryPosition.value,
      secondaryPositions: player.positions.secondaryCodes,
      age: computeAge(player.birthDate?.value ?? null),
      marketValue: player.marketValue?.value ?? null,
      nationality: player.nationality.value,
      leagueExternalId: league?.externalReference?.externalId ?? null,
      careerScore: profileInputs.careerScore,
      legacyScore: profileInputs.legacyScore,
      profileTag: profileInputs.profileTag,
      apiOverallHint: null,
    };
  }
}

function computeAge(birthDate: Date | null): number | null {
  if (birthDate === null) {
    return null;
  }

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age -= 1;
  }

  return age;
}

export function parseProfileTag(value: string | null | undefined): OverallProfileTag | null {
  if (value === null || value === undefined || value.trim().length === 0) {
    return null;
  }

  return value as OverallProfileTag;
}
