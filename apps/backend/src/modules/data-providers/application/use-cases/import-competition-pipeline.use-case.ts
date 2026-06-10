import { parseExternalProvider } from '../../../../core/external-reference/external-provider';
import type { LeagueRepository } from '../../../leagues/domain/repositories/league.repository';
import { findTargetCompetitionByExternalId } from '../../domain/catalog/target-competitions.catalog';
import { ImportJobType } from '../../domain/enums/import-job-type';
import { CompetitionAlreadyImportedError } from '../../domain/errors/import.errors';
import type { ImportFailedRecordRepository } from '../../domain/repositories/import-failed-record.repository';
import type { ImportJobLogRepository } from '../../domain/repositories/import-job-log.repository';
import type { ImportJobRepository } from '../../domain/repositories/import-job.repository';
import { ImportJobId } from '../../domain/value-objects/import-job-id.vo';
import { buildImportJobTrackerDeps } from '../services/import-job-tracker.factory';
import { ImportJobTracker } from '../services/import-job-tracker.service';

import type { EnrichCompetitionPlayersUseCase } from './enrich-competition-players.use-case';
import type { ImportCompetitionClubsUseCase } from './import-competition-clubs.use-case';
import type { ImportCompetitionPlayersUseCase } from './import-competition-players.use-case';
import type { ImportTargetCompetitionUseCase } from './import-target-competition.use-case';

export interface ImportCompetitionPipelineCommand {
  readonly provider: string;
  readonly competitionExternalId: string;
}

/** Competition → clubs → players → profile enrichment (idempotent upserts). */
export class ImportCompetitionPipelineUseCase {
  constructor(
    private readonly leagueRepository: LeagueRepository,
    private readonly importTargetCompetitionUseCase: ImportTargetCompetitionUseCase,
    private readonly importCompetitionClubsUseCase: ImportCompetitionClubsUseCase,
    private readonly importCompetitionPlayersUseCase: ImportCompetitionPlayersUseCase,
    private readonly enrichCompetitionPlayersUseCase: EnrichCompetitionPlayersUseCase,
    private readonly importJobRepository: ImportJobRepository,
    private readonly importJobLogRepository: ImportJobLogRepository,
    private readonly importFailedRecordRepository: ImportFailedRecordRepository,
  ) {}

  async schedule(command: ImportCompetitionPipelineCommand): Promise<ImportJobTracker> {
    await this.assertNotAlreadyImported(command);
    const tracker = await this.start(command);
    void this.run(command, tracker).catch(() => undefined);
    return tracker;
  }

  async execute(command: ImportCompetitionPipelineCommand): Promise<ImportJobTracker> {
    await this.assertNotAlreadyImported(command);
    const tracker = await this.start(command);
    await this.run(command, tracker);
    return tracker;
  }

  private async start(command: ImportCompetitionPipelineCommand): Promise<ImportJobTracker> {
    const target = findTargetCompetitionByExternalId(command.competitionExternalId);

    if (target === undefined) {
      throw new Error(`Unknown target competition: ${command.competitionExternalId}`);
    }

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
        targetExternalId: target.externalId,
        targetName: target.name,
      },
    );

    const stepCount = process.env.IMPORT_SKIP_ENRICHMENT === '1' ? 3 : 4;
    await tracker.start(stepCount);
    await tracker.log(`Pipeline started for ${target.name}`);
    return tracker;
  }

  private async run(
    command: ImportCompetitionPipelineCommand,
    tracker: ImportJobTracker,
  ): Promise<void> {
    const target = findTargetCompetitionByExternalId(command.competitionExternalId);

    if (target === undefined) {
      await tracker.fail(`Unknown target competition: ${command.competitionExternalId}`);
      return;
    }

    const skipEnrichment = process.env.IMPORT_SKIP_ENRICHMENT === '1';

    const steps = [
      { label: 'competition', run: () => this.importTargetCompetitionUseCase.execute(command) },
      { label: 'clubs', run: () => this.importCompetitionClubsUseCase.execute(command) },
      { label: 'players', run: () => this.importCompetitionPlayersUseCase.execute(command) },
      ...(skipEnrichment
        ? []
        : [
            {
              label: 'enrichment' as const,
              run: () => this.enrichCompetitionPlayersUseCase.execute(command),
            },
          ]),
    ];

    for (const step of steps) {
      try {
        await tracker.log(`Running step: ${step.label}`);
        const childTracker = await step.run();
        if (childTracker.entity.failedRecords > 0) {
          await tracker.recordFailure(`${step.label} completed with failures`, {
            recordType: 'COMPETITION',
            externalId: target.externalId,
            displayName: target.name,
          });
        } else {
          await tracker.recordSuccess(`${step.label} completed`);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : `${step.label} failed`;
        await tracker.recordFailure(message, {
          recordType: 'COMPETITION',
          externalId: target.externalId,
          displayName: target.name,
        });
        await tracker.fail(message);
        return;
      }
    }

    await tracker.complete();
  }

  private async assertNotAlreadyImported(command: ImportCompetitionPipelineCommand): Promise<void> {
    const target = findTargetCompetitionByExternalId(command.competitionExternalId);

    if (target === undefined) {
      return;
    }

    const provider = parseExternalProvider(command.provider);
    const existing = await this.leagueRepository.findByExternalReference(
      provider,
      command.competitionExternalId,
    );

    if (existing !== null) {
      throw new CompetitionAlreadyImportedError(target.name);
    }
  }
}
