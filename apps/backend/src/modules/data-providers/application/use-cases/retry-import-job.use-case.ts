import { parseExternalProvider } from '../../../../core/external-reference/external-provider';
import { ImportJobStatus } from '../../domain/enums/import-job-status';
import type { ImportFailedRecordRepository } from '../../domain/repositories/import-failed-record.repository';
import type { ImportJobLogRepository } from '../../domain/repositories/import-job-log.repository';
import type { ImportJobRepository } from '../../domain/repositories/import-job.repository';
import { ImportJobId } from '../../domain/value-objects/import-job-id.vo';
import { buildImportJobTrackerDeps } from '../services/import-job-tracker.factory';
import { ImportJobTracker } from '../services/import-job-tracker.service';
import type { ImportPlayerUseCase } from './import-player.use-case';
import type { ImportTeamUseCase } from './import-team.use-case';
import type { SyncPlayerProfileUseCase } from './sync-player-profile.use-case';

export interface RetryImportJobCommand {
  readonly jobId: string;
}

export class RetryImportJobUseCase {
  constructor(
    private readonly importJobRepository: ImportJobRepository,
    private readonly importJobLogRepository: ImportJobLogRepository,
    private readonly importFailedRecordRepository: ImportFailedRecordRepository,
    private readonly importTeamUseCase: ImportTeamUseCase,
    private readonly importPlayerUseCase: ImportPlayerUseCase,
    private readonly syncPlayerProfileUseCase: SyncPlayerProfileUseCase,
  ) {}

  async execute(command: RetryImportJobCommand): Promise<ImportJobTracker> {
    const sourceJob = await this.importJobRepository.findById(ImportJobId.create(command.jobId));

    if (sourceJob === null) {
      throw new Error(`Import job not found: ${command.jobId}`);
    }

    if (
      sourceJob.status !== ImportJobStatus.FAILED &&
      sourceJob.status !== ImportJobStatus.PARTIAL
    ) {
      throw new Error(`Job ${command.jobId} is not retryable (status: ${sourceJob.status})`);
    }

    const failedRecords = await this.importFailedRecordRepository.findUnresolvedByJobId(
      sourceJob.id,
    );

    const tracker = await ImportJobTracker.create(
      buildImportJobTrackerDeps(
        this.importJobRepository,
        this.importJobLogRepository,
        this.importFailedRecordRepository,
      ),
      {
        id: ImportJobId.generate(),
        jobType: sourceJob.jobType,
        provider: sourceJob.provider,
        targetExternalId: sourceJob.targetExternalId,
        targetName: sourceJob.targetName,
      },
    );

    await tracker.start(failedRecords.length);
    await tracker.log(`Retrying ${String(failedRecords.length)} failed records from job ${command.jobId}`);

    const provider = sourceJob.provider;

    for (const record of failedRecords) {
      try {
        await this.retryRecord(provider, record);
        await this.importFailedRecordRepository.markResolved(record.id);
        await tracker.recordSuccess(`Retried ${record.displayName ?? record.externalId ?? record.id}`);
      } catch (error) {
        await tracker.recordFailure(error instanceof Error ? error.message : 'Retry failed', {
          recordType: record.recordType,
          externalId: record.externalId,
          slug: record.slug,
          displayName: record.displayName,
        });
      }
    }

    await tracker.complete();
    return tracker;
  }

  private async retryRecord(
    provider: string,
    record: {
      readonly recordType: string;
      readonly externalId: string | null;
      readonly slug: string | null;
    },
  ): Promise<void> {
    parseExternalProvider(provider);

    if (record.externalId === null) {
      throw new Error('Cannot retry record without external id');
    }

    if (record.recordType === 'CLUB') {
      await this.importTeamUseCase.execute({
        provider,
        slug: record.slug ?? record.externalId,
        externalId: record.externalId,
      });
      return;
    }

    if (record.recordType === 'PLAYER') {
      await this.syncPlayerProfileUseCase.execute({
        provider,
        externalId: record.externalId,
        ...(record.slug !== null ? { slug: record.slug } : {}),
      });
      return;
    }

    if (record.recordType === 'COMPETITION') {
      throw new Error('Competition retries require full pipeline — use import competition endpoint');
    }

    await this.importPlayerUseCase.execute({
      provider,
      slug: record.slug ?? record.externalId,
      externalId: record.externalId,
    });
  }
}
