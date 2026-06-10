import { describe, expect, it } from 'vitest';

import { OverallProfileTag } from '../../domain/enums/overall-profile-tag.enum';
import type { OverallCalculationContext } from '../../domain/models/overall-calculation-context';

import { OverallCalculatorV1 } from './overall-calculator-v1.service';
import { OverallFloorCeilingService } from './overall-floor-ceiling.service';

function buildContext(overrides: Partial<OverallCalculationContext>): OverallCalculationContext {
  return {
    playerId: 'player-1',
    positions: [{ positionCode: 'CM', isPrimary: true }],
    primaryPosition: 'CM',
    secondaryPositions: [],
    age: 25,
    marketValue: 50_000_000,
    nationality: 'Spain',
    leagueExternalId: 'ES1',
    careerScore: 50,
    legacyScore: 0,
    profileTag: null,
    apiOverallHint: null,
    ...overrides,
  };
}

describe('OverallCalculatorV1', () => {
  const calculator = new OverallCalculatorV1();

  it('returns weighted component breakdown and calibrated overall', () => {
    const result = calculator.calculate(buildContext({}));

    expect(result.algorithmVersion).toBe('V1');
    expect(result.components.marketValueScore).toBeGreaterThan(0);
    expect(result.rawScore).toBeGreaterThan(0);
    expect(result.finalOverall).toBeGreaterThanOrEqual(1);
    expect(result.finalOverall).toBeLessThanOrEqual(99);
    expect(result.overall).toBe(result.finalOverall);
  });

  it('applies legend floor for aging elite profiles', () => {
    const floorService = new OverallFloorCeilingService();
    const bounded = floorService.apply(80, OverallProfileTag.LEGEND_ACTIVE_OLD);

    expect(bounded.finalOverall).toBe(85);
    expect(bounded.appliedFloor).toBe(85);
  });

  it('applies young superstar ceiling', () => {
    const floorService = new OverallFloorCeilingService();
    const bounded = floorService.apply(92, OverallProfileTag.YOUNG_SUPERSTAR);

    expect(bounded.finalOverall).toBe(89);
    expect(bounded.appliedCeiling).toBe(89);
  });
});

describe('OverallCalculatorV1 calibration bands', () => {
  const calculator = new OverallCalculatorV1();

  it('places Ronaldo-like profiles in 85-86 band', () => {
    const result = calculator.calculate(
      buildContext({
        age: 39,
        marketValue: 15_000_000,
        leagueExternalId: 'SA1',
        careerScore: 98,
        legacyScore: 95,
        profileTag: OverallProfileTag.LEGEND_ACTIVE_OLD,
      }),
    );

    expect(result.finalOverall).toBeGreaterThanOrEqual(85);
    expect(result.finalOverall).toBeLessThanOrEqual(86);
  });

  it('places Rodri-like profiles in 89-90 band', () => {
    const result = calculator.calculate(
      buildContext({
        age: 28,
        marketValue: 120_000_000,
        leagueExternalId: 'GB1',
        careerScore: 92,
        legacyScore: 25,
        profileTag: OverallProfileTag.ELITE_CURRENT,
      }),
    );

    expect(result.finalOverall).toBeGreaterThanOrEqual(89);
    expect(result.finalOverall).toBeLessThanOrEqual(90);
  });

  it('places Yamal-like profiles near 88', () => {
    const result = calculator.calculate(
      buildContext({
        age: 17,
        marketValue: 100_000_000,
        leagueExternalId: 'ES1',
        careerScore: 86,
        legacyScore: 20,
        profileTag: OverallProfileTag.YOUNG_SUPERSTAR,
      }),
    );

    expect(result.finalOverall).toBeGreaterThanOrEqual(82);
    expect(result.finalOverall).toBeLessThanOrEqual(86);
  });

  it('places Arda-like profiles near 82', () => {
    const result = calculator.calculate(
      buildContext({
        age: 19,
        marketValue: 25_000_000,
        leagueExternalId: 'ES1',
        careerScore: 72,
        legacyScore: 10,
        profileTag: OverallProfileTag.NORMAL_PLAYER,
      }),
    );

    expect(result.finalOverall).toBeGreaterThanOrEqual(76);
    expect(result.finalOverall).toBeLessThanOrEqual(80);
  });

  it('places Haaland-like elite profiles near 90 without manual career data', () => {
    const result = calculator.calculate(
      buildContext({
        age: 25,
        marketValue: 200_000_000,
        leagueExternalId: 'GB1',
        careerScore: 50,
        legacyScore: 0,
        profileTag: null,
      }),
    );

    expect(result.finalOverall).toBeGreaterThanOrEqual(89);
    expect(result.finalOverall).toBeLessThanOrEqual(92);
  });

  it('places Yamal-like wonderkid profiles near 88 without manual career data', () => {
    const result = calculator.calculate(
      buildContext({
        age: 18,
        marketValue: 200_000_000,
        leagueExternalId: 'ES1',
        careerScore: 50,
        legacyScore: 0,
        profileTag: null,
      }),
    );

    expect(result.finalOverall).toBeGreaterThanOrEqual(84);
    expect(result.finalOverall).toBeLessThanOrEqual(87);
  });

  it('places Wirtz-like top profiles near 86 without manual career data', () => {
    const result = calculator.calculate(
      buildContext({
        age: 23,
        marketValue: 100_000_000,
        leagueExternalId: 'GB1',
        careerScore: 50,
        legacyScore: 0,
        profileTag: null,
      }),
    );

    expect(result.finalOverall).toBeGreaterThanOrEqual(85);
    expect(result.finalOverall).toBeLessThanOrEqual(88);
  });

  it('places Osimhen-like stars near 87 even in weaker leagues', () => {
    const result = calculator.calculate(
      buildContext({
        age: 27,
        marketValue: 75_000_000,
        leagueExternalId: 'TR1',
        careerScore: 50,
        legacyScore: 0,
        profileTag: null,
      }),
    );

    expect(result.finalOverall).toBeGreaterThanOrEqual(85);
    expect(result.finalOverall).toBeLessThanOrEqual(88);
  });

  it('places Guendouzi-like profiles near 82 in weaker leagues', () => {
    const result = calculator.calculate(
      buildContext({
        age: 27,
        marketValue: 27_000_000,
        leagueExternalId: 'TR1',
        careerScore: 50,
        legacyScore: 0,
        profileTag: null,
      }),
    );

    expect(result.finalOverall).toBeGreaterThanOrEqual(80);
    expect(result.finalOverall).toBeLessThanOrEqual(83);
  });

  it('places Kanté-like aging legends at least at the legend floor', () => {
    const result = calculator.calculate(
      buildContext({
        age: 35,
        marketValue: 4_000_000,
        leagueExternalId: 'TR1',
        careerScore: 94,
        legacyScore: 92,
        profileTag: OverallProfileTag.LEGEND_ACTIVE_OLD,
      }),
    );

    expect(result.finalOverall).toBeGreaterThanOrEqual(85);
    expect(result.finalOverall).toBeLessThanOrEqual(86);
  });

  it('places De Bruyne-like aging elites at least at the elite floor', () => {
    const result = calculator.calculate(
      buildContext({
        age: 34,
        marketValue: 8_000_000,
        leagueExternalId: 'GB1',
        careerScore: 94,
        legacyScore: 85,
        profileTag: OverallProfileTag.ELITE_CURRENT,
      }),
    );

    expect(result.finalOverall).toBeGreaterThanOrEqual(88);
    expect(result.finalOverall).toBeLessThanOrEqual(90);
  });
});
