import { Injectable } from '@nestjs/common';

import type { ExternalLeagueRecord } from '../../../domain/models/external-league-record';
import type { LeagueSearchResult } from '../../../domain/models/league-search-result';
import type { LeagueProvider } from '../../../domain/ports/league-provider.port';
import type { SportDbSearchResponseDto } from '../dtos/sportdb-search.dto';
import { SportDbHttpClient } from '../http/sportdb-http.client';
import { mapLeagueSearchResultToExternalRecord } from '../mappers/sportdb-league.mapper';
import { mapLeagueSearchResults } from '../mappers/sportdb-search.mapper';

@Injectable()
export class SportDbLeagueProvider implements LeagueProvider {
  constructor(private readonly httpClient: SportDbHttpClient) {}

  async searchLeagues(query: string): Promise<readonly LeagueSearchResult[]> {
    const response = await this.httpClient.getJson<SportDbSearchResponseDto>('search', {
      q: query,
      type: 'competition',
    });

    return mapLeagueSearchResults(response);
  }

  buildRecordFromSearchResult(
    result: LeagueSearchResult,
    countryExternalId: string | null = null,
  ): ExternalLeagueRecord {
    return mapLeagueSearchResultToExternalRecord(result, countryExternalId);
  }
}
