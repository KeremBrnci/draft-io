import { ExternalProvider } from '../../../../../core/external-reference/external-provider';
import type { ExternalLeagueRecord } from '../../../domain/models/external-league-record';
import type { LeagueSearchResult } from '../../../domain/models/league-search-result';

/**
 * League detail routes are path-dependent; map from search selection for now.
 */
export function mapLeagueSearchResultToExternalRecord(
  result: LeagueSearchResult,
  countryExternalId: string | null = null,
): ExternalLeagueRecord {
  return {
    provider: ExternalProvider.SPORTDB,
    slug: result.slug,
    externalId: result.externalId,
    name: result.name,
    countryExternalId,
    country: result.country,
    logoUrl: null,
  };
}
