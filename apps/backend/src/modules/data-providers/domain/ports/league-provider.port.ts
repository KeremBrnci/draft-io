import type { ExternalLeagueRecord } from '../models/external-league-record';
import type { LeagueSearchResult } from '../models/league-search-result';

export interface LeagueProvider {
  searchLeagues(query: string): Promise<readonly LeagueSearchResult[]>;
  buildRecordFromSearchResult(
    result: LeagueSearchResult,
    countryExternalId?: string | null,
  ): ExternalLeagueRecord;
  listCompetitionsByCountry?(countryExternalId: string): Promise<readonly LeagueSearchResult[]>;
}

export const LEAGUE_PROVIDER = Symbol('LEAGUE_PROVIDER');
