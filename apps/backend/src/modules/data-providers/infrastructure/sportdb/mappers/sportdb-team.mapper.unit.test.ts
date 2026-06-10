import { describe, expect, it } from 'vitest';

import { ExternalProvider } from '../../../../../core/external-reference/external-provider';

import { toExternalTeamRecord } from './sportdb-team.mapper';

describe('sportdb-team.mapper', () => {
  it('maps team DTO to external record', () => {
    const record = toExternalTeamRecord({
      id: 'team-1',
      slug: 'barcelona',
      name: 'FC Barcelona',
      shortName: 'BAR',
      country: 'ES',
      logoUrl: null,
    });

    expect(record.provider).toBe(ExternalProvider.SPORTDB);
    expect(record.name).toBe('FC Barcelona');
  });
});
