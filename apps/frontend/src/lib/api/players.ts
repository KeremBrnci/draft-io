import type {
  PaginatedResponse,
  PlayerBrowserItemDto,
  PlayerSortFieldDto,
  SortDirectionDto,
} from '@draft-io/shared-types';

import { apiGetPaginated } from './client';

export interface BrowsePlayersParams {
  readonly name?: string;
  readonly position?: string;
  readonly teamId?: string;
  readonly leagueId?: string;
  readonly nationality?: string;
  readonly minAge?: number;
  readonly maxAge?: number;
  readonly minMarketValue?: number;
  readonly maxMarketValue?: number;
  readonly hasImage?: boolean;
  readonly hasMarketValue?: boolean;
  readonly hasPosition?: boolean;
  readonly hasAge?: boolean;
  readonly sortField?: PlayerSortFieldDto;
  readonly sortDirection?: SortDirectionDto;
  readonly page?: number;
  readonly pageSize?: number;
}

export function browsePlayers(
  params: BrowsePlayersParams = {},
): Promise<PaginatedResponse<PlayerBrowserItemDto>> {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') {
      search.set(key, String(value));
    }
  }

  const query = search.toString();
  const path = query.length > 0 ? `/admin/players?${query}` : '/admin/players';

  return apiGetPaginated<PlayerBrowserItemDto>(path);
}
