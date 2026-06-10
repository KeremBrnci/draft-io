import type {
  DataQualityIssueDto,
  DataQualitySummaryDto,
  PaginatedResponse,
} from '@draft-io/shared-types';

import { apiGet, apiGetPaginated } from './client';

export function getDataQualitySummary(): Promise<DataQualitySummaryDto> {
  return apiGet<DataQualitySummaryDto>('/admin/data-quality/summary');
}

export function listDataQualityIssues(params: {
  issueCode?: string;
  page?: number;
  pageSize?: number;
} = {}): Promise<PaginatedResponse<DataQualityIssueDto>> {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      search.set(key, String(value));
    }
  }
  const query = search.toString();
  const path = query.length > 0 ? `/admin/data-quality/issues?${query}` : '/admin/data-quality/issues';
  return apiGetPaginated<DataQualityIssueDto>(path);
}
