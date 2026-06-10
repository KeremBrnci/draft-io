import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { ExternalProvider } from '../../../../../core/external-reference/external-provider';

import {
  extractListItems,
  mapClubPlayerDto,
  mapClubSearchResult,
  mapCompetitionDto,
  mapCountryDto,
  mapPlayerProfileDto,
} from './transfermarkt.mapper';

const FIXTURES = join(process.cwd(), 'test/fixtures/transfermarkt');

function loadFixture<T>(name: string): T {
  return JSON.parse(readFileSync(join(FIXTURES, name), 'utf8')) as T;
}

describe('transfermarkt.mapper', () => {
  it('extractListItems reads countries wrapper', () => {
    const response = loadFixture<{ countries: Array<{ id: string; name: string }> }>(
      'countries-list.json',
    );
    const items = extractListItems(response);

    expect(items).toHaveLength(2);
    expect(items[0]?.name).toBe('Germany');
  });

  it('maps country dto', () => {
    const record = mapCountryDto({ id: '40', name: 'Germany' });

    expect(record.provider).toBe(ExternalProvider.TRANSFERMARKT);
    expect(record.externalId).toBe('40');
  });

  it('maps competition dto with country context', () => {
    const response = loadFixture<{ results: Array<{ id: string; name: string; slug: string; country: string }> }>(
      'competition-search-germany.json',
    );
    const dto = extractListItems(response)[0]!;

    const record = mapCompetitionDto(dto, '40');

    expect(record.name).toBe('Bundesliga');
    expect(record.countryExternalId).toBe('40');
    expect(record.logoUrl).toBe('https://tmssl.akamaized.net//images/logo/normal/l1.png');
  });

  it('maps club search result', () => {
    const response = loadFixture<{ results: Array<{ id: string; name: string; country: string }> }>(
      'club-search-barcelona.json',
    );
    const dto = extractListItems(response)[0]!;

    const result = mapClubSearchResult(dto);

    expect(result.externalId).toBe('131');
    expect(result.name).toBe('FC Barcelona');
  });

  it('maps wide midfield labels to LM and RM instead of truncating', () => {
    expect(mapClubPlayerDto({ id: '1', name: 'Left Mid', position: 'Left Midfield' }, '11', 'GB1').primaryPosition).toBe('LM');
    expect(mapClubPlayerDto({ id: '2', name: 'Right Mid', position: 'Right Midfield' }, '11', 'GB1').primaryPosition).toBe('RM');
  });

  it('maps player profile with EUR market value and null overall hint', () => {
    const dto = loadFixture<Parameters<typeof mapPlayerProfileDto>[0]>('player-profile-messi.json');
    const record = mapPlayerProfileDto(dto);

    expect(record.provider).toBe(ExternalProvider.TRANSFERMARKT);
    expect(record.displayName).toBe('Lionel Messi');
    expect(record.marketValue).toBe(20000000);
    expect(record.marketValueCurrency).toBe('EUR');
    expect(record.apiOverallHint).toBeNull();
    expect(record.primaryPosition).toBe('RW');
  });
});
