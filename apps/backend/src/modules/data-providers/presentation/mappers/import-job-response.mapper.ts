import type { ImportFailedRecordDto, ImportJobDto, ImportJobLogDto } from '@draft-io/shared-types';

import type { ImportJob } from '../../domain/entities/import-job.entity';
import type { ImportFailedRecordEntry } from '../../domain/repositories/import-failed-record.repository';
import type { ImportJobLogEntry } from '../../domain/repositories/import-job-log.repository';

export function toImportJobDto(job: ImportJob): ImportJobDto {
  return {
    id: job.id.value,
    jobType: job.jobType,
    provider: job.provider,
    targetCompetition: job.targetExternalId,
    targetExternalId: job.targetExternalId,
    targetName: job.targetName,
    status: job.status,
    startedAt: job.startedAt?.toISOString() ?? null,
    finishedAt: job.finishedAt?.toISOString() ?? null,
    totalRecords: job.totalRecords,
    processedRecords: job.processedRecords,
    failedRecords: job.failedRecords,
    errorMessage: job.errorMessage,
    createdAt: job.createdAt.toISOString(),
  };
}

export function toImportJobLogDto(log: ImportJobLogEntry): ImportJobLogDto {
  return {
    id: log.id,
    jobId: log.jobId,
    level: log.level,
    message: log.message,
    createdAt: log.createdAt.toISOString(),
  };
}

export function toImportFailedRecordDto(record: ImportFailedRecordEntry): ImportFailedRecordDto {
  return {
    id: record.id,
    jobId: record.jobId,
    recordType: record.recordType,
    externalId: record.externalId,
    slug: record.slug,
    displayName: record.displayName,
    errorMessage: record.errorMessage,
    resolved: record.resolved,
    createdAt: record.createdAt.toISOString(),
  };
}

export function toImportJobResult(job: ImportJob): {
  jobId: string;
  status: ImportJob['status'];
  processedRecords: number;
  failedRecords: number;
} {
  return {
    jobId: job.id.value,
    status: job.status,
    processedRecords: job.processedRecords,
    failedRecords: job.failedRecords,
  };
}
