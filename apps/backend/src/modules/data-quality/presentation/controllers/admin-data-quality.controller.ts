import type { ApiResponse, PaginatedResponse } from '@draft-io/shared-types';
import { Controller, Get, HttpCode, HttpStatus, Query } from '@nestjs/common';

import { GetDataQualitySummaryUseCase } from '../../application/use-cases/get-data-quality-summary.use-case';
import { ListDataQualityIssuesUseCase } from '../../application/use-cases/list-data-quality-issues.use-case';
import { ListDataQualityIssuesQueryDto } from '../dto/list-data-quality-issues-query.dto';
import {
  toDataQualityIssueDto,
  toDataQualitySummaryDto,
} from '../mappers/data-quality-response.mapper';

@Controller('admin/data-quality')
export class AdminDataQualityController {
  constructor(
    private readonly getDataQualitySummaryUseCase: GetDataQualitySummaryUseCase,
    private readonly listDataQualityIssuesUseCase: ListDataQualityIssuesUseCase,
  ) {}

  @Get('summary')
  @HttpCode(HttpStatus.OK)
  async getSummary(): Promise<ApiResponse<ReturnType<typeof toDataQualitySummaryDto>>> {
    const summary = await this.getDataQualitySummaryUseCase.execute();
    return { data: toDataQualitySummaryDto(summary) };
  }

  @Get('issues')
  @HttpCode(HttpStatus.OK)
  async listIssues(
    @Query() query: ListDataQualityIssuesQueryDto,
  ): Promise<PaginatedResponse<ReturnType<typeof toDataQualityIssueDto>>> {
    const result = await this.listDataQualityIssuesUseCase.execute({
      ...(query.issueCode !== undefined ? { issueCode: query.issueCode } : {}),
      ...(query.page !== undefined ? { page: query.page } : {}),
      ...(query.pageSize !== undefined ? { pageSize: query.pageSize } : {}),
    });

    return {
      data: result.data.map(toDataQualityIssueDto),
      pagination: result.pagination,
    };
  }
}
