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
  if (params.issueCode !== undefined) {
    search.set('issueCode', params.issueCode);
  }
  if (params.page !== undefined) {
    search.set('page', String(params.page));
  }
  if (params.pageSize !== undefined) {
    search.set('pageSize', String(params.pageSize));
  }
  const query = search.toString();
  const path = query.length > 0 ? `/admin/data-quality/issues?${query}` : '/admin/data-quality/issues';
  return apiGetPaginated<DataQualityIssueDto>(path);
}
