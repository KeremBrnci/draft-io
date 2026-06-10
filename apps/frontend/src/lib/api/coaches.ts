import type { CoachBrowserItemDto, CoachSortFieldDto, PaginatedResponse, SortDirectionDto } from '@draft-io/shared-types';

import { apiGetPaginated } from './client';

export interface BrowseCoachesParams {
  readonly name?: string;
  readonly role?: string;
  readonly teamId?: string;
  readonly leagueId?: string;
  readonly nationality?: string;
  readonly hasImage?: boolean;
  readonly hasAge?: boolean;
  readonly sortField?: CoachSortFieldDto;
  readonly sortDirection?: SortDirectionDto;
  readonly page?: number;
  readonly pageSize?: number;
}

export function browseCoaches(
  params: BrowseCoachesParams = {},
): Promise<PaginatedResponse<CoachBrowserItemDto>> {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') {
      search.set(key, String(value));
    }
  }

  const query = search.toString();
  const path = query.length > 0 ? `/admin/coaches?${query}` : '/admin/coaches';

  return apiGetPaginated<CoachBrowserItemDto>(path);
}
