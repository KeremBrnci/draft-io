import { parseExternalProvider } from '../../../../core/external-reference/external-provider';
import { findTargetCompetitionByExternalId } from '../../domain/catalog/target-competitions.catalog';
import { ImportJobType } from '../../domain/enums/import-job-type';
import type { ImportFailedRecordRepository } from '../../domain/repositories/import-failed-record.repository';
import type { ImportJobLogRepository } from '../../domain/repositories/import-job-log.repository';
import type { ImportJobRepository } from '../../domain/repositories/import-job.repository';
import { ImportJobId } from '../../domain/value-objects/import-job-id.vo';
import { buildImportJobTrackerDeps } from '../services/import-job-tracker.factory';
import { ImportJobTracker } from '../services/import-job-tracker.service';

import type { ImportLeagueUseCase } from './import-league.use-case';

export interface ImportTargetCompetitionCommand {
  readonly provider: string;
  readonly competitionExternalId: string;
}

export class ImportTargetCompetitionUseCase {
  constructor(
    private readonly importLeagueUseCase: ImportLeagueUseCase,
    private readonly importJobRepository: ImportJobRepository,
    private readonly importJobLogRepository: ImportJobLogRepository,
    private readonly importFailedRecordRepository: ImportFailedRecordRepository,
  ) {}

  async execute(command: ImportTargetCompetitionCommand): Promise<ImportJobTracker> {
    parseExternalProvider(command.provider);

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
        jobType: ImportJobType.COMPETITION,
        provider: command.provider,
        targetExternalId: target.externalId,
        targetName: target.name,
      },
    );

    await tracker.start(1);

    try {
      await this.importLeagueUseCase.execute({
        provider: command.provider,
        slug: target.slug,
        externalId: target.externalId,
        name: target.name,
        country: target.countryName,
        countryExternalId: target.countryExternalId,
      });
      await tracker.recordSuccess(`Imported competition ${target.name}`);
      await tracker.complete();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Competition import failed';
      await tracker.recordFailure(message, {
        recordType: 'COMPETITION',
        externalId: target.externalId,
        displayName: target.name,
      });
      await tracker.fail(message);
      throw error;
    }

    return tracker;
  }
}
