import { describe, expect, it } from 'vitest';

import { isLeagueSeasonComplete } from './league-season.service';

describe('isLeagueSeasonComplete', () => {
  it('is true only when every fixture has a finished match', () => {
    expect(isLeagueSeasonComplete(2, 2)).toBe(true);
    expect(isLeagueSeasonComplete(2, 1)).toBe(false);
    expect(isLeagueSeasonComplete(0, 0)).toBe(false);
  });
});
