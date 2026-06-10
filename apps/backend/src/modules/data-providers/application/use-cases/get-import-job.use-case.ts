import { type ImportJob } from '../../domain/entities/import-job.entity';
import type { ImportJobRepository } from '../../domain/repositories/import-job.repository';
import { ImportJobId } from '../../domain/value-objects/import-job-id.vo';

export interface GetImportJobQuery {
  readonly jobId: string;
}

export class GetImportJobUseCase {
  constructor(private readonly importJobRepository: ImportJobRepository) {}

  async execute(query: GetImportJobQuery): Promise<ImportJob> {
    const job = await this.importJobRepository.findById(ImportJobId.create(query.jobId));

    if (job === null) {
      throw new Error(`Import job not found: ${query.jobId}`);
    }

    return job;
  }
}
