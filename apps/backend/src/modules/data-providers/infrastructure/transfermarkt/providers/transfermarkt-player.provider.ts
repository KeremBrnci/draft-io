import { Injectable } from '@nestjs/common';

import { ProviderResponseError } from '../../../domain/errors/data-provider.errors';
import type { ExternalPlayerRecord } from '../../../domain/models/external-player-record';
import type { PlayerSearchResult } from '../../../domain/models/player-search-result';
import type { PlayerProvider } from '../../../domain/ports/player-provider.port';
import type {
  TransfermarktClubPlayersDto,
  TransfermarktListResponse,
  TransfermarktPlayerProfileDto,
  TransfermarktPlayerSearchResultDto,
} from '../dtos/transfermarkt.dto';
import { TransfermarktConfigService } from '../config/transfermarkt.config';
import { TransfermarktHttpClient } from '../http/transfermarkt-http.client';
import {
  extractListItems,
  mapClubPlayerDto,
  mapPlayerProfileDto,
  mapPlayerSearchResult,
} from '../mappers/transfermarkt.mapper';
import { buildTransfermarktSeasonQuery, resolveTransfermarktSeasonId } from '../utils/transfermarkt-season';

@Injectable()
export class TransfermarktPlayerProvider implements PlayerProvider {
  constructor(
    private readonly httpClient: TransfermarktHttpClient,
    private readonly configService: TransfermarktConfigService,
  ) {}

  async searchPlayers(query: string): Promise<readonly PlayerSearchResult[]> {
    const response = await this.httpClient.getJson<
      TransfermarktListResponse<TransfermarktPlayerSearchResultDto>
    >(`players/search/${encodeURIComponent(query)}`);

    return extractListItems(response).map(mapPlayerSearchResult);
  }

  async fetchBySlugAndId(_slug: string, externalId: string): Promise<ExternalPlayerRecord | null> {
    return this.fetchProfile(externalId);
  }

  async fetchProfile(externalId: string): Promise<ExternalPlayerRecord | null> {
    try {
      const dto = await this.httpClient.getJson<TransfermarktPlayerProfileDto>(
        `players/${encodeURIComponent(externalId)}/profile`,
      );
      return mapPlayerProfileDto(dto);
    } catch (error) {
      if (error instanceof ProviderResponseError && error.statusCode === 404) {
        return null;
      }

      throw error;
    }
  }

  async fetchClubPlayers(
    clubExternalId: string,
    leagueExternalId: string | null = null,
  ): Promise<readonly ExternalPlayerRecord[]> {
    const seasonId =
      this.configService.getConfig().seasonId ?? resolveTransfermarktSeasonId();
    const dto = await this.httpClient.getJson<TransfermarktClubPlayersDto>(
      `clubs/${encodeURIComponent(clubExternalId)}/players?${buildTransfermarktSeasonQuery(seasonId)}`,
    );

    return dto.players.map((player) => mapClubPlayerDto(player, clubExternalId, leagueExternalId));
  }
}
