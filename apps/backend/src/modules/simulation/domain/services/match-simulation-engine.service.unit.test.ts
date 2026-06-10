import { describe, expect, it } from 'vitest';

import type { MatchTeamSnapshot } from '../models/match-simulation.types';

import { generateDoubleRoundRobinFixtures } from './fixture-generator.service';
import { MatchSimulationEngine } from './match-simulation-engine.service';

function buildTeam(label: string, power: number): MatchTeamSnapshot {
  return {
    participantId: label,
    displayName: label,
    formationCode: '4-4-2',
    teamAverageOverall: power,
    teamChemistry: 20,
    matchPower: power,
    players: Array.from({ length: 11 }, (_, index) => ({
      cardId: `${label}-card-${index}`,
      playerId: `${label}-player-${index}`,
      displayName: `${label} Player ${index + 1}`,
      positionCode: index === 0 ? 'ST' : 'CM',
      overall: power,
    })),
  };
}

describe('generateDoubleRoundRobinFixtures', () => {
  it('creates home-and-away fixtures for each pair', () => {
    expect(generateDoubleRoundRobinFixtures(['a', 'b']).length).toBe(2);
    expect(generateDoubleRoundRobinFixtures(['a', 'b', 'c', 'd']).length).toBe(12);
    expect(generateDoubleRoundRobinFixtures(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']).length).toBe(
      56,
    );
  });
});

describe('MatchSimulationEngine', () => {
  it('produces believable scorelines over many runs', () => {
    const engine = new MatchSimulationEngine();
    let homeWins = 0;
    let awayWins = 0;
    let draws = 0;
    let totalGoals = 0;
    let totalXg = 0;

    for (let seed = 1; seed <= 1000; seed += 1) {
      const result = engine.simulate({
        home: buildTeam('Home FC', 86),
        away: buildTeam('Away FC', 83),
        seed,
      });

      totalGoals += result.homeScore + result.awayScore;
      totalXg += result.homeXg + result.awayXg;
      if (result.homeScore > result.awayScore) homeWins += 1;
      else if (result.homeScore < result.awayScore) awayWins += 1;
      else draws += 1;

      expect(result.events.length).toBeGreaterThanOrEqual(20);
      expect(result.events.length).toBeLessThanOrEqual(60);
    }

    const avgGoals = totalGoals / 1000;
    const avgXg = totalXg / 1000;

    expect(avgGoals).toBeGreaterThan(0.9);
    expect(avgGoals).toBeLessThan(5.5);
    expect(avgXg).toBeGreaterThan(0.8);
    expect(avgXg).toBeLessThan(5);
    expect(homeWins / 1000).toBeGreaterThan(0.3);
    expect(awayWins / 1000).toBeGreaterThan(0.2);
    expect(draws / 1000).toBeGreaterThan(0.1);
  });
});
