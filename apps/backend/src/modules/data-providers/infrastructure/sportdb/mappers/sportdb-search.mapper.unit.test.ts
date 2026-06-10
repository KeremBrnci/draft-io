import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import type { SportDbSearchResponseDto } from '../dtos/sportdb-search.dto';

import {
  mapLeagueSearchResults,
  mapPlayerSearchResults,
  mapTeamSearchResults,
} from './sportdb-search.mapper';

const FIXTURES = join(process.cwd(), 'test/fixtures/sportdb');

function loadFixture(name: string): SportDbSearchResponseDto {
  return JSON.parse(readFileSync(join(FIXTURES, name), 'utf8')) as SportDbSearchResponseDto;
}

describe('sportdb-search.mapper', () => {
  it('maps player search results', () => {
    const results = mapPlayerSearchResults(loadFixture('player-search-messi.json'));

    expect(results[0]).toEqual({
      slug: 'messi-lionel',
      externalId: 'vgOOdZbd',
      displayName: 'Lionel Messi',
      nationality: 'Argentina',
      teamName: 'Inter Miami',
    });
  });

  it('maps team search results', () => {
    const results = mapTeamSearchResults(loadFixture('team-search-barcelona.json'));

    expect(results[0]?.externalId).toBe('SKbpVP6K');
    expect(results[0]?.name).toBe('Barcelona');
  });

  it('maps competition search results', () => {
    const results = mapLeagueSearchResults(loadFixture('competition-search-bundesliga.json'));

    expect(results[0]?.name).toBe('Bundesliga');
    expect(results[0]?.country).toBe('Germany');
  });
});
