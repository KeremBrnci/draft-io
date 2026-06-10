import type {
  ImportFailedRecordEntry,
  ImportFailedRecordRepository,
} from '../../domain/repositories/import-failed-record.repository';
import type { ImportJobRepository } from '../../domain/repositories/import-job.repository';
import { ImportJobId } from '../../domain/value-objects/import-job-id.vo';

import type { ReconcileImportFailedRecordsUseCase } from './reconcile-import-failed-records.use-case';

export interface ListImportFailedRecordsQuery {
  readonly jobId: string;
  readonly unresolvedOnly?: boolean;
}

export class ListImportFailedRecordsUseCase {
  constructor(
    private readonly importFailedRecordRepository: ImportFailedRecordRepository,
    private readonly importJobRepository: ImportJobRepository,
    private readonly reconcileImportFailedRecordsUseCase: ReconcileImportFailedRecordsUseCase,
  ) {}

  async execute(query: ListImportFailedRecordsQuery): Promise<readonly ImportFailedRecordEntry[]> {
    const jobId = ImportJobId.create(query.jobId);
    const job = await this.importJobRepository.findById(jobId);

    if (job !== null) {
      await this.reconcileImportFailedRecordsUseCase.execute({
        jobId: query.jobId,
        provider: job.provider,
      });
    }

    if (query.unresolvedOnly !== false) {
      return this.importFailedRecordRepository.findUnresolvedByJobId(jobId);
    }

    return this.importFailedRecordRepository.findByJobId(jobId);
  }
}
