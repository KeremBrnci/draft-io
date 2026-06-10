import { describe, expect, it } from 'vitest';

import type { OverallCalculationContext } from '../../domain/models/overall-calculation-context';

import { AgeScoringStrategy } from './age-scoring.strategy';

function context(age: number | null): OverallCalculationContext {
  return {
    playerId: 'player-1',
    positions: [],
    primaryPosition: 'CM',
    secondaryPositions: [],
    age,
    marketValue: 50_000_000,
    nationality: 'Spain',
    leagueExternalId: 'ES1',
    careerScore: 50,
    legacyScore: 0,
    profileTag: null,
    apiOverallHint: null,
  };
}

describe('AgeScoringStrategy', () => {
  const strategy = new AgeScoringStrategy();

  it('scores developing ages lower than peak ages', () => {
    expect(strategy.score(context(19))).toBeLessThan(strategy.score(context(27)));
  });

  it('scores late career ages below peak', () => {
    expect(strategy.score(context(39))).toBeLessThan(strategy.score(context(28)));
  });

  it('returns fallback when age is unknown', () => {
    expect(strategy.score(context(null))).toBe(70);
  });
});
