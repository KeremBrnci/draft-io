import { describe, expect, it } from 'vitest';

import { formatLeagueIndicator } from './format-league-indicator';

describe('formatLeagueIndicator', () => {
  it('maps known league names', () => {
    expect(formatLeagueIndicator('Premier League')).toBe('PL');
    expect(formatLeagueIndicator('Bundesliga')).toBe('BL');
  });

  it('builds initials for unknown leagues', () => {
    expect(formatLeagueIndicator('Scottish Premiership')).toBe('SP');
  });

  it('returns null for empty input', () => {
    expect(formatLeagueIndicator(null)).toBeNull();
    expect(formatLeagueIndicator('')).toBeNull();
  });
});
