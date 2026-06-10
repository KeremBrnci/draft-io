import { DEFAULT_LEGACY_SCORE, type OverallV1Weights } from '../../domain/config/overall-v1.config';
import type { OverallCalculationContext } from '../../domain/models/overall-calculation-context';

import { inferLegacyFromProfile } from './inferred-score.util';
import { clampScore } from './score-bracket.util';

/**
 * V1 stores legacy modifiers manually on PlayerMetrics.
 * Until trophy data ships, reputation is inferred from market value and veteran status.
 */
export class LegacyScoringStrategy {
  score(context: OverallCalculationContext): number {
    const inferred = inferLegacyFromProfile(context.marketValue, context.age);
    const stored = context.legacyScore > 0 ? context.legacyScore : DEFAULT_LEGACY_SCORE;

    if (stored > DEFAULT_LEGACY_SCORE && stored > inferred) {
      return clampScore(stored);
    }

    return clampScore(Math.max(stored, inferred));
  }

  weight(weights: OverallV1Weights): number {
    return weights.legacy;
  }
}
