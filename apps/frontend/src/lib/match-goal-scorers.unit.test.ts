import { describe, expect, it } from 'vitest';

import { extractMatchGoalsByTeam } from './match-goal-scorers';

const stoppage = { firstHalfMinutes: 2, secondHalfMinutes: 2 };

describe('extractMatchGoalsByTeam', () => {
  it('groups revealed goals by team with display minutes', () => {
    const goals = extractMatchGoalsByTeam(
      [
        {
          id: 'g1',
          minute: 23,
          eventType: 'GOAL',
          teamSide: 'HOME',
          playerName: 'Striker',
          secondaryPlayerName: 'Winger',
          cardId: 'c1',
          commentary: 'Gol!',
          xgValue: 0.4,
          isGoal: true,
        },
        {
          id: 'g2',
          minute: 51,
          eventType: 'GOAL',
          teamSide: 'AWAY',
          playerName: 'Forward',
          secondaryPlayerName: null,
          cardId: 'c2',
          commentary: 'Gol!',
          xgValue: 0.3,
          isGoal: true,
        },
      ],
      stoppage,
    );

    expect(goals.home).toHaveLength(1);
    expect(goals.home[0]?.minuteLabel).toBe('23');
    expect(goals.home[0]?.playerName).toBe('Striker');
    expect(goals.away[0]?.minuteLabel).toBe('51');
    expect(goals.away[0]?.playerName).toBe('Forward');
  });
});
