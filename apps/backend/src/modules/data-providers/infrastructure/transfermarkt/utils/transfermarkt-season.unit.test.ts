import { describe, expect, it } from 'vitest';

import {
  resolveTransfermarktCompetitionSeasonCandidates,
  resolveTransfermarktSeasonId,
} from './transfermarkt-season';

describe('resolveTransfermarktSeasonId', () => {
  it('uses previous calendar year before July', () => {
    expect(resolveTransfermarktSeasonId(new Date('2026-06-09T12:00:00Z'))).toBe('2025');
    expect(resolveTransfermarktSeasonId(new Date('2026-01-15T12:00:00Z'))).toBe('2025');
  });

  it('uses current calendar year from July onward', () => {
    expect(resolveTransfermarktSeasonId(new Date('2026-07-01T12:00:00Z'))).toBe('2026');
    expect(resolveTransfermarktSeasonId(new Date('2026-12-31T12:00:00Z'))).toBe('2026');
  });
});

describe('resolveTransfermarktCompetitionSeasonCandidates', () => {
  it('returns current and previous season years', () => {
    expect(
      resolveTransfermarktCompetitionSeasonCandidates(undefined, new Date('2026-06-09T12:00:00Z')),
    ).toEqual(['2025', '2024']);
  });
});
