import {
  DEFAULT_LEAGUE_SCORE,
  LEAGUE_TIER_SCORES,
  NO_LEAGUE_SCORE,
  type OverallV1Weights,
} from '../../domain/config/overall-v1.config';
import type { OverallCalculationContext } from '../../domain/models/overall-calculation-context';

import { starLeagueFloorFromMarketValue } from './inferred-score.util';
import { clampScore } from './score-bracket.util';

export class LeagueScoringStrategy {
  score(context: OverallCalculationContext): number {
    if (context.leagueExternalId === null || context.leagueExternalId.trim().length === 0) {
      return NO_LEAGUE_SCORE;
    }

    const tierScore = LEAGUE_TIER_SCORES[context.leagueExternalId.toUpperCase()] ?? DEFAULT_LEAGUE_SCORE;
    const starFloor = starLeagueFloorFromMarketValue(context.marketValue);

    if (starFloor !== null) {
      return clampScore(Math.max(tierScore, starFloor));
    }

    return clampScore(tierScore);
  }

  weight(weights: OverallV1Weights): number {
    return weights.league;
  }
}
