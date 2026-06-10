import type { ImportJobId } from '../value-objects/import-job-id.vo';

export type ImportFailedRecordType = 'CLUB' | 'PLAYER' | 'COMPETITION';

export interface ImportFailedRecordEntry {
  readonly id: string;
  readonly jobId: string;
  readonly recordType: ImportFailedRecordType;
  readonly externalId: string | null;
  readonly slug: string | null;
  readonly displayName: string | null;
  readonly errorMessage: string;
  readonly resolved: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface CreateImportFailedRecordProps {
  readonly jobId: ImportJobId;
  readonly recordType: ImportFailedRecordType;
  readonly externalId?: string | null;
  readonly slug?: string | null;
  readonly displayName?: string | null;
  readonly errorMessage: string;
}

export interface ImportFailedRecordRepository {
  create(props: CreateImportFailedRecordProps): Promise<ImportFailedRecordEntry>;
  findByJobId(jobId: ImportJobId): Promise<readonly ImportFailedRecordEntry[]>;
  findUnresolvedByJobId(jobId: ImportJobId): Promise<readonly ImportFailedRecordEntry[]>;
  markResolved(id: string): Promise<void>;
}

export const IMPORT_FAILED_RECORD_REPOSITORY = Symbol('IMPORT_FAILED_RECORD_REPOSITORY');
