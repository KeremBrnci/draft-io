import {
  DEFAULT_CAREER_SCORE,
  DEFAULT_LEGACY_SCORE,
} from '../../domain/config/overall-v1.config';
import { findLegendPlayerProfile } from '../../domain/config/legend-player-profiles.config';
import type { OverallProfileTag } from '../../domain/enums/overall-profile-tag.enum';
import type { PlayerMetrics } from '../../domain/entities/player-metrics.entity';

export interface ResolvedProfileInputs {
  readonly careerScore: number;
  readonly legacyScore: number;
  readonly profileTag: OverallProfileTag | null;
}

export function resolveProfileInputs(
  externalId: string | null | undefined,
  metrics: PlayerMetrics | null,
): ResolvedProfileInputs {
  const legend = findLegendPlayerProfile(externalId);
  const metricsCareer = metrics?.components.careerScore ?? DEFAULT_CAREER_SCORE;
  const metricsLegacy = metrics?.components.legacyScore ?? DEFAULT_LEGACY_SCORE;
  const metricsTag = metrics?.profileTag ?? null;

  if (legend === null) {
    return {
      careerScore: metricsCareer,
      legacyScore: metricsLegacy,
      profileTag: metricsTag,
    };
  }

  return {
    careerScore: Math.max(legend.careerScore, metricsCareer),
    legacyScore: Math.max(legend.legacyScore, metricsLegacy),
    profileTag: metricsTag ?? legend.profileTag,
  };
}
