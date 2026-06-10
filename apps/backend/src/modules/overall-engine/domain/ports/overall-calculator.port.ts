import type { OverallCalculationContext } from '../models/overall-calculation-context';
import type { OverallCalculationResult } from '../models/overall-calculation-result';

/**
 * Facade for the overall engine. Delegates to registered strategies.
 * No implementation in Phase 1 — contract only.
 */
export interface OverallCalculator {
  calculate(context: OverallCalculationContext): OverallCalculationResult;
}

export const OVERALL_CALCULATOR = Symbol('OVERALL_CALCULATOR');
