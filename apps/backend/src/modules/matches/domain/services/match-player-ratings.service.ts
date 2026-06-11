export const MATCH_GOAL_RATING_BUMP = 1.1;
export const MATCH_DEFAULT_LIVE_RATING = 6.5;

export interface MatchRatingEvent {
  readonly eventType: string;
  readonly cardId: string | null;
  readonly isGoal: boolean;
}

function roundRating(value: number): number {
  return Math.round(value * 10) / 10;
}

export function computeLivePlayerRatings(
  initialRatings: Readonly<Record<string, number>>,
  revealedEvents: readonly MatchRatingEvent[],
  playerCardIds: readonly string[],
): Readonly<Record<string, number>> {
  const ratings: Record<string, number> = {};

  for (const cardId of playerCardIds) {
    ratings[cardId] = roundRating(initialRatings[cardId] ?? MATCH_DEFAULT_LIVE_RATING);
  }

  for (const event of revealedEvents) {
    if (event.eventType !== 'GOAL' || !event.isGoal || event.cardId === null) {
      continue;
    }

    ratings[event.cardId] = roundRating(
      (ratings[event.cardId] ?? MATCH_DEFAULT_LIVE_RATING) + MATCH_GOAL_RATING_BUMP,
    );
  }

  return ratings;
}
