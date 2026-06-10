import { OVERALL_V1_CALIBRATION, OVERALL_V1_WEIGHTS } from '../../domain/config/overall-v1.config';
import { OVERALL_ALGORITHM_V1 } from '../../domain/enums/overall-algorithm-version.enum';
import type { OverallCalculationContext } from '../../domain/models/overall-calculation-context';
import type { OverallCalculationResult } from '../../domain/models/overall-calculation-result';
import type { OverallCalculationStrategy } from '../../domain/ports/overall-calculation-strategy.port';
import type { OverallCalculator } from '../../domain/ports/overall-calculator.port';
import { AgeScoringStrategy } from '../scoring/age-scoring.strategy';
import { CareerScoringStrategy } from '../scoring/career-scoring.strategy';
import { LeagueScoringStrategy } from '../scoring/league-scoring.strategy';
import { LegacyScoringStrategy } from '../scoring/legacy-scoring.strategy';
import { MarketValueScoringStrategy } from '../scoring/market-value-scoring.strategy';

import { OverallFloorCeilingService } from './overall-floor-ceiling.service';

export class OverallCalculatorV1 implements OverallCalculator, OverallCalculationStrategy {
  readonly strategyId = OVERALL_ALGORITHM_V1;

  private readonly marketValueStrategy = new MarketValueScoringStrategy();
  private readonly careerStrategy = new CareerScoringStrategy();
  private readonly ageStrategy = new AgeScoringStrategy();
  private readonly leagueStrategy = new LeagueScoringStrategy();
  private readonly legacyStrategy = new LegacyScoringStrategy();
  private readonly floorCeilingService = new OverallFloorCeilingService();

  calculate(context: OverallCalculationContext): OverallCalculationResult {
    const components = {
      marketValueScore: this.marketValueStrategy.score(context),
      careerScore: this.careerStrategy.score(context),
      ageScore: this.ageStrategy.score(context),
      leagueScore: this.leagueStrategy.score(context),
      legacyScore: this.legacyStrategy.score(context),
    };

    const rawScore =
      components.marketValueScore * OVERALL_V1_WEIGHTS.marketValue +
      components.careerScore * OVERALL_V1_WEIGHTS.career +
      components.ageScore * OVERALL_V1_WEIGHTS.age +
      components.leagueScore * OVERALL_V1_WEIGHTS.league +
      components.legacyScore * OVERALL_V1_WEIGHTS.legacy;

    const calibratedOverall =
      OVERALL_V1_CALIBRATION.intercept + rawScore * OVERALL_V1_CALIBRATION.slope;

    const bounded = this.floorCeilingService.apply(
      calibratedOverall,
      context.profileTag,
      context.marketValue,
      context.age,
    );

    return {
      algorithmVersion: OVERALL_ALGORITHM_V1,
      components,
      rawScore: round2(rawScore),
      finalOverall: bounded.finalOverall,
      profileTag: context.profileTag,
      appliedFloor: bounded.appliedFloor,
      appliedCeiling: bounded.appliedCeiling,
      overall: bounded.finalOverall,
    };
  }
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
