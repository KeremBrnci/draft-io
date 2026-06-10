import { describe, expect, it } from 'vitest';

import type { OverallCalculationContext } from '../../domain/models/overall-calculation-context';

import { MarketValueScoringStrategy } from './market-value-scoring.strategy';

function context(marketValue: number | null): OverallCalculationContext {
  return {
    playerId: 'player-1',
    positions: [],
    primaryPosition: 'CM',
    secondaryPositions: [],
    age: 25,
    marketValue,
    nationality: 'Spain',
    leagueExternalId: 'ES1',
    careerScore: 50,
    legacyScore: 0,
    profileTag: null,
    apiOverallHint: null,
  };
}

describe('MarketValueScoringStrategy', () => {
  const strategy = new MarketValueScoringStrategy();

  it('returns baseline score when market value is missing', () => {
    expect(strategy.score(context(null))).toBe(38);
  });

  it('maps high market values into upper band', () => {
    expect(strategy.score(context(120_000_000))).toBeGreaterThanOrEqual(89);
  });

  it('maps moderate market values into mid band', () => {
    const score = strategy.score(context(25_000_000));
    expect(score).toBeGreaterThanOrEqual(70);
    expect(score).toBeLessThanOrEqual(80);
  });
});
