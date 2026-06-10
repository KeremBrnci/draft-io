import { describe, expect, it } from 'vitest';

import { ImportJobStatus } from '../enums/import-job-status';
import { ImportJobType } from '../enums/import-job-type';
import { ImportJobId } from '../value-objects/import-job-id.vo';
import { ImportJob } from './import-job.entity';

describe('ImportJob', () => {
  it('tracks progress through a successful run', () => {
    const job = ImportJob.create({
      id: ImportJobId.create('550e8400-e29b-41d4-a716-446655440000'),
      jobType: ImportJobType.CLUBS,
      provider: 'TRANSFERMARKT',
      targetExternalId: 'L1',
      targetName: 'Bundesliga',
    });

    expect(job.status).toBe(ImportJobStatus.PENDING);

    job.markRunning(3);
    expect(job.status).toBe(ImportJobStatus.RUNNING);
    expect(job.totalRecords).toBe(3);

    job.recordSuccess();
    job.recordFailure();
    job.markFinished();

    expect(job.processedRecords).toBe(2);
    expect(job.failedRecords).toBe(1);
    expect(job.status).toBe(ImportJobStatus.PARTIAL);
    expect(job.finishedAt).not.toBeNull();
  });

  it('marks job as completed when all records succeed', () => {
    const job = ImportJob.create({
      id: ImportJobId.generate(),
      jobType: ImportJobType.PLAYERS,
      provider: 'TRANSFERMARKT',
    });

    job.markRunning(2);
    job.recordSuccess();
    job.recordSuccess();
    job.markFinished();

    expect(job.status).toBe(ImportJobStatus.COMPLETED);
    expect(job.failedRecords).toBe(0);
  });

  it('marks job as failed with message', () => {
    const job = ImportJob.create({
      id: ImportJobId.generate(),
      jobType: ImportJobType.COMPETITION,
      provider: 'TRANSFERMARKT',
    });

    job.markFailed('Upstream unavailable');

    expect(job.status).toBe(ImportJobStatus.FAILED);
    expect(job.errorMessage).toBe('Upstream unavailable');
  });
});
