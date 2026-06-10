import {
  MARKET_VALUE_BRACKETS,
  type OverallV1Weights,
} from '../../domain/config/overall-v1.config';
import type { OverallCalculationContext } from '../../domain/models/overall-calculation-context';

import { clampScore, scoreFromBrackets } from './score-bracket.util';

export class MarketValueScoringStrategy {
  score(context: OverallCalculationContext): number {
    if (context.marketValue === null || context.marketValue <= 0) {
      return MARKET_VALUE_BRACKETS[0]?.score ?? 35;
    }

    return clampScore(scoreFromBrackets(context.marketValue, MARKET_VALUE_BRACKETS));
  }

  weight(weights: OverallV1Weights): number {
    return weights.marketValue;
  }
}
