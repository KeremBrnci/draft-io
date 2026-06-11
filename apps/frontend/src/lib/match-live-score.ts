import type { MatchEventDto, MatchStateDto } from '@draft-io/shared-types';

function isScoredGoalEvent(event: MatchEventDto): boolean {
  return event.isGoal && event.eventType === 'GOAL';
}

export function countLiveGoals(
  events: readonly MatchEventDto[],
  side: 'HOME' | 'AWAY',
): number {
  return events.filter((event) => isScoredGoalEvent(event) && event.teamSide === side).length;
}

/** Live score follows revealed goal events so the board matches commentary. */
export function resolveLiveMatchScores(match: MatchStateDto): {
  readonly homeScore: number;
  readonly awayScore: number;
} {
  if (match.status === 'FULL_TIME') {
    return { homeScore: match.homeScore, awayScore: match.awayScore };
  }

  return {
    homeScore: countLiveGoals(match.events, 'HOME'),
    awayScore: countLiveGoals(match.events, 'AWAY'),
  };
}
