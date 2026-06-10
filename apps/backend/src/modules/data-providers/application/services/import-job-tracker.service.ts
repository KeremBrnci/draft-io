import { ImportJob } from '../../domain/entities/import-job.entity';
import type { ImportFailedRecordRepository } from '../../domain/repositories/import-failed-record.repository';
import type { ImportFailedRecordType } from '../../domain/repositories/import-failed-record.repository';
import type { ImportJobLogRepository } from '../../domain/repositories/import-job-log.repository';
import type { ImportJobRepository } from '../../domain/repositories/import-job.repository';
import { ImportJobId } from '../../domain/value-objects/import-job-id.vo';

export interface ImportJobTrackerDependencies {
  readonly importJobRepository: ImportJobRepository;
  readonly importJobLogRepository?: ImportJobLogRepository;
  readonly importFailedRecordRepository?: ImportFailedRecordRepository;
}

export class ImportJobTracker {
  constructor(
    private readonly deps: ImportJobTrackerDependencies,
    private readonly job: ImportJob,
  ) {}

  static async create(
    deps: ImportJobTrackerDependencies,
    props: Parameters<typeof ImportJob.create>[0],
  ): Promise<ImportJobTracker> {
    const job = ImportJob.create(props);
    await deps.importJobRepository.save(job);
    return new ImportJobTracker(deps, job);
  }

  get id(): ImportJobId {
    return this.job.id;
  }

  get entity(): ImportJob {
    return this.job;
  }

  async log(message: string, level: 'INFO' | 'WARN' | 'ERROR' = 'INFO'): Promise<void> {
    if (this.deps.importJobLogRepository !== undefined) {
      await this.deps.importJobLogRepository.append(this.job.id, level, message);
    }
  }

  async start(totalRecords: number): Promise<void> {
    this.job.markRunning(totalRecords);
    await this.deps.importJobRepository.save(this.job);
    await this.log(`Job started with ${String(totalRecords)} records`);
  }

  async recordSuccess(message?: string): Promise<void> {
    this.job.recordSuccess();
    await this.deps.importJobRepository.save(this.job);
    if (message !== undefined) {
      await this.log(message);
    }
  }

  async recordFailure(
    errorMessage: string,
    details?: {
      readonly recordType?: ImportFailedRecordType;
      readonly externalId?: string | null;
      readonly slug?: string | null;
      readonly displayName?: string | null;
    },
  ): Promise<void> {
    this.job.recordFailure();
    await this.deps.importJobRepository.save(this.job);

    if (this.deps.importFailedRecordRepository !== undefined && details?.recordType !== undefined) {
      await this.deps.importFailedRecordRepository.create({
        jobId: this.job.id,
        recordType: details.recordType,
        externalId: details.externalId ?? null,
        slug: details.slug ?? null,
        displayName: details.displayName ?? null,
        errorMessage,
      });
    }

    await this.log(errorMessage, 'ERROR');
  }

  async complete(): Promise<void> {
    this.job.markFinished();
    await this.deps.importJobRepository.save(this.job);
    await this.log(`Job finished with status ${this.job.status}`);
  }

  async fail(message: string): Promise<void> {
    this.job.markFailed(message);
    await this.deps.importJobRepository.save(this.job);
    await this.log(message, 'ERROR');
  }
}
