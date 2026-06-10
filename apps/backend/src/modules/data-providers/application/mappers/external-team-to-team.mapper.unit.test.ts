import { describe, expect, it } from 'vitest';

import { ExternalProvider } from '../../../../core/external-reference/external-provider';

import { mapExternalTeamToDomain } from './external-team-to-team.mapper';

describe('mapExternalTeamToDomain', () => {
  it('maps external team record', () => {
    const team = mapExternalTeamToDomain(
      {
        provider: ExternalProvider.SPORTDB,
        slug: 'arsenal',
        externalId: 't1',
        name: 'Arsenal',
        shortName: 'ARS',
        countryExternalId: null,
        leagueExternalId: null,
        country: 'GB',
        logoUrl: null,
      },
      { countryId: null, leagueId: null },
    );

    expect(team.name.value).toBe('Arsenal');
    expect(team.externalReference?.externalId).toBe('t1');
  });

  it('treats empty short name as null instead of failing validation', () => {
    const team = mapExternalTeamToDomain(
      {
        provider: ExternalProvider.TRANSFERMARKT,
        slug: 'sunderland',
        externalId: '289',
        name: 'Sunderland AFC',
        shortName: '',
        countryExternalId: null,
        leagueExternalId: 'GB1',
        country: 'England',
        logoUrl: null,
      },
      { countryId: null, leagueId: null },
    );

    expect(team.shortName).toBeNull();
  });
});
