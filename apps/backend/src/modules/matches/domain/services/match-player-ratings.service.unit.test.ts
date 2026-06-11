import { describe, expect, it } from 'vitest';

import {
  computeLivePlayerRatings,
  MATCH_GOAL_RATING_BUMP,
} from './match-player-ratings.service';

describe('computeLivePlayerRatings', () => {
  it('starts from initial ratings and bumps scorers on revealed goals only', () => {
    const ratings = computeLivePlayerRatings(
      { a: 6.4, b: 6.8 },
      [
        { eventType: 'GOAL', cardId: 'a', isGoal: true },
        { eventType: 'SHOT', cardId: 'b', isGoal: false },
      ],
      ['a', 'b'],
    );

    expect(ratings.a).toBe(6.4 + MATCH_GOAL_RATING_BUMP);
    expect(ratings.b).toBe(6.8);
  });
});
