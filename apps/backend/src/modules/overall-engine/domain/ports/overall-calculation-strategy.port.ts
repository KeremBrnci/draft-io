import type { OverallCalculationContext } from '../models/overall-calculation-context';
import type { OverallCalculationResult } from '../models/overall-calculation-result';

/**
 * Pluggable strategy for overall generation.
 * Implementations will be added in a future sprint — no formulas in Phase 1.
 */
export interface OverallCalculationStrategy {
  readonly strategyId: string;
  calculate(context: OverallCalculationContext): OverallCalculationResult;
}

export const OVERALL_CALCULATION_STRATEGY = Symbol('OVERALL_CALCULATION_STRATEGY');
