import { describe, expect, it } from 'vitest';

import { resolveLiveMatchScores } from './match-live-score';

const emptyLineup = {
  participantId: 'p1',
  displayName: 'Team',
  formationCode: '4-3-3',
  players: [],
};

describe('resolveLiveMatchScores', () => {
  it('counts only revealed GOAL events during live play', () => {
    const match = {
      id: 'm1',
      leagueId: 'l1',
      status: 'LIVE' as const,
      currentMinute: 34,
      displayMinute: '34',
      firstHalfStoppageMinutes: 3,
      secondHalfStoppageMinutes: 2,
      homeScore: 3,
      awayScore: 0,
      homeXg: 1.2,
      awayXg: 0.4,
      homeParticipantId: 'h1',
      awayParticipantId: 'a1',
      homeDisplayName: 'Home',
      awayDisplayName: 'Away',
      manOfTheMatchCardId: null,
      manOfTheMatchPlayerName: null,
      homeLineup: emptyLineup,
      awayLineup: emptyLineup,
      statistics: null,
      events: [
        {
          id: 'e1',
          minute: 12,
          eventType: 'GOAL' as const,
          teamSide: 'HOME' as const,
          playerName: 'Striker',
          secondaryPlayerName: null,
          cardId: 'c1',
          commentary: 'Gol!',
          xgValue: 0.4,
          isGoal: true,
        },
      ],
    };

    expect(resolveLiveMatchScores(match)).toEqual({ homeScore: 1, awayScore: 0 });
  });

  it('uses final match scores after full time', () => {
    const match = {
      id: 'm1',
      leagueId: 'l1',
      status: 'FULL_TIME' as const,
      currentMinute: 95,
      displayMinute: '90+2',
      firstHalfStoppageMinutes: 3,
      secondHalfStoppageMinutes: 2,
      homeScore: 2,
      awayScore: 1,
      homeXg: 1.8,
      awayXg: 1.1,
      homeParticipantId: 'h1',
      awayParticipantId: 'a1',
      homeDisplayName: 'Home',
      awayDisplayName: 'Away',
      manOfTheMatchCardId: null,
      manOfTheMatchPlayerName: null,
      homeLineup: emptyLineup,
      awayLineup: emptyLineup,
      statistics: null,
      events: [],
    };

    expect(resolveLiveMatchScores(match)).toEqual({ homeScore: 2, awayScore: 1 });
  });
});
