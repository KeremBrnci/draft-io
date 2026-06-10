import {
  buildTransfermarktLeagueLogoUrl,
  normalizeTransfermarktPortraitUrl,
} from '@draft-io/shared-utils';

import { ExternalProvider } from '../../../../../core/external-reference/external-provider';
import { normalizeExternalPositionCode } from '../../../../positions/application/normalize-external-position-code';
import type { ExternalCountryRecord } from '../../../domain/models/external-country-record';
import type { ExternalLeagueRecord } from '../../../domain/models/external-league-record';
import type { ExternalPlayerRecord } from '../../../domain/models/external-player-record';
import type { ExternalTeamRecord } from '../../../domain/models/external-team-record';
import type { LeagueSearchResult } from '../../../domain/models/league-search-result';
import type { PlayerSearchResult } from '../../../domain/models/player-search-result';
import type { TeamSearchResult } from '../../../domain/models/team-search-result';
import type {
  TransfermarktClubPlayerDto,
  TransfermarktClubProfileDto,
  TransfermarktClubSearchResultDto,
  TransfermarktCompetitionDto,
  TransfermarktCountryDto,
  TransfermarktListResponse,
  TransfermarktPlayerProfileDto,
  TransfermarktPlayerSearchResultDto,
} from '../dtos/transfermarkt.dto';

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function splitName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/);

  if (parts.length === 1) {
    return { firstName: parts[0] ?? fullName, lastName: '' };
  }

  return {
    firstName: parts[0] ?? '',
    lastName: parts.slice(1).join(' '),
  };
}

function mapPositionCode(position: string): string {
  return normalizeExternalPositionCode(position) ?? 'CM';
}

export function extractListItems<T>(
  response: TransfermarktListResponse<T> | readonly T[],
): readonly T[] {
  if (Array.isArray(response)) {
    return response;
  }

  const list = response as TransfermarktListResponse<T>;
  return list.results ?? list.data ?? list.countries ?? list.competitions ?? [];
}

export function mapCountryDto(dto: TransfermarktCountryDto): ExternalCountryRecord {
  return {
    provider: ExternalProvider.TRANSFERMARKT,
    externalId: dto.id,
    name: dto.name,
  };
}

export function mapCompetitionDto(
  dto: TransfermarktCompetitionDto,
  countryExternalId: string | null,
): ExternalLeagueRecord {
  return {
    provider: ExternalProvider.TRANSFERMARKT,
    slug: dto.slug ?? slugify(dto.name),
    externalId: dto.id,
    name: dto.name,
    countryExternalId,
    country: dto.country ?? null,
    logoUrl: buildTransfermarktLeagueLogoUrl(dto.id),
  };
}

export function mapCompetitionSearchResult(dto: TransfermarktCompetitionDto): LeagueSearchResult {
  return {
    slug: dto.slug ?? slugify(dto.name),
    externalId: dto.id,
    name: dto.name,
    country: dto.country ?? null,
  };
}

export function mapClubSearchResult(dto: TransfermarktClubSearchResultDto): TeamSearchResult {
  return {
    slug: slugify(dto.name),
    externalId: dto.id,
    name: dto.name,
    country: dto.country ?? null,
  };
}

export function mapClubProfileDto(dto: TransfermarktClubProfileDto): ExternalTeamRecord {
  return {
    provider: ExternalProvider.TRANSFERMARKT,
    slug: slugify(dto.name),
    externalId: dto.id,
    name: dto.name,
    shortName: dto.officialName ?? null,
    countryExternalId: dto.league?.countryId ?? null,
    leagueExternalId: dto.league?.id ?? null,
    country: dto.league?.countryName ?? null,
    logoUrl: dto.image ?? null,
  };
}

export function mapClubPlayerDto(
  dto: TransfermarktClubPlayerDto,
  clubExternalId: string,
  leagueExternalId: string | null = null,
): ExternalPlayerRecord {
  const { firstName, lastName } = splitName(dto.name);
  const nationality = dto.nationality?.[0] ?? 'Unknown';

  return {
    provider: ExternalProvider.TRANSFERMARKT,
    slug: slugify(dto.name),
    externalId: dto.id,
    firstName,
    lastName,
    displayName: dto.name,
    nationality,
    teamExternalId: clubExternalId,
    leagueExternalId,
    primaryPosition: mapPositionCode(dto.position),
    secondaryPositions: [],
    age: dto.age ?? null,
    dateOfBirth: dto.dateOfBirth ?? null,
    apiOverallHint: null,
    marketValue: dto.marketValue ?? null,
    marketValueCurrency: 'EUR',
    imageUrl: normalizeTransfermarktPortraitUrl(dto.imageUrl ?? dto.image ?? null),
    status: dto.status && dto.status.length > 0 ? dto.status : 'ACTIVE',
  };
}

export function mapPlayerSearchResult(dto: TransfermarktPlayerSearchResultDto): PlayerSearchResult {
  return {
    slug: slugify(dto.name),
    externalId: dto.id,
    displayName: dto.name,
    nationality: dto.nationalities?.[0] ?? null,
    teamName: dto.club?.name ?? null,
  };
}

export function mapPlayerProfileDto(dto: TransfermarktPlayerProfileDto): ExternalPlayerRecord {
  const displayName = dto.fullName ?? dto.name;
  const { firstName, lastName } = splitName(displayName);
  const secondary = dto.position?.other?.map(mapPositionCode) ?? [];

  return {
    provider: ExternalProvider.TRANSFERMARKT,
    slug: slugify(displayName),
    externalId: dto.id,
    firstName,
    lastName,
    displayName,
    nationality: dto.citizenship?.[0] ?? 'Unknown',
    teamExternalId: dto.club?.id ?? null,
    leagueExternalId: null,
    primaryPosition: mapPositionCode(dto.position?.main ?? 'ST'),
    secondaryPositions: secondary,
    age: dto.age ?? null,
    apiOverallHint: null,
    marketValue: dto.marketValue ?? null,
    marketValueCurrency: 'EUR',
    imageUrl: normalizeTransfermarktPortraitUrl(dto.imageUrl ?? null),
    status: dto.isRetired === true ? 'RETIRED' : 'ACTIVE',
  };
}
