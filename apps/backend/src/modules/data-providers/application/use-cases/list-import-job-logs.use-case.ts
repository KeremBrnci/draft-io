import type {
  ImportJobLogEntry,
  ImportJobLogRepository,
} from '../../domain/repositories/import-job-log.repository';
import { ImportJobId } from '../../domain/value-objects/import-job-id.vo';

export interface ListImportJobLogsQuery {
  readonly jobId: string;
  readonly limit?: number;
}

export class ListImportJobLogsUseCase {
  constructor(private readonly importJobLogRepository: ImportJobLogRepository) {}

  async execute(query: ListImportJobLogsQuery): Promise<readonly ImportJobLogEntry[]> {
    return this.importJobLogRepository.findByJobId(ImportJobId.create(query.jobId), query.limit);
  }
}
