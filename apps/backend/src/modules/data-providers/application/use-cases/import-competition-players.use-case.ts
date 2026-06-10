import { parseExternalProvider } from '../../../../core/external-reference/external-provider';
import type { LeagueRepository } from '../../../leagues/domain/repositories/league.repository';
import type { TeamRepository } from '../../../teams/domain/repositories/team.repository';
import { findTargetCompetitionByExternalId } from '../../domain/catalog/target-competitions.catalog';
import { ImportJobType } from '../../domain/enums/import-job-type';
import type { ImportFailedRecordRepository } from '../../domain/repositories/import-failed-record.repository';
import type { ImportJobLogRepository } from '../../domain/repositories/import-job-log.repository';
import type { ImportJobRepository } from '../../domain/repositories/import-job.repository';
import { ImportJobId } from '../../domain/value-objects/import-job-id.vo';
import { buildImportJobTrackerDeps } from '../services/import-job-tracker.factory';
import { ImportJobTracker } from '../services/import-job-tracker.service';

import type { ImportClubPlayersUseCase } from './import-club-players.use-case';

export interface ImportCompetitionPlayersCommand {
  readonly provider: string;
  readonly competitionExternalId: string;
}

export class ImportCompetitionPlayersUseCase {
  constructor(
    private readonly leagueRepository: LeagueRepository,
    private readonly teamRepository: TeamRepository,
    private readonly importClubPlayersUseCase: ImportClubPlayersUseCase,
    private readonly importJobRepository: ImportJobRepository,
    private readonly importJobLogRepository: ImportJobLogRepository,
    private readonly importFailedRecordRepository: ImportFailedRecordRepository,
  ) {}

  async execute(command: ImportCompetitionPlayersCommand): Promise<ImportJobTracker> {
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
      throw new Error(
        `Competition ${command.competitionExternalId} is not imported yet. Import competition first.`,
      );
    }

    const teams = await this.teamRepository.findByLeagueId(league.id.value);

    const tracker = await ImportJobTracker.create(
      buildImportJobTrackerDeps(
        this.importJobRepository,
        this.importJobLogRepository,
        this.importFailedRecordRepository,
      ),
      {
        id: ImportJobId.generate(),
        jobType: ImportJobType.PLAYERS,
        provider: command.provider,
        targetExternalId: target.externalId,
        targetName: target.name,
      },
    );

    await tracker.start(teams.length);
    await tracker.log(`Importing rosters for ${String(teams.length)} clubs`);

    for (const team of teams) {
      const clubExternalId = team.externalReference?.externalId ?? null;

      if (clubExternalId === null) {
        await tracker.recordFailure('Team has no external id', {
          recordType: 'CLUB',
          displayName: team.name.value,
        });
        continue;
      }

      try {
        const result = await this.importClubPlayersUseCase.execute({
          provider: command.provider,
          clubExternalId,
          leagueExternalId: command.competitionExternalId,
        });

        if (result.failed > 0) {
          await tracker.recordFailure(
            `${team.name.value}: ${String(result.imported)} imported, ${String(result.failed)} failed`,
            {
              recordType: 'CLUB',
              externalId: clubExternalId,
              displayName: team.name.value,
            },
          );
        } else {
          await tracker.recordSuccess(
            `${team.name.value}: ${String(result.imported)} players imported`,
          );
        }
      } catch (error) {
        await tracker.recordFailure(
          error instanceof Error ? error.message : 'Roster import failed',
          {
            recordType: 'CLUB',
            externalId: clubExternalId,
            displayName: team.name.value,
          },
        );
      }
    }

    await tracker.complete();
    return tracker;
  }
}
