import { describe, expect, it } from 'vitest';

import { ExternalProvider } from '../../../../../core/external-reference/external-provider';
import type { SportDbPlayerDto } from '../dtos/sportdb-player.dto';

import { toExternalPlayerRecord } from './sportdb-player.mapper';

describe('sportdb-player.mapper', () => {
  it('maps SportDB DTO to external record without trusting overall as game rating', () => {
    const dto: SportDbPlayerDto = {
      id: 'vgOOdZbd',
      slug: 'messi-lionel',
      firstName: 'Lionel',
      lastName: 'Messi',
      displayName: 'Lionel Messi',
      nationality: 'AR',
      teamId: 'team-1',
      leagueId: 'league-1',
      primaryPosition: 'RW',
      secondaryPositions: ['ST'],
      age: 36,
      overall: 94,
      marketValue: 50_000_000,
      imageUrl: 'https://cdn.example.com/messi.png',
      status: 'active',
    };

    const record = toExternalPlayerRecord(dto);

    expect(record.provider).toBe(ExternalProvider.SPORTDB);
    expect(record.externalId).toBe('vgOOdZbd');
    expect(record.slug).toBe('messi-lionel');
    expect(record.apiOverallHint).toBe(94);
    expect(record.displayName).toBe('Lionel Messi');
  });
});
