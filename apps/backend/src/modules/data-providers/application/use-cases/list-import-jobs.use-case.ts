import type { ImportJob } from '../../domain/entities/import-job.entity';
import type { ImportJobRepository } from '../../domain/repositories/import-job.repository';

export interface ListImportJobsQuery {
  readonly limit?: number;
}

export class ListImportJobsUseCase {
  constructor(private readonly importJobRepository: ImportJobRepository) {}

  async execute(query: ListImportJobsQuery = {}): Promise<readonly ImportJob[]> {
    return this.importJobRepository.findRecent(query.limit ?? 50);
  }
}
