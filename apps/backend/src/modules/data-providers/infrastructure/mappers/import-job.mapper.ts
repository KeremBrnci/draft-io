import type { ImportJob as PrismaImportJob } from '@prisma/client';

import { ImportJob } from '../../domain/entities/import-job.entity';
import type { ImportJobStatus } from '../../domain/enums/import-job-status';
import type { ImportJobType } from '../../domain/enums/import-job-type';
import { ImportJobId } from '../../domain/value-objects/import-job-id.vo';

export function toImportJobDomain(record: PrismaImportJob): ImportJob {
  return ImportJob.reconstitute({
    id: ImportJobId.create(record.id),
    jobType: record.jobType as ImportJobType,
    provider: record.provider,
    targetExternalId: record.targetExternalId,
    targetName: record.targetName,
    status: record.status as ImportJobStatus,
    startedAt: record.startedAt,
    finishedAt: record.finishedAt,
    totalRecords: record.totalRecords,
    processedRecords: record.processedRecords,
    failedRecords: record.failedRecords,
    errorMessage: record.errorMessage,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  });
}

export function toImportJobPersistence(job: ImportJob): PrismaImportJob {
  return {
    id: job.id.value,
    jobType: job.jobType,
    provider: job.provider,
    targetExternalId: job.targetExternalId,
    targetName: job.targetName,
    status: job.status,
    startedAt: job.startedAt,
    finishedAt: job.finishedAt,
    totalRecords: job.totalRecords,
    processedRecords: job.processedRecords,
    failedRecords: job.failedRecords,
    errorMessage: job.errorMessage,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
  };
}
