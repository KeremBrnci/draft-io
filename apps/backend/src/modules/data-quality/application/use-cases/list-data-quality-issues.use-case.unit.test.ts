import { describe, expect, it, vi } from 'vitest';

import { DataQualityIssueCode } from '../../domain/enums/data-quality-issue-code';
import type { DataQualityRepository } from '../../domain/repositories/data-quality.repository';
import { ListDataQualityIssuesUseCase } from './list-data-quality-issues.use-case';

describe('ListDataQualityIssuesUseCase', () => {
  it('returns paginated issues from repository', async () => {
    const repository: DataQualityRepository = {
      getSummary: vi.fn(),
      findIssues: vi.fn().mockResolvedValue({
        items: [
          {
            playerId: 'p1',
            displayName: 'Test Player',
            issueCodes: [DataQualityIssueCode.MISSING_IMAGE],
          },
        ],
        totalItems: 1,
      }),
    };

    const useCase = new ListDataQualityIssuesUseCase(repository);
    const result = await useCase.execute({ issueCode: DataQualityIssueCode.MISSING_IMAGE });

    expect(result.data).toHaveLength(1);
    expect(result.pagination.totalItems).toBe(1);
  });
});
