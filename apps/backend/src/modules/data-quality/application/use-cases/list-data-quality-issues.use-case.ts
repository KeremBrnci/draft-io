import type { PaginatedResponse, PaginationParams } from '@draft-io/shared-types';
import { createPaginationMeta } from '@draft-io/shared-types';

import type { DataQualityIssueCode } from '../../domain/enums/data-quality-issue-code';
import type {
  DataQualityIssue,
  DataQualityRepository,
} from '../../domain/repositories/data-quality.repository';

export interface ListDataQualityIssuesQuery {
  readonly issueCode?: DataQualityIssueCode;
  readonly page?: number;
  readonly pageSize?: number;
}

export class ListDataQualityIssuesUseCase {
  constructor(private readonly dataQualityRepository: DataQualityRepository) {}

  async execute(
    query: ListDataQualityIssuesQuery = {},
  ): Promise<PaginatedResponse<DataQualityIssue>> {
    const pagination: PaginationParams = {
      page: query.page ?? 1,
      pageSize: query.pageSize ?? 25,
    };

    const page = await this.dataQualityRepository.findIssues(
      {
        ...(query.issueCode !== undefined ? { issueCode: query.issueCode } : {}),
      },
      pagination,
    );

    return {
      data: page.items,
      pagination: createPaginationMeta(pagination, page.totalItems),
    };
  }
}
