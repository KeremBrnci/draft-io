import type { ImportFailedRecordRepository } from '../../domain/repositories/import-failed-record.repository';
import type { ImportJobLogRepository } from '../../domain/repositories/import-job-log.repository';
import type { ImportJobRepository } from '../../domain/repositories/import-job.repository';

import type { ImportJobTrackerDependencies } from './import-job-tracker.service';

export function buildImportJobTrackerDeps(
  importJobRepository: ImportJobRepository,
  importJobLogRepository: ImportJobLogRepository,
  importFailedRecordRepository: ImportFailedRecordRepository,
): ImportJobTrackerDependencies {
  return {
    importJobRepository,
    importJobLogRepository,
    importFailedRecordRepository,
  };
}
