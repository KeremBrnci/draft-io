import { describe, expect, it } from 'vitest';

import { ExternalProvider } from '../../../../core/external-reference/external-provider';
import type { ExternalPlayerRecord } from '../../domain/models/external-player-record';

import { mapExternalPlayerToDomain } from './external-player-to-player.mapper';

const record: ExternalPlayerRecord = {
  provider: ExternalProvider.SPORTDB,
  slug: 'test-player',
  externalId: 'p1',
  firstName: 'Test',
  lastName: 'Player',
  displayName: 'Test Player',
  nationality: 'US',
  teamExternalId: null,
  leagueExternalId: null,
  primaryPosition: 'ST',
  secondaryPositions: [],
  age: 25,
  apiOverallHint: 99,
  marketValue: null,
  marketValueCurrency: null,
  imageUrl: null,
  status: 'ACTIVE',
};

describe('mapExternalPlayerToDomain', () => {
  it('maps identity fields and ignores api overall hint', () => {
    const player = mapExternalPlayerToDomain(record, {
      countryId: null,
      teamId: null,
      leagueId: null,
    });

    expect(player.externalReference?.externalId).toBe('p1');
    expect(player.birthDate).not.toBeNull();
    expect('overall' in player).toBe(false);
  });
});
