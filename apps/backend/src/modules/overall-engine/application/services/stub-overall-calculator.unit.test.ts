import { describe, expect, it } from 'vitest';

import { OverallCalculationNotImplementedError } from '../../domain/errors/overall-engine.errors';

import { StubOverallCalculator } from './stub-overall-calculator';

describe('StubOverallCalculator', () => {
  it('throws not implemented — engine has no algorithm yet', () => {
    const calculator = new StubOverallCalculator();

    expect(() =>
      calculator.calculate({
        playerId: 'id',
        positions: [{ positionCode: 'ST', isPrimary: true }],
        primaryPosition: 'ST',
        secondaryPositions: [],
        age: 25,
        marketValue: 1_000_000,
        nationality: 'US',
        leagueExternalId: 'GB1',
        careerScore: 50,
        legacyScore: 0,
        profileTag: null,
        apiOverallHint: 88,
      }),
    ).toThrow(OverallCalculationNotImplementedError);
  });
});
