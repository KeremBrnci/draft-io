import { AGE_SCORE_BRACKETS, type OverallV1Weights } from '../../domain/config/overall-v1.config';
import type { OverallCalculationContext } from '../../domain/models/overall-calculation-context';

import { clampScore, scoreFromBrackets } from './score-bracket.util';

export class AgeScoringStrategy {
  score(context: OverallCalculationContext): number {
    if (context.age === null) {
      return 70;
    }

    if (context.age >= 40) {
      return 40;
    }

    return clampScore(scoreFromBrackets(context.age, AGE_SCORE_BRACKETS));
  }

  weight(weights: OverallV1Weights): number {
    return weights.age;
  }
}
