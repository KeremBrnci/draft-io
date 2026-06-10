import type { ImportJob } from '../entities/import-job.entity';
import type { ImportJobId } from '../value-objects/import-job-id.vo';

export interface ImportJobRepository {
  findById(id: ImportJobId): Promise<ImportJob | null>;
  findRecent(limit: number): Promise<readonly ImportJob[]>;
  countFailed(): Promise<number>;
  countCompletedSince(since: Date): Promise<number>;
  save(job: ImportJob): Promise<void>;
}

export const IMPORT_JOB_REPOSITORY = Symbol('IMPORT_JOB_REPOSITORY');
