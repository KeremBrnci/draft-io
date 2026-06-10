import { Injectable } from '@nestjs/common';

import { ProviderResponseError } from '../../../domain/errors/data-provider.errors';
import type { ExternalTeamRecord } from '../../../domain/models/external-team-record';
import type { TeamSearchResult } from '../../../domain/models/team-search-result';
import type { TeamProvider } from '../../../domain/ports/team-provider.port';
import type { SportDbSearchResponseDto } from '../dtos/sportdb-search.dto';
import type { SportDbTeamDto } from '../dtos/sportdb-team.dto';
import { SportDbHttpClient } from '../http/sportdb-http.client';
import { mapTeamSearchResults } from '../mappers/sportdb-search.mapper';
import { toExternalTeamRecord } from '../mappers/sportdb-team.mapper';

@Injectable()
export class SportDbTeamProvider implements TeamProvider {
  constructor(private readonly httpClient: SportDbHttpClient) {}

  async searchTeams(query: string): Promise<readonly TeamSearchResult[]> {
    const response = await this.httpClient.getJson<SportDbSearchResponseDto>('search', {
      q: query,
      type: 'team',
    });

    return mapTeamSearchResults(response);
  }

  async fetchBySlugAndId(slug: string, externalId: string): Promise<ExternalTeamRecord | null> {
    try {
      const dto = await this.httpClient.getJson<SportDbTeamDto>(`team/${slug}/${externalId}`);
      return toExternalTeamRecord(dto);
    } catch (error) {
      if (error instanceof ProviderResponseError && error.statusCode === 404) {
        return null;
      }

      throw error;
    }
  }
}
