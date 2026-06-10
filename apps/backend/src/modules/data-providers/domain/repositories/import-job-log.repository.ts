import type { ImportJobId } from '../value-objects/import-job-id.vo';

export type ImportLogLevel = 'INFO' | 'WARN' | 'ERROR';

export interface ImportJobLogEntry {
  readonly id: string;
  readonly jobId: string;
  readonly level: ImportLogLevel;
  readonly message: string;
  readonly createdAt: Date;
}

export interface ImportJobLogRepository {
  append(jobId: ImportJobId, level: ImportLogLevel, message: string): Promise<void>;
  findByJobId(jobId: ImportJobId, limit?: number): Promise<readonly ImportJobLogEntry[]>;
}

export const IMPORT_JOB_LOG_REPOSITORY = Symbol('IMPORT_JOB_LOG_REPOSITORY');
