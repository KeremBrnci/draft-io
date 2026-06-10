import { parseExternalProvider } from '../../../../core/external-reference/external-provider';
import type { LeagueRepository } from '../../../leagues/domain/repositories/league.repository';
import type { PlayerRepository } from '../../../players/domain/repositories/player.repository';
import { findTargetCompetitionByExternalId } from '../../domain/catalog/target-competitions.catalog';
import { ImportJobType } from '../../domain/enums/import-job-type';
import type { ImportFailedRecordRepository } from '../../domain/repositories/import-failed-record.repository';
import type { ImportJobLogRepository } from '../../domain/repositories/import-job-log.repository';
import type { ImportJobRepository } from '../../domain/repositories/import-job.repository';
import { ImportJobId } from '../../domain/value-objects/import-job-id.vo';
import { buildImportJobTrackerDeps } from '../services/import-job-tracker.factory';
import { ImportJobTracker } from '../services/import-job-tracker.service';

import type { SyncPlayerProfileUseCase } from './sync-player-profile.use-case';

export interface EnrichCompetitionPlayersCommand {
  readonly provider: string;
  readonly competitionExternalId: string;
}

export class EnrichCompetitionPlayersUseCase {
  constructor(
    private readonly leagueRepository: LeagueRepository,
    private readonly playerRepository: PlayerRepository,
    private readonly syncPlayerProfileUseCase: SyncPlayerProfileUseCase,
    private readonly importJobRepository: ImportJobRepository,
    private readonly importJobLogRepository: ImportJobLogRepository,
    private readonly importFailedRecordRepository: ImportFailedRecordRepository,
  ) {}

  async execute(command: EnrichCompetitionPlayersCommand): Promise<ImportJobTracker> {
    const provider = parseExternalProvider(command.provider);
    const target = findTargetCompetitionByExternalId(command.competitionExternalId);

    if (target === undefined) {
      throw new Error(`Unknown target competition: ${command.competitionExternalId}`);
    }

    const league = await this.leagueRepository.findByExternalReference(
      provider,
      command.competitionExternalId,
    );

    if (league === null) {
      throw new Error(`Competition ${command.competitionExternalId} is not imported yet.`);
    }

    const players = (
      await this.playerRepository.findPaginated(
        { leagueId: league.id.value },
        { field: 'name', direction: 'asc' },
        { page: 1, pageSize: 10_000 },
      )
    ).items;

    const tracker = await ImportJobTracker.create(
      buildImportJobTrackerDeps(
        this.importJobRepository,
        this.importJobLogRepository,
        this.importFailedRecordRepository,
      ),
      {
        id: ImportJobId.generate(),
        jobType: ImportJobType.ENRICHMENT,
        provider: command.provider,
        targetExternalId: target.externalId,
        targetName: target.name,
      },
    );

    await tracker.start(players.length);
    await tracker.log('Starting player profile enrichment');

    for (const player of players) {
      const externalId = player.externalReference?.externalId;

      if (externalId === undefined) {
        await tracker.recordFailure('Player has no external id', {
          recordType: 'PLAYER',
          displayName: player.displayName.value,
        });
        continue;
      }

      try {
        await this.syncPlayerProfileUseCase.execute({
          provider: command.provider,
          externalId,
        });
        await tracker.recordSuccess(`Enriched ${player.displayName.value}`);
      } catch (error) {
        await tracker.recordFailure(error instanceof Error ? error.message : 'Enrichment failed', {
          recordType: 'PLAYER',
          externalId,
          displayName: player.displayName.value,
        });
      }
    }

    await tracker.complete();
    return tracker;
  }
}
