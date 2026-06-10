import type { AdminDashboardMetricsDto, ApiResponse } from '@draft-io/shared-types';
import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';

import { GetAdminDashboardMetricsUseCase } from '../../application/use-cases/get-admin-dashboard-metrics.use-case';

@Controller('admin/dashboard')
export class AdminDashboardController {
  constructor(private readonly getAdminDashboardMetricsUseCase: GetAdminDashboardMetricsUseCase) {}

  @Get('metrics')
  @HttpCode(HttpStatus.OK)
  async getMetrics(): Promise<ApiResponse<AdminDashboardMetricsDto>> {
    const metrics = await this.getAdminDashboardMetricsUseCase.execute();

    return { data: metrics };
  }
}
