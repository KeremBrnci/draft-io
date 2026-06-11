import { describe, expect, it } from 'vitest';

import type { MatchTeamSnapshot } from '../models/match-simulation.types';

import { generateDoubleRoundRobinFixtures } from './fixture-generator.service';
import { MatchSimulationEngine } from './match-simulation-engine.service';

interface TeamOverrides {
  readonly power?: number;
  readonly chemistry?: number;
  readonly formationCode?: string;
  readonly label?: string;
}

function buildTeam(label: string, power: number, overrides: TeamOverrides = {}): MatchTeamSnapshot {
  const chemistry = overrides.chemistry ?? 20;
  const formationCode = overrides.formationCode ?? '4-4-2';
  const displayName = overrides.label ?? label;

  const positionByIndex = (index: number): string => {
    if (index === 0) return 'ST';
    if (index === 10) return 'GK';
    if (index >= 7) return 'CB';
    if (index >= 5) return 'CM';
    return 'LW';
  };

  return {
    participantId: label,
    displayName,
    formationCode,
    teamAverageOverall: power,
    teamChemistry: chemistry,
    matchPower: power * (1 + (chemistry / 33) * 0.08),
    players: Array.from({ length: 11 }, (_, index) => ({
      cardId: `${label}-card-${index}`,
      playerId: `${label}-player-${index}`,
      displayName: `${displayName} Player ${index + 1}`,
      positionCode: positionByIndex(index),
      overall: power,
    })),
  };
}

function buildTeamWithDefense(
  label: string,
  attackPower: number,
  defensePower: number,
  goalkeeperPower: number,
): MatchTeamSnapshot {
  return {
    participantId: label,
    displayName: label,
    formationCode: '4-4-2',
    teamAverageOverall: Math.round((attackPower * 4 + defensePower * 6 + goalkeeperPower) / 11),
    teamChemistry: 20,
    matchPower: attackPower,
    players: [
      {
        cardId: `${label}-st`,
        playerId: `${label}-st`,
        displayName: `${label} Striker`,
        positionCode: 'ST',
        overall: attackPower,
      },
      {
        cardId: `${label}-lw`,
        playerId: `${label}-lw`,
        displayName: `${label} Winger`,
        positionCode: 'LW',
        overall: attackPower - 1,
      },
      {
        cardId: `${label}-cm1`,
        playerId: `${label}-cm1`,
        displayName: `${label} Mid`,
        positionCode: 'CM',
        overall: attackPower - 2,
      },
      {
        cardId: `${label}-cm2`,
        playerId: `${label}-cm2`,
        displayName: `${label} Mid 2`,
        positionCode: 'CM',
        overall: attackPower - 2,
      },
      {
        cardId: `${label}-cb1`,
        playerId: `${label}-cb1`,
        displayName: `${label} CB`,
        positionCode: 'CB',
        overall: defensePower,
      },
      {
        cardId: `${label}-cb2`,
        playerId: `${label}-cb2`,
        displayName: `${label} CB 2`,
        positionCode: 'CB',
        overall: defensePower,
      },
      {
        cardId: `${label}-lb`,
        playerId: `${label}-lb`,
        displayName: `${label} LB`,
        positionCode: 'LB',
        overall: defensePower - 1,
      },
      {
        cardId: `${label}-rb`,
        playerId: `${label}-rb`,
        displayName: `${label} RB`,
        positionCode: 'RB',
        overall: defensePower - 1,
      },
      {
        cardId: `${label}-cdm`,
        playerId: `${label}-cdm`,
        displayName: `${label} DM`,
        positionCode: 'CDM',
        overall: defensePower,
      },
      {
        cardId: `${label}-rw`,
        playerId: `${label}-rw`,
        displayName: `${label} RW`,
        positionCode: 'RW',
        overall: attackPower - 1,
      },
      {
        cardId: `${label}-gk`,
        playerId: `${label}-gk`,
        displayName: `${label} GK`,
        positionCode: 'GK',
        overall: goalkeeperPower,
      },
    ],
  };
}

interface SimulationMetrics {
  avgGoals: number;
  avgXg: number;
  homeWinRate: number;
  awayWinRate: number;
  drawRate: number;
  scorelessRate: number;
  avgEvents: number;
}

function runMetrics(
  home: MatchTeamSnapshot,
  away: MatchTeamSnapshot,
  runs: number,
): SimulationMetrics {
  const engine = new MatchSimulationEngine();
  let homeWins = 0;
  let awayWins = 0;
  let draws = 0;
  let totalGoals = 0;
  let totalXg = 0;
  let scorelessMatches = 0;
  let totalEvents = 0;

  for (let seed = 1; seed <= runs; seed += 1) {
    const result = engine.simulate({ home, away, seed });
    const matchGoals = result.homeScore + result.awayScore;
    totalGoals += matchGoals;
    totalXg += result.homeXg + result.awayXg;
    totalEvents += result.events.length;
    if (matchGoals === 0) scorelessMatches += 1;
    if (result.homeScore > result.awayScore) homeWins += 1;
    else if (result.homeScore < result.awayScore) awayWins += 1;
    else draws += 1;
  }

  return {
    avgGoals: totalGoals / runs,
    avgXg: totalXg / runs,
    homeWinRate: homeWins / runs,
    awayWinRate: awayWins / runs,
    drawRate: draws / runs,
    scorelessRate: scorelessMatches / runs,
    avgEvents: totalEvents / runs,
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
  it('hits fun-first validation targets over 1000 simulations', () => {
    const home = buildTeam('Home FC', 86);
    const away = buildTeam('Away FC', 83);
    const metrics = runMetrics(home, away, 2000);

    expect(metrics.avgGoals).toBeGreaterThanOrEqual(3.0);
    expect(metrics.avgGoals).toBeLessThanOrEqual(4.5);
    expect(metrics.avgXg).toBeGreaterThanOrEqual(3.2);
    expect(metrics.avgXg).toBeLessThanOrEqual(5.5);
    expect(metrics.scorelessRate).toBeLessThanOrEqual(0.03);
    expect(metrics.avgEvents).toBeGreaterThanOrEqual(20);
    expect(metrics.avgEvents).toBeLessThanOrEqual(70);

    const balanced = runMetrics(buildTeam('Home FC', 86), buildTeam('Away FC', 86), 1000);
    expect(balanced.drawRate).toBeGreaterThanOrEqual(0.15);
    expect(balanced.drawRate).toBeLessThanOrEqual(0.25);
    expect(balanced.homeWinRate).toBeGreaterThanOrEqual(0.4);
    expect(balanced.homeWinRate).toBeLessThanOrEqual(0.5);
    expect(balanced.awayWinRate).toBeGreaterThanOrEqual(0.3);
    expect(balanced.awayWinRate).toBeLessThanOrEqual(0.4);
  });

  it('awards a penalty in roughly one quarter of matches', () => {
    const engine = new MatchSimulationEngine();
    let penaltyMatches = 0;
    const runs = 1000;

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

  it('converts penalties at roughly 85%', () => {
    const engine = new MatchSimulationEngine();
    let scored = 0;
    let missed = 0;

    for (let seed = 1; seed <= 5000; seed += 1) {
      const result = engine.simulate({
        home: buildTeam('Home FC', 86),
        away: buildTeam('Away FC', 83),
        seed,
      });

      for (const event of result.events) {
        if (event.eventType === 'GOAL' && event.commentary.toLowerCase().includes('penalt')) {
          scored += 1;
        }
        if (event.eventType === 'MISSED_PENALTY') {
          missed += 1;
        }
      }
    }

    const attempts = scored + missed;
    expect(attempts).toBeGreaterThan(500);
    expect(scored / attempts).toBeGreaterThanOrEqual(0.82);
    expect(scored / attempts).toBeLessThanOrEqual(0.88);
  });

  it('punishes weak goalkeepers and rewards elite attackers', () => {
    const eliteAttack = buildTeam('Attack FC', 90);
    const weakDefense = buildTeamWithDefense('Weak FC', 82, 74, 70);
    const strongDefense = buildTeamWithDefense('Strong FC', 82, 88, 91);

    const vsWeak = runMetrics(eliteAttack, weakDefense, 1000);
    const vsStrong = runMetrics(eliteAttack, strongDefense, 1000);

    expect(vsWeak.avgGoals).toBeGreaterThan(vsStrong.avgGoals);
    expect(vsWeak.avgXg).toBeGreaterThan(vsStrong.avgXg);
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

  it('exposes scenario metrics for representative matchups', () => {
    const scenarios = [
      {
        name: 'Dengeli güçlü takımlar (86 vs 85)',
        home: buildTeam('home-balanced', 86),
        away: buildTeam('away-balanced', 85),
      },
      {
        name: 'Güçlü ev sahibi vs zayıf deplasman (89 vs 82)',
        home: buildTeam('home-favorite', 89),
        away: buildTeam('away-underdog', 82),
      },
      {
        name: 'Kimya avantajı (84 OVR +33 kimya vs 86 OVR +8 kimya)',
        home: buildTeam('home-chemistry', 84, { chemistry: 33 }),
        away: buildTeam('away-raw', 86, { chemistry: 8 }),
      },
      {
        name: '3-4-3 hücum vs 5-3-2 savunma (87 vs 87)',
        home: buildTeam('home-attack', 87, { formationCode: '3-4-3' }),
        away: buildTeam('away-defensive', 87, { formationCode: '5-3-2' }),
      },
      {
        name: '4-3-3 baskı vs 4-5-1 blok (88 vs 86)',
        home: buildTeam('home-press', 88, { formationCode: '4-3-3' }),
        away: buildTeam('away-block', 86, { formationCode: '4-5-1' }),
      },
    ] as const;

    for (const scenario of scenarios) {
      const metrics = runMetrics(scenario.home, scenario.away, 1000);
      expect(metrics.avgGoals).toBeGreaterThanOrEqual(2.4);
      expect(metrics.avgEvents).toBeGreaterThanOrEqual(20);
    }
  });
});
