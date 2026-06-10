import { Injectable } from '@nestjs/common';

import { ExternalProvider } from '../../../../../core/external-reference/external-provider';
import type { ExternalLeagueRecord } from '../../../domain/models/external-league-record';
import type { LeagueSearchResult } from '../../../domain/models/league-search-result';
import type { LeagueProvider } from '../../../domain/ports/league-provider.port';
import type {
  TransfermarktCompetitionDto,
  TransfermarktListResponse,
} from '../dtos/transfermarkt.dto';
import { findTransfermarktCountryByExternalId } from '../data/transfermarkt-countries.seed';
import { TransfermarktHttpClient } from '../http/transfermarkt-http.client';
import {
  extractListItems,
  mapCompetitionDto,
  mapCompetitionSearchResult,
} from '../mappers/transfermarkt.mapper';

@Injectable()
export class TransfermarktLeagueProvider implements LeagueProvider {
  constructor(private readonly httpClient: TransfermarktHttpClient) {}

  async searchLeagues(query: string): Promise<readonly LeagueSearchResult[]> {
    const response = await this.httpClient.getJson<
      TransfermarktListResponse<TransfermarktCompetitionDto>
    >(`competitions/search/${encodeURIComponent(query)}`);

    return extractListItems(response).map(mapCompetitionSearchResult);
  }

  async listCompetitionsByCountry(countryExternalId: string): Promise<readonly LeagueSearchResult[]> {
    const country = findTransfermarktCountryByExternalId(countryExternalId);

    if (country === undefined) {
      return [];
    }

    const response = await this.httpClient.getJson<
      TransfermarktListResponse<TransfermarktCompetitionDto> | readonly TransfermarktCompetitionDto[]
    >(`competitions/search/${encodeURIComponent(country.name)}`);

    return extractListItems(response).map(mapCompetitionSearchResult);
  }

  buildRecordFromSearchResult(
    result: LeagueSearchResult,
    countryExternalId: string | null = null,
  ): ExternalLeagueRecord {
    return {
      provider: ExternalProvider.TRANSFERMARKT,
      slug: result.slug,
      externalId: result.externalId,
      name: result.name,
      countryExternalId,
      country: result.country,
      logoUrl: null,
    };
  }

  mapCompetitionDto(
    dto: TransfermarktCompetitionDto,
    countryExternalId: string | null,
  ): ExternalLeagueRecord {
    return mapCompetitionDto(dto, countryExternalId);
  }
}
