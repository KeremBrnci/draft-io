import type { LeagueSearchResult } from '../../../domain/models/league-search-result';
import type { PlayerSearchResult } from '../../../domain/models/player-search-result';
import type { TeamSearchResult } from '../../../domain/models/team-search-result';
import type { SportDbSearchItemDto, SportDbSearchResponseDto } from '../dtos/sportdb-search.dto';

function extractItems(response: SportDbSearchResponseDto): readonly SportDbSearchItemDto[] {
  return response.results ?? response.data ?? [];
}

function resolveDisplayName(item: SportDbSearchItemDto): string {
  return item.name ?? item.title ?? item.slug ?? item.id;
}

function resolveSlug(item: SportDbSearchItemDto): string {
  return item.slug ?? item.id;
}

export function mapPlayerSearchResults(
  response: SportDbSearchResponseDto,
): readonly PlayerSearchResult[] {
  return extractItems(response).map((item) => ({
    slug: resolveSlug(item),
    externalId: item.id,
    displayName: resolveDisplayName(item),
    nationality: item.nationality ?? null,
    teamName: item.team?.name ?? null,
  }));
}

export function mapTeamSearchResults(
  response: SportDbSearchResponseDto,
): readonly TeamSearchResult[] {
  return extractItems(response).map((item) => ({
    slug: resolveSlug(item),
    externalId: item.id,
    name: resolveDisplayName(item),
    country: item.country ?? null,
  }));
}

export function mapLeagueSearchResults(
  response: SportDbSearchResponseDto,
): readonly LeagueSearchResult[] {
  return extractItems(response).map((item) => ({
    slug: resolveSlug(item),
    externalId: item.id,
    name: resolveDisplayName(item),
    country: item.country ?? null,
  }));
}
