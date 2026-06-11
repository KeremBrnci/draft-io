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
  it('produces high-scoring scorelines with target goal floors', () => {
    const engine = new MatchSimulationEngine();
    let homeWins = 0;
    let awayWins = 0;
    let draws = 0;
    let totalGoals = 0;
    let totalXg = 0;
    let atLeastOneGoal = 0;
    let atLeastThreeGoals = 0;
    let scorelessMatches = 0;

    for (let seed = 1; seed <= 5000; seed += 1) {
      const result = engine.simulate({
        home: buildTeam('Home FC', 86),
        away: buildTeam('Away FC', 83),
        seed,
      });

      const matchGoals = result.homeScore + result.awayScore;
      totalGoals += matchGoals;
      totalXg += result.homeXg + result.awayXg;
      if (matchGoals >= 1) atLeastOneGoal += 1;
      if (matchGoals >= 3) atLeastThreeGoals += 1;
      if (matchGoals === 0) scorelessMatches += 1;
      if (result.homeScore > result.awayScore) homeWins += 1;
      else if (result.homeScore < result.awayScore) awayWins += 1;
      else draws += 1;

      expect(result.events.length).toBeGreaterThanOrEqual(20);
      expect(result.events.length).toBeLessThanOrEqual(70);
    }

    const runs = 5000;
    const avgGoals = totalGoals / runs;
    const avgXg = totalXg / runs;

    expect(avgGoals).toBeGreaterThan(2.1);
    expect(avgGoals).toBeLessThan(3.5);
    expect(avgXg).toBeGreaterThan(0.9);
    expect(avgXg).toBeLessThan(4);
    expect(atLeastOneGoal / runs).toBeGreaterThanOrEqual(0.93);
    expect(atLeastThreeGoals / runs).toBeGreaterThanOrEqual(0.47);
    expect(atLeastThreeGoals / runs).toBeLessThanOrEqual(0.6);
    expect(scorelessMatches / runs).toBeGreaterThanOrEqual(0.03);
    expect(scorelessMatches / runs).toBeLessThanOrEqual(0.07);
    expect(homeWins / runs).toBeGreaterThan(0.3);
    expect(awayWins / runs).toBeGreaterThan(0.2);
    expect(draws / runs).toBeLessThan(0.2);
  });

  it('awards a penalty in roughly one quarter of matches', () => {
    const engine = new MatchSimulationEngine();
    let penaltyMatches = 0;
    const runs = 5000;

    for (let seed = 1; seed <= runs; seed += 1) {
      const result = engine.simulate({
        home: buildTeam('Home FC', 86),
        away: buildTeam('Away FC', 83),
        seed,
      });

      const hasPenalty = result.events.some((event) => event.eventType === 'PENALTY');
      if (hasPenalty) {
        penaltyMatches += 1;
      }
    }

    expect(penaltyMatches / runs).toBeGreaterThanOrEqual(0.22);
    expect(penaltyMatches / runs).toBeLessThanOrEqual(0.28);
  });

  it('does not place a goal one minute after another goal or penalty', () => {
    const engine = new MatchSimulationEngine();

    for (let seed = 1; seed <= 1000; seed += 1) {
      const result = engine.simulate({
        home: buildTeam('Home FC', 86),
        away: buildTeam('Away FC', 83),
        seed,
      });

      const priorScoringMinutes = new Set(
        result.events
          .filter((event) => event.eventType === 'GOAL' || event.eventType === 'PENALTY')
          .map((event) => event.minute),
      );
      const goalMinutes = result.events
        .filter((event) => event.eventType === 'GOAL')
        .map((event) => event.minute);

      for (const goalMinute of goalMinutes) {
        expect(priorScoringMinutes.has(goalMinute - 1)).toBe(false);
      }
    }
  });
});
