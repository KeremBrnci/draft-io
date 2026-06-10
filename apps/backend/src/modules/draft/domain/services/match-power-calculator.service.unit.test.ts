import { describe, expect, it } from 'vitest';

import { DEFAULT_MATCH_POWER_CONFIG } from '../../domain/config/default-draft-balance.config';
import { MatchPowerCalculator } from '../../domain/services/match-power-calculator.service';

describe('MatchPowerCalculator', () => {
  const calculator = new MatchPowerCalculator(DEFAULT_MATCH_POWER_CONFIG);

  it('boosts match power by roughly 5-10% at high chemistry', () => {
    const low = calculator.calculate(89, 10);
    const high = calculator.calculate(87, 30);

    expect(high.matchPower).toBeGreaterThan(low.matchPower);
    expect(high.chemistryMultiplier).toBeGreaterThan(1);
    expect(high.chemistryMultiplier).toBeLessThanOrEqual(1.1);
  });

  it('keeps overall as primary signal in most comparisons', () => {
    const stronger = calculator.calculate(92, 10);
    const weaker = calculator.calculate(87, 33);

    expect(stronger.matchPower).toBeGreaterThan(weaker.matchPower);
  });

  it('allows high chemistry to upset moderate overall gaps', () => {
    const linked = calculator.calculate(87, 30);
    const raw = calculator.calculate(89, 10);

    expect(linked.matchPower).toBeGreaterThan(raw.matchPower);
  });
});
