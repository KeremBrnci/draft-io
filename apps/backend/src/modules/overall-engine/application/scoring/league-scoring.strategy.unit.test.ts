import { describe, expect, it } from 'vitest';

import type { OverallCalculationContext } from '../../domain/models/overall-calculation-context';

import { LeagueScoringStrategy } from './league-scoring.strategy';

function context(leagueExternalId: string | null): OverallCalculationContext {
  return {
    playerId: 'player-1',
    positions: [],
    primaryPosition: 'CM',
    secondaryPositions: [],
    age: 25,
    marketValue: 50_000_000,
    nationality: 'Spain',
    leagueExternalId,
    careerScore: 50,
    legacyScore: 0,
    profileTag: null,
    apiOverallHint: null,
  };
}

describe('LeagueScoringStrategy', () => {
  const strategy = new LeagueScoringStrategy();

  it('scores tier-1 leagues higher than tier-2 leagues', () => {
    expect(strategy.score(context('GB1'))).toBeGreaterThan(strategy.score(context('TR1')));
  });

  it('returns no-league fallback when league is missing', () => {
    expect(strategy.score(context(null))).toBe(40);
  });
});
