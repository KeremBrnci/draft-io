import type { AdminDashboardMetricsDto } from '@draft-io/shared-types';

import { apiGet } from './client';

export function getDashboardMetrics(): Promise<AdminDashboardMetricsDto> {
  return apiGet<AdminDashboardMetricsDto>('/admin/dashboard/metrics');
}
