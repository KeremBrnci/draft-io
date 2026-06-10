import { parseExternalProvider } from '../../../../core/external-reference/external-provider';
import type { LeagueRepository } from '../../../leagues/domain/repositories/league.repository';
import { TARGET_COMPETITIONS } from '../../domain/catalog/target-competitions.catalog';
import { CompetitionAlreadyImportedError } from '../../domain/errors/import.errors';
import { ImportJobType } from '../../domain/enums/import-job-type';
import type { ImportFailedRecordRepository } from '../../domain/repositories/import-failed-record.repository';
import type { ImportJobLogRepository } from '../../domain/repositories/import-job-log.repository';
import type { ImportJobRepository } from '../../domain/repositories/import-job.repository';
import { ImportJobId } from '../../domain/value-objects/import-job-id.vo';
import { buildImportJobTrackerDeps } from '../services/import-job-tracker.factory';
import { ImportJobTracker } from '../services/import-job-tracker.service';
import type { ImportCompetitionPipelineUseCase } from './import-competition-pipeline.use-case';

export interface ImportAllTargetCompetitionsCommand {
  readonly provider: string;
}

export class ImportAllTargetCompetitionsUseCase {
  constructor(
    private readonly leagueRepository: LeagueRepository,
    private readonly importCompetitionPipelineUseCase: ImportCompetitionPipelineUseCase,
    private readonly importJobRepository: ImportJobRepository,
    private readonly importJobLogRepository: ImportJobLogRepository,
    private readonly importFailedRecordRepository: ImportFailedRecordRepository,
  ) {}

  async schedule(command: ImportAllTargetCompetitionsCommand): Promise<ImportJobTracker> {
    const tracker = await this.start(command);
    void this.run(command, tracker).catch(() => undefined);
    return tracker;
  }

  async execute(command: ImportAllTargetCompetitionsCommand): Promise<ImportJobTracker> {
    const tracker = await this.start(command);
    await this.run(command, tracker);
    return tracker;
  }

  private async start(command: ImportAllTargetCompetitionsCommand): Promise<ImportJobTracker> {
    const tracker = await ImportJobTracker.create(
      buildImportJobTrackerDeps(
        this.importJobRepository,
        this.importJobLogRepository,
        this.importFailedRecordRepository,
      ),
      {
        id: ImportJobId.generate(),
        jobType: ImportJobType.PIPELINE,
        provider: command.provider,
        targetExternalId: null,
        targetName: 'All target competitions',
      },
    );

    await tracker.start(TARGET_COMPETITIONS.length);
    await tracker.log(`Importing ${String(TARGET_COMPETITIONS.length)} target competitions`);
    return tracker;
  }

  private async run(
    command: ImportAllTargetCompetitionsCommand,
    tracker: ImportJobTracker,
  ): Promise<void> {
    const provider = parseExternalProvider(command.provider);

    for (const competition of TARGET_COMPETITIONS) {
      const existing = await this.leagueRepository.findByExternalReference(
        provider,
        competition.externalId,
      );

      if (existing !== null) {
        await tracker.log(`Skipping ${competition.name} — already imported`);
        await tracker.recordSuccess(`${competition.name} skipped (already imported)`);
        continue;
      }

      try {
        await tracker.log(`Pipeline: ${competition.name}`);
        await this.importCompetitionPipelineUseCase.execute({
          provider: command.provider,
          competitionExternalId: competition.externalId,
        });
        await tracker.recordSuccess(`${competition.name} completed`);
      } catch (error) {
        if (error instanceof CompetitionAlreadyImportedError) {
          await tracker.log(`Skipping ${competition.name} — already imported`);
          await tracker.recordSuccess(`${competition.name} skipped (already imported)`);
          continue;
        }

        await tracker.recordFailure(
          error instanceof Error ? error.message : `Failed: ${competition.name}`,
          {
            recordType: 'COMPETITION',
            externalId: competition.externalId,
            displayName: competition.name,
          },
        );
      }
    }

    await tracker.complete();
  }
}
