import { OverallCalculationNotImplementedError } from '../../domain/errors/overall-engine.errors';
import type { OverallCalculationContext } from '../../domain/models/overall-calculation-context';
import type { OverallCalculationResult } from '../../domain/models/overall-calculation-result';
import type { OverallCalculator } from '../../domain/ports/overall-calculator.port';

/**
 * Placeholder calculator — throws until a strategy is implemented.
 * Import pipeline must inject a fallback overall from application policy until engine ships.
 */
export class StubOverallCalculator implements OverallCalculator {
  calculate(context: OverallCalculationContext): OverallCalculationResult {
    void context;
    throw new OverallCalculationNotImplementedError();
  }
}
