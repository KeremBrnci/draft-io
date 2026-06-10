import { Injectable } from '@nestjs/common';

import { ProviderResponseError } from '../../../domain/errors/data-provider.errors';
import type { ExternalPlayerRecord } from '../../../domain/models/external-player-record';
import type { PlayerSearchResult } from '../../../domain/models/player-search-result';
import type { PlayerProvider } from '../../../domain/ports/player-provider.port';
import type { SportDbPlayerDto } from '../dtos/sportdb-player.dto';
import type { SportDbSearchResponseDto } from '../dtos/sportdb-search.dto';
import { SportDbHttpClient } from '../http/sportdb-http.client';
import { toExternalPlayerRecord } from '../mappers/sportdb-player.mapper';
import { mapPlayerSearchResults } from '../mappers/sportdb-search.mapper';

@Injectable()
export class SportDbPlayerProvider implements PlayerProvider {
  constructor(private readonly httpClient: SportDbHttpClient) {}

  async searchPlayers(query: string): Promise<readonly PlayerSearchResult[]> {
    const response = await this.httpClient.getJson<SportDbSearchResponseDto>('search', {
      q: query,
      type: 'player',
    });

    return mapPlayerSearchResults(response);
  }

  async fetchBySlugAndId(slug: string, externalId: string): Promise<ExternalPlayerRecord | null> {
    try {
      const dto = await this.httpClient.getJson<SportDbPlayerDto>(`player/${slug}/${externalId}`);
      return toExternalPlayerRecord(dto);
    } catch (error) {
      if (error instanceof ProviderResponseError && error.statusCode === 404) {
        return null;
      }

      throw error;
    }
  }
}
