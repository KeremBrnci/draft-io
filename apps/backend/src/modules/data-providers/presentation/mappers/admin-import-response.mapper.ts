import type { LeagueSearchResult } from '../../domain/models/league-search-result';
import type { PlayerSearchResult } from '../../domain/models/player-search-result';
import type { TeamSearchResult } from '../../domain/models/team-search-result';

export interface PlayerSearchResultDto {
  readonly slug: string;
  readonly externalId: string;
  readonly displayName: string;
  readonly nationality: string | null;
  readonly teamName: string | null;
}

export interface TeamSearchResultDto {
  readonly slug: string;
  readonly externalId: string;
  readonly name: string;
  readonly country: string | null;
}

export interface LeagueSearchResultDto {
  readonly slug: string;
  readonly externalId: string;
  readonly name: string;
  readonly country: string | null;
}

export interface CountryDto {
  readonly externalId: string;
  readonly name: string;
  readonly imported: boolean;
}

export interface ImportedPlayerDto {
  readonly id: string;
  readonly provider: string;
  readonly externalId: string;
  readonly displayName: string;
  readonly marketValue: number | null;
}

export interface ImportedTeamDto {
  readonly id: string;
  readonly provider: string;
  readonly externalId: string;
  readonly name: string;
}

export function toCountryDto(record: {
  readonly externalId: string;
  readonly name: string;
  readonly imported: boolean;
}): CountryDto {
  return {
    externalId: record.externalId,
    name: record.name,
    imported: record.imported,
  };
}

export function toPlayerSearchResultDto(result: PlayerSearchResult): PlayerSearchResultDto {
  return {
    slug: result.slug,
    externalId: result.externalId,
    displayName: result.displayName,
    nationality: result.nationality,
    teamName: result.teamName,
  };
}

export function toTeamSearchResultDto(result: TeamSearchResult): TeamSearchResultDto {
  return {
    slug: result.slug,
    externalId: result.externalId,
    name: result.name,
    country: result.country,
  };
}

export function toLeagueSearchResultDto(result: LeagueSearchResult): LeagueSearchResultDto {
  return {
    slug: result.slug,
    externalId: result.externalId,
    name: result.name,
    country: result.country,
  };
}

export function toImportedPlayerDto(player: {
  readonly id: { readonly value: string };
  readonly externalReference: { readonly provider: string; readonly externalId: string } | null;
  readonly displayName: { readonly value: string };
  readonly marketValue: { readonly value: number } | null;
}): ImportedPlayerDto {
  return {
    id: player.id.value,
    provider: player.externalReference?.provider ?? '',
    externalId: player.externalReference?.externalId ?? '',
    displayName: player.displayName.value,
    marketValue: player.marketValue?.value ?? null,
  };
}

export function toImportedTeamDto(team: {
  readonly id: { readonly value: string };
  readonly externalReference: { readonly provider: string; readonly externalId: string } | null;
  readonly name: { readonly value: string };
}): ImportedTeamDto {
  return {
    id: team.id.value,
    provider: team.externalReference?.provider ?? '',
    externalId: team.externalReference?.externalId ?? '',
    name: team.name.value,
  };
}
