import { Injectable } from '@nestjs/common';

import { ProviderResponseError } from '../../../domain/errors/data-provider.errors';
import type { ExternalTeamRecord } from '../../../domain/models/external-team-record';
import type { TeamSearchResult } from '../../../domain/models/team-search-result';
import type { TeamProvider } from '../../../domain/ports/team-provider.port';
import type {
  TransfermarktClubProfileDto,
  TransfermarktClubSearchResultDto,
  TransfermarktCompetitionClubsDto,
  TransfermarktListResponse,
} from '../dtos/transfermarkt.dto';
import { TransfermarktConfigService } from '../config/transfermarkt.config';
import { TransfermarktHttpClient } from '../http/transfermarkt-http.client';
import {
  extractListItems,
  mapClubProfileDto,
  mapClubSearchResult,
} from '../mappers/transfermarkt.mapper';
import {
  buildTransfermarktSeasonQuery,
  resolveTransfermarktCompetitionSeasonCandidates,
} from '../utils/transfermarkt-season';

@Injectable()
export class TransfermarktTeamProvider implements TeamProvider {
  constructor(
    private readonly httpClient: TransfermarktHttpClient,
    private readonly configService: TransfermarktConfigService,
  ) {}

  async searchTeams(query: string): Promise<readonly TeamSearchResult[]> {
    const response = await this.httpClient.getJson<
      TransfermarktListResponse<TransfermarktClubSearchResultDto>
    >(`clubs/search/${encodeURIComponent(query)}`);

    return extractListItems(response).map(mapClubSearchResult);
  }

  async fetchBySlugAndId(_slug: string, externalId: string): Promise<ExternalTeamRecord | null> {
    return this.fetchClubProfile(externalId);
  }

  async listClubsByCompetition(competitionExternalId: string): Promise<readonly TeamSearchResult[]> {
    const seasonCandidates = resolveTransfermarktCompetitionSeasonCandidates(
      this.configService.getConfig().seasonId,
    );

    let lastError: unknown;

    for (const seasonId of seasonCandidates) {
      try {
        const response = await this.httpClient.getJson<
          TransfermarktCompetitionClubsDto | TransfermarktListResponse<TransfermarktClubSearchResultDto>
        >(
          `competitions/${encodeURIComponent(competitionExternalId)}/clubs?${buildTransfermarktSeasonQuery(seasonId)}`,
        );

        if ('clubs' in response && Array.isArray(response.clubs)) {
          return response.clubs.map(mapClubSearchResult);
        }

        return extractListItems(
          response as TransfermarktListResponse<TransfermarktClubSearchResultDto>,
        ).map(mapClubSearchResult);
      } catch (error) {
        lastError = error;

        if (
          error instanceof ProviderResponseError &&
          (error.statusCode === 404 || error.statusCode === 405)
        ) {
          continue;
        }

        throw error;
      }
    }

    if (lastError instanceof Error) {
      throw lastError;
    }

    throw new ProviderResponseError(404, `No clubs found for competition ${competitionExternalId}`);
  }

  async fetchClubProfile(externalId: string): Promise<ExternalTeamRecord | null> {
    try {
      const dto = await this.httpClient.getJson<TransfermarktClubProfileDto>(
        `clubs/${encodeURIComponent(externalId)}/profile`,
      );
      return mapClubProfileDto(dto);
    } catch (error) {
      if (error instanceof ProviderResponseError && error.statusCode === 404) {
        return null;
      }

      throw error;
    }
  }
}
