import { describe, expect, it } from 'vitest';

import { ExternalProvider } from '../../../../core/external-reference/external-provider';

import { mapExternalLeagueToDomain } from './external-league-to-league.mapper';

describe('mapExternalLeagueToDomain', () => {
  it('maps external league record', () => {
    const league = mapExternalLeagueToDomain(
      {
        provider: ExternalProvider.SPORTDB,
        slug: 'la-liga',
        externalId: 'l1',
        name: 'La Liga',
        countryExternalId: null,
        country: 'ES',
        logoUrl: null,
      },
      { countryId: null },
    );

    expect(league.name.value).toBe('La Liga');
  });
});
