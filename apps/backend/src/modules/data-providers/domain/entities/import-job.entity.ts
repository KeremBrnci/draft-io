import { Entity } from '../../../../common/domain/entity';
import { ImportJobStatus } from '../enums/import-job-status';
import type { ImportJobType } from '../enums/import-job-type';
import { ImportJobId } from '../value-objects/import-job-id.vo';

export interface ImportJobProps {
  readonly id: ImportJobId;
  readonly jobType: ImportJobType;
  readonly provider: string;
  readonly targetExternalId: string | null;
  readonly targetName: string | null;
  readonly status: ImportJobStatus;
  readonly startedAt: Date | null;
  readonly finishedAt: Date | null;
  readonly totalRecords: number;
  readonly processedRecords: number;
  readonly failedRecords: number;
  readonly errorMessage: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface CreateImportJobProps {
  readonly id: ImportJobId;
  readonly jobType: ImportJobType;
  readonly provider: string;
  readonly targetExternalId?: string | null;
  readonly targetName?: string | null;
}

export class ImportJob extends Entity<ImportJobId> {
  private _status: ImportJobStatus;
  private _startedAt: Date | null;
  private _finishedAt: Date | null;
  private _totalRecords: number;
  private _processedRecords: number;
  private _failedRecords: number;
  private _errorMessage: string | null;
  private _updatedAt: Date;

  private readonly _jobType: ImportJobType;
  private readonly _provider: string;
  private readonly _targetExternalId: string | null;
  private readonly _targetName: string | null;
  private readonly _createdAt: Date;

  private constructor(props: ImportJobProps) {
    super(props.id);
    this._jobType = props.jobType;
    this._provider = props.provider;
    this._targetExternalId = props.targetExternalId;
    this._targetName = props.targetName;
    this._status = props.status;
    this._startedAt = props.startedAt;
    this._finishedAt = props.finishedAt;
    this._totalRecords = props.totalRecords;
    this._processedRecords = props.processedRecords;
    this._failedRecords = props.failedRecords;
    this._errorMessage = props.errorMessage;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  static create(props: CreateImportJobProps): ImportJob {
    const now = new Date();

    return new ImportJob({
      id: props.id,
      jobType: props.jobType,
      provider: props.provider,
      targetExternalId: props.targetExternalId ?? null,
      targetName: props.targetName ?? null,
      status: ImportJobStatus.PENDING,
      startedAt: null,
      finishedAt: null,
      totalRecords: 0,
      processedRecords: 0,
      failedRecords: 0,
      errorMessage: null,
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstitute(props: ImportJobProps): ImportJob {
    return new ImportJob(props);
  }

  get jobType(): ImportJobType {
    return this._jobType;
  }

  get provider(): string {
    return this._provider;
  }

  get targetExternalId(): string | null {
    return this._targetExternalId;
  }

  get targetName(): string | null {
    return this._targetName;
  }

  get status(): ImportJobStatus {
    return this._status;
  }

  get startedAt(): Date | null {
    return this._startedAt;
  }

  get finishedAt(): Date | null {
    return this._finishedAt;
  }

  get totalRecords(): number {
    return this._totalRecords;
  }

  get processedRecords(): number {
    return this._processedRecords;
  }

  get failedRecords(): number {
    return this._failedRecords;
  }

  get errorMessage(): string | null {
    return this._errorMessage;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  markRunning(totalRecords: number): void {
    const now = new Date();
    this._status = ImportJobStatus.RUNNING;
    this._startedAt = now;
    this._totalRecords = totalRecords;
    this._updatedAt = now;
  }

  recordSuccess(): void {
    this._processedRecords += 1;
    this._updatedAt = new Date();
  }

  recordFailure(): void {
    this._processedRecords += 1;
    this._failedRecords += 1;
    this._updatedAt = new Date();
  }

  markCompleted(): void {
    this.markFinished();
  }

  markFinished(): void {
    const now = new Date();
    this._status =
      this._failedRecords > 0 ? ImportJobStatus.PARTIAL : ImportJobStatus.COMPLETED;
    this._finishedAt = now;
    this._updatedAt = now;
  }

  markFailed(message: string): void {
    const now = new Date();
    this._status = ImportJobStatus.FAILED;
    this._finishedAt = now;
    this._errorMessage = message.slice(0, 1024);
    this._updatedAt = now;
  }
}
