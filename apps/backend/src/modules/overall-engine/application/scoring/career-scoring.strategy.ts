import { DEFAULT_CAREER_SCORE, type OverallV1Weights } from '../../domain/config/overall-v1.config';
import type { OverallCalculationContext } from '../../domain/models/overall-calculation-context';

import { inferCareerFromMarketValue } from './inferred-score.util';
import { clampScore } from './score-bracket.util';

/**
 * V1 stores career achievements manually on PlayerMetrics when available.
 * Until trophy collection ships, high market value implies stronger career standing.
 */
export class CareerScoringStrategy {
  score(context: OverallCalculationContext): number {
    const inferred = inferCareerFromMarketValue(context.marketValue);
    const stored = context.careerScore > 0 ? context.careerScore : DEFAULT_CAREER_SCORE;

    if (stored > DEFAULT_CAREER_SCORE && stored > inferred) {
      return clampScore(stored);
    }

    return clampScore(Math.max(stored, inferred));
  }

  weight(weights: OverallV1Weights): number {
    return weights.career;
  }
}
