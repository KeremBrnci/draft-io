import { describe, expect, it } from 'vitest';

import type {
  GeneratedMatchEvent,
  MatchTeamSnapshot,
} from '../../../simulation/domain/models/match-simulation.types';

import { MatchVisualizationEnricher } from './match-visualization-enricher.service';

const team: MatchTeamSnapshot = {
  participantId: 'home-1',
  displayName: 'Home FC',
  formationCode: '4-3-3',
  teamAverageOverall: 84,
  teamChemistry: 20,
  matchPower: 86,
  players: [
    {
      cardId: 'c1',
      playerId: 'p1',
      displayName: 'Rodri',
      positionCode: 'CDM',
      overall: 88,
    },
    {
      cardId: 'c2',
      playerId: 'p2',
      displayName: 'Yamal',
      positionCode: 'RW',
      overall: 86,
    },
    {
      cardId: 'c3',
      playerId: 'p3',
      displayName: 'Haaland',
      positionCode: 'ST',
      overall: 91,
    },
  ],
};

const away: MatchTeamSnapshot = {
  participantId: 'away-1',
  displayName: 'Away FC',
  formationCode: '4-4-2',
  teamAverageOverall: 82,
  teamChemistry: 15,
  matchPower: 83,
  players: [
    {
      cardId: 'a1',
      playerId: 'ap1',
      displayName: 'Keeper',
      positionCode: 'GK',
      overall: 85,
    },
  ],
};

describe('MatchVisualizationEnricher', () => {
  const enricher = new MatchVisualizationEnricher();

  it('expands goal events into attack flow with ball zones and chain metadata', () => {
    const events: GeneratedMatchEvent[] = [
      {
        minute: 34,
        eventType: 'GOAL',
        teamSide: 'HOME',
        playerName: 'Haaland',
        secondaryPlayerName: 'Yamal',
        cardId: 'c3',
        commentary: 'Gol!',
        xgValue: 0.4,
        isGoal: true,
      },
    ];

    const enriched = enricher.enrich({ events, home: team, away, seed: 42 });
    const flowEvents = enriched.filter((event) =>
      ['PASS', 'DRIBBLE', 'CROSS'].includes(event.eventType),
    );

    expect(flowEvents.length).toBeGreaterThan(0);
    expect(enriched.at(-1)?.eventType).toBe('GOAL');
    expect(enriched.at(-1)?.visualization?.attackChainPlayers?.length).toBeGreaterThan(1);
    expect(enriched.at(-1)?.visualization?.ballZone).toMatch(/A\d/);
    expect(enriched.at(-1)?.visualization?.isReplayEligible).toBe(true);
  });

  it('adds visualization to standalone dangerous attacks', () => {
    const events: GeneratedMatchEvent[] = [
      {
        minute: 12,
        eventType: 'DANGEROUS_ATTACK',
        teamSide: 'AWAY',
        playerName: 'Keeper',
        secondaryPlayerName: null,
        cardId: 'a1',
        commentary: 'Tehlikeli atak',
        xgValue: null,
        isGoal: false,
      },
    ];

    const enriched = enricher.enrich({ events, home: team, away, seed: 7 });
    expect(enriched).toHaveLength(1);
    expect(enriched[0]?.visualization?.ballZone).toBeDefined();
    expect(enriched[0]?.visualization?.activePlayerNames).toContain('Keeper');
  });
});
