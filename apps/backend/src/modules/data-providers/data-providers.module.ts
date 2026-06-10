import { Module } from '@nestjs/common';

import { provideUseCase } from '../../common/nest/provide-use-case';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { CoachesModule } from '../coaches/coaches.module';
import { COACH_REPOSITORY } from '../coaches/domain/repositories/coach.repository';
import { LEAGUE_REPOSITORY } from '../leagues/domain/repositories/league.repository';
import { LeaguesModule } from '../leagues/leagues.module';
import { NATION_REPOSITORY } from '../nations/domain/repositories/nation.repository';
import { NationsModule } from '../nations/nations.module';
import { PLAYER_REPOSITORY } from '../players/domain/repositories/player.repository';
import { PlayersModule } from '../players/players.module';
import { TEAM_REPOSITORY } from '../teams/domain/repositories/team.repository';
import { TeamsModule } from '../teams/teams.module';

import { EnrichCompetitionPlayersUseCase } from './application/use-cases/enrich-competition-players.use-case';
import { EnrichPlayersFromSquadUseCase } from './application/use-cases/enrich-players-from-squad.use-case';
import { GetAdminDashboardMetricsUseCase } from './application/use-cases/get-admin-dashboard-metrics.use-case';
import { GetImportJobUseCase } from './application/use-cases/get-import-job.use-case';
import { ImportAllTargetCompetitionsUseCase } from './application/use-cases/import-all-target-competitions.use-case';
import { ImportClubPlayersUseCase } from './application/use-cases/import-club-players.use-case';
import { ImportCompetitionClubsUseCase } from './application/use-cases/import-competition-clubs.use-case';
import { ImportCompetitionPipelineUseCase } from './application/use-cases/import-competition-pipeline.use-case';
import { ImportCompetitionPlayersUseCase } from './application/use-cases/import-competition-players.use-case';
import { ImportCompetitionsByCountryUseCase } from './application/use-cases/import-competitions-by-country.use-case';
import { ImportCountriesUseCase } from './application/use-cases/import-countries.use-case';
import { ImportLeagueUseCase } from './application/use-cases/import-league.use-case';
import { ImportLeaguesBatchUseCase } from './application/use-cases/import-leagues-batch.use-case';
import { ImportPlayerUseCase } from './application/use-cases/import-player.use-case';
import { ImportPlayersBatchUseCase } from './application/use-cases/import-players-batch.use-case';
import { ImportTargetCompetitionUseCase } from './application/use-cases/import-target-competition.use-case';
import { ImportTeamUseCase } from './application/use-cases/import-team.use-case';
import { ImportTeamsBatchUseCase } from './application/use-cases/import-teams-batch.use-case';
import { ListCompetitionsByCountryUseCase } from './application/use-cases/list-competitions-by-country.use-case';
import { ListImportFailedRecordsUseCase } from './application/use-cases/list-import-failed-records.use-case';
import { ListImportJobLogsUseCase } from './application/use-cases/list-import-job-logs.use-case';
import { ListImportJobsUseCase } from './application/use-cases/list-import-jobs.use-case';
import { ListProviderCountriesUseCase } from './application/use-cases/list-provider-countries.use-case';
import { ListTargetCompetitionsUseCase } from './application/use-cases/list-target-competitions.use-case';
import { ReconcileImportFailedRecordsUseCase } from './application/use-cases/reconcile-import-failed-records.use-case';
import { RetryImportJobUseCase } from './application/use-cases/retry-import-job.use-case';
import { SearchLeaguesUseCase } from './application/use-cases/search-leagues.use-case';
import { SearchPlayersUseCase } from './application/use-cases/search-players.use-case';
import { SearchTeamsUseCase } from './application/use-cases/search-teams.use-case';
import { SyncCoachesFromStaffUseCase } from './application/use-cases/sync-coaches-from-staff.use-case';
import { SyncMissingSquadPlayersUseCase } from './application/use-cases/sync-missing-squad-players.use-case';
import { SyncPlayerPositionsUseCase } from './application/use-cases/sync-player-positions.use-case';
import { SyncPlayerProfileUseCase } from './application/use-cases/sync-player-profile.use-case';
import { PROVIDER_REGISTRY } from './domain/ports/provider-registry.port';
import { IMPORT_FAILED_RECORD_REPOSITORY } from './domain/repositories/import-failed-record.repository';
import { IMPORT_JOB_LOG_REPOSITORY } from './domain/repositories/import-job-log.repository';
import { IMPORT_JOB_REPOSITORY } from './domain/repositories/import-job.repository';
import { PrismaImportFailedRecordRepository } from './infrastructure/persistence/prisma-import-failed-record.repository';
import { PrismaImportJobLogRepository } from './infrastructure/persistence/prisma-import-job-log.repository';
import { PrismaImportJobRepository } from './infrastructure/persistence/prisma-import-job.repository';
import { ProviderRegistry } from './infrastructure/provider-registry';
import { SportDbConfigService } from './infrastructure/sportdb/config/sportdb.config';
import { SportDbHttpClient } from './infrastructure/sportdb/http/sportdb-http.client';
import { SportDbLeagueProvider } from './infrastructure/sportdb/providers/sportdb-league.provider';
import { SportDbPlayerProvider } from './infrastructure/sportdb/providers/sportdb-player.provider';
import { SportDbTeamProvider } from './infrastructure/sportdb/providers/sportdb-team.provider';
import { TransfermarktConfigService } from './infrastructure/transfermarkt/config/transfermarkt.config';
import { TransfermarktHttpClient } from './infrastructure/transfermarkt/http/transfermarkt-http.client';
import { TransfermarktCountryProvider } from './infrastructure/transfermarkt/providers/transfermarkt-country.provider';
import { TransfermarktLeagueProvider } from './infrastructure/transfermarkt/providers/transfermarkt-league.provider';
import { TransfermarktPlayerProvider } from './infrastructure/transfermarkt/providers/transfermarkt-player.provider';
import { TransfermarktTeamProvider } from './infrastructure/transfermarkt/providers/transfermarkt-team.provider';
import { AdminDashboardController } from './presentation/controllers/admin-dashboard.controller';
import { AdminImportsController } from './presentation/controllers/admin-imports.controller';

const JOB_DEPS = [
  IMPORT_JOB_REPOSITORY,
  IMPORT_JOB_LOG_REPOSITORY,
  IMPORT_FAILED_RECORD_REPOSITORY,
] as const;

@Module({
  imports: [PlayersModule, CoachesModule, TeamsModule, LeaguesModule, NationsModule],
  controllers: [AdminImportsController, AdminDashboardController],
  providers: [
    { provide: IMPORT_JOB_REPOSITORY, useClass: PrismaImportJobRepository },
    { provide: IMPORT_JOB_LOG_REPOSITORY, useClass: PrismaImportJobLogRepository },
    { provide: IMPORT_FAILED_RECORD_REPOSITORY, useClass: PrismaImportFailedRecordRepository },
    SportDbConfigService,
    SportDbHttpClient,
    SportDbPlayerProvider,
    SportDbTeamProvider,
    SportDbLeagueProvider,
    TransfermarktConfigService,
    TransfermarktHttpClient,
    TransfermarktCountryProvider,
    TransfermarktPlayerProvider,
    TransfermarktTeamProvider,
    TransfermarktLeagueProvider,
    ProviderRegistry,
    { provide: PROVIDER_REGISTRY, useExisting: ProviderRegistry },
    provideUseCase(ImportLeagueUseCase, [PROVIDER_REGISTRY, LEAGUE_REPOSITORY, NATION_REPOSITORY]),
    provideUseCase(ImportTeamUseCase, [
      PROVIDER_REGISTRY,
      TEAM_REPOSITORY,
      LEAGUE_REPOSITORY,
      NATION_REPOSITORY,
    ]),
    provideUseCase(ImportPlayerUseCase, [
      PROVIDER_REGISTRY,
      PLAYER_REPOSITORY,
      TEAM_REPOSITORY,
      LEAGUE_REPOSITORY,
    ]),
    provideUseCase(SearchPlayersUseCase, [PROVIDER_REGISTRY]),
    provideUseCase(SearchTeamsUseCase, [PROVIDER_REGISTRY]),
    provideUseCase(SearchLeaguesUseCase, [PROVIDER_REGISTRY]),
    provideUseCase(ListProviderCountriesUseCase, [PROVIDER_REGISTRY, NATION_REPOSITORY]),
    provideUseCase(ImportCountriesUseCase, [PROVIDER_REGISTRY, NATION_REPOSITORY]),
    provideUseCase(ListCompetitionsByCountryUseCase, [PROVIDER_REGISTRY]),
    provideUseCase(ImportCompetitionsByCountryUseCase, [
      ListCompetitionsByCountryUseCase,
      ImportLeagueUseCase,
    ]),
    provideUseCase(SyncPlayerProfileUseCase, [PROVIDER_REGISTRY, ImportPlayerUseCase]),
    provideUseCase(ImportClubPlayersUseCase, [
      PROVIDER_REGISTRY,
      TEAM_REPOSITORY,
      ImportPlayerUseCase,
    ]),
    provideUseCase(SyncMissingSquadPlayersUseCase, [
      TEAM_REPOSITORY,
      LEAGUE_REPOSITORY,
      PLAYER_REPOSITORY,
      ImportPlayerUseCase,
    ]),
    provideUseCase(EnrichPlayersFromSquadUseCase, [
      TEAM_REPOSITORY,
      LEAGUE_REPOSITORY,
      PLAYER_REPOSITORY,
      ImportPlayerUseCase,
    ]),
    provideUseCase(SyncCoachesFromStaffUseCase, [TEAM_REPOSITORY, COACH_REPOSITORY, PrismaService]),
    provideUseCase(SyncPlayerPositionsUseCase, [
      PLAYER_REPOSITORY,
      TEAM_REPOSITORY,
      LEAGUE_REPOSITORY,
      ImportPlayerUseCase,
    ]),
    provideUseCase(ImportLeaguesBatchUseCase, [ImportLeagueUseCase]),
    provideUseCase(ImportTeamsBatchUseCase, [ImportTeamUseCase]),
    provideUseCase(ImportPlayersBatchUseCase, [ImportPlayerUseCase]),
    provideUseCase(ListTargetCompetitionsUseCase, [LEAGUE_REPOSITORY, IMPORT_JOB_REPOSITORY]),
    provideUseCase(ImportTargetCompetitionUseCase, [ImportLeagueUseCase, ...JOB_DEPS]),
    provideUseCase(ImportCompetitionClubsUseCase, [
      PROVIDER_REGISTRY,
      TEAM_REPOSITORY,
      ImportTeamUseCase,
      ...JOB_DEPS,
    ]),
    provideUseCase(ImportCompetitionPlayersUseCase, [
      LEAGUE_REPOSITORY,
      TEAM_REPOSITORY,
      ImportClubPlayersUseCase,
      ...JOB_DEPS,
    ]),
    provideUseCase(EnrichCompetitionPlayersUseCase, [
      LEAGUE_REPOSITORY,
      PLAYER_REPOSITORY,
      SyncPlayerProfileUseCase,
      ...JOB_DEPS,
    ]),
    provideUseCase(ImportCompetitionPipelineUseCase, [
      LEAGUE_REPOSITORY,
      ImportTargetCompetitionUseCase,
      ImportCompetitionClubsUseCase,
      ImportCompetitionPlayersUseCase,
      EnrichCompetitionPlayersUseCase,
      ...JOB_DEPS,
    ]),
    provideUseCase(ImportAllTargetCompetitionsUseCase, [
      LEAGUE_REPOSITORY,
      ImportCompetitionPipelineUseCase,
      ...JOB_DEPS,
    ]),
    provideUseCase(ReconcileImportFailedRecordsUseCase, [
      IMPORT_FAILED_RECORD_REPOSITORY,
      TEAM_REPOSITORY,
      PLAYER_REPOSITORY,
    ]),
    provideUseCase(GetImportJobUseCase, [IMPORT_JOB_REPOSITORY]),
    provideUseCase(ListImportJobsUseCase, [IMPORT_JOB_REPOSITORY]),
    provideUseCase(ListImportJobLogsUseCase, [IMPORT_JOB_LOG_REPOSITORY]),
    provideUseCase(ListImportFailedRecordsUseCase, [
      IMPORT_FAILED_RECORD_REPOSITORY,
      IMPORT_JOB_REPOSITORY,
      ReconcileImportFailedRecordsUseCase,
    ]),
    provideUseCase(RetryImportJobUseCase, [
      IMPORT_JOB_REPOSITORY,
      IMPORT_JOB_LOG_REPOSITORY,
      IMPORT_FAILED_RECORD_REPOSITORY,
      ImportTeamUseCase,
      ImportPlayerUseCase,
      SyncPlayerProfileUseCase,
    ]),
    provideUseCase(GetAdminDashboardMetricsUseCase, [
      PLAYER_REPOSITORY,
      TEAM_REPOSITORY,
      LEAGUE_REPOSITORY,
      IMPORT_JOB_REPOSITORY,
    ]),
  ],
  exports: [
    ImportPlayerUseCase,
    ImportTeamUseCase,
    ImportLeagueUseCase,
    ImportCountriesUseCase,
    ImportCompetitionsByCountryUseCase,
    ImportClubPlayersUseCase,
    ImportAllTargetCompetitionsUseCase,
    SyncPlayerProfileUseCase,
    SyncMissingSquadPlayersUseCase,
    EnrichPlayersFromSquadUseCase,
    SyncCoachesFromStaffUseCase,
    SyncPlayerPositionsUseCase,
    PROVIDER_REGISTRY,
    ProviderRegistry,
  ],
})
export class DataProvidersModule {}
