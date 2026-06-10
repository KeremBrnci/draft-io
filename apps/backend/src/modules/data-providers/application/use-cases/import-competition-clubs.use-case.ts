import { parseExternalProvider } from '../../../../core/external-reference/external-provider';
import type { TeamRepository } from '../../../teams/domain/repositories/team.repository';
import { findTargetCompetitionByExternalId } from '../../domain/catalog/target-competitions.catalog';
import { ImportJobType } from '../../domain/enums/import-job-type';
import { ProviderConfigurationError } from '../../domain/errors/data-provider.errors';
import type { ProviderRegistryPort } from '../../domain/ports/provider-registry.port';
import type { ImportFailedRecordRepository } from '../../domain/repositories/import-failed-record.repository';
import type { ImportJobLogRepository } from '../../domain/repositories/import-job-log.repository';
import type { ImportJobRepository } from '../../domain/repositories/import-job.repository';
import { ImportJobId } from '../../domain/value-objects/import-job-id.vo';
import { buildImportJobTrackerDeps } from '../services/import-job-tracker.factory';
import { ImportJobTracker } from '../services/import-job-tracker.service';

import type { ImportTeamUseCase } from './import-team.use-case';

export interface ImportCompetitionClubsCommand {
  readonly provider: string;
  readonly competitionExternalId: string;
}

export class ImportCompetitionClubsUseCase {
  constructor(
    private readonly providerRegistry: ProviderRegistryPort,
    private readonly teamRepository: TeamRepository,
    private readonly importTeamUseCase: ImportTeamUseCase,
    private readonly importJobRepository: ImportJobRepository,
    private readonly importJobLogRepository: ImportJobLogRepository,
    private readonly importFailedRecordRepository: ImportFailedRecordRepository,
  ) {}

  async execute(command: ImportCompetitionClubsCommand): Promise<ImportJobTracker> {
    const provider = parseExternalProvider(command.provider);

    const target = findTargetCompetitionByExternalId(command.competitionExternalId);

    if (target === undefined) {
      throw new Error(`Unknown target competition: ${command.competitionExternalId}`);
    }

    const teamProvider = this.providerRegistry.getTeamProvider(command.provider);

    if (teamProvider.listClubsByCompetition === undefined) {
      throw new ProviderConfigurationError(
        `Provider ${command.provider} does not support competition club listing`,
      );
    }

    const clubs = await teamProvider.listClubsByCompetition(command.competitionExternalId);

    const tracker = await ImportJobTracker.create(
      buildImportJobTrackerDeps(
        this.importJobRepository,
        this.importJobLogRepository,
        this.importFailedRecordRepository,
      ),
      {
        id: ImportJobId.generate(),
        jobType: ImportJobType.CLUBS,
        provider: command.provider,
        targetExternalId: target.externalId,
        targetName: target.name,
      },
    );

    await tracker.start(clubs.length);
    await tracker.log(`Importing ${String(clubs.length)} clubs for ${target.name}`);

    for (const club of clubs) {
      const existing = await this.teamRepository.findByExternalReference(provider, club.externalId);

      if (existing !== null) {
        await tracker.recordSuccess(`Club already imported: ${club.name}`);
        continue;
      }

      try {
        await this.importTeamUseCase.execute({
          provider: command.provider,
          slug: club.slug,
          externalId: club.externalId,
        });
        await tracker.recordSuccess(`Imported club ${club.name}`);
      } catch (error) {
        await tracker.recordFailure(error instanceof Error ? error.message : 'Club import failed', {
          recordType: 'CLUB',
          externalId: club.externalId,
          slug: club.slug,
          displayName: club.name,
        });
      }
    }

    await tracker.complete();
    return tracker;
  }
}
