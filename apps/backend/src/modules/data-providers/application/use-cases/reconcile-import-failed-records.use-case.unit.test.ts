import { describe, expect, it, vi } from 'vitest';

import { ExternalProvider } from '../../../../core/external-reference/external-provider';
import { ImportJobId } from '../../domain/value-objects/import-job-id.vo';

import { ReconcileImportFailedRecordsUseCase } from './reconcile-import-failed-records.use-case';

describe('ReconcileImportFailedRecordsUseCase', () => {
  it('marks club failures resolved when team exists in database', async () => {
    const importFailedRecordRepository = {
      findUnresolvedByJobId: vi.fn().mockResolvedValue([
        {
          id: 'fail-1',
          jobId: 'job-1',
          recordType: 'CLUB',
          externalId: '289',
          slug: null,
          displayName: 'Sunderland AFC',
          errorMessage: 'Team short name must be between 1 and 32 characters',
          resolved: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]),
      markResolved: vi.fn().mockResolvedValue(undefined),
    };

    const teamRepository = {
      findByExternalReference: vi.fn().mockResolvedValue({ id: { value: 'team-1' } }),
    };

    const playerRepository = {
      findByExternalReference: vi.fn(),
    };

    const useCase = new ReconcileImportFailedRecordsUseCase(
      importFailedRecordRepository as never,
      teamRepository as never,
      playerRepository as never,
    );

    const resolved = await useCase.execute({
      jobId: ImportJobId.create('00000000-0000-4000-8000-000000000099').value,
      provider: ExternalProvider.TRANSFERMARKT,
    });

    expect(resolved).toBe(1);
    expect(importFailedRecordRepository.markResolved).toHaveBeenCalledWith('fail-1');
  });
});
