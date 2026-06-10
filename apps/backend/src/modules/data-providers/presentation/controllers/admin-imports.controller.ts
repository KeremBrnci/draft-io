import type {
  ApiResponse,
  ImportFailedRecordDto,
  ImportJobDto,
  ImportJobLogDto,
  ImportJobResultDto,
  TargetCompetitionDto,
} from '@draft-io/shared-types';
import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';

import { ImportClubPlayersUseCase } from '../../application/use-cases/import-club-players.use-case';
import { EnrichPlayersFromSquadUseCase } from '../../application/use-cases/enrich-players-from-squad.use-case';
import { SyncMissingSquadPlayersUseCase } from '../../application/use-cases/sync-missing-squad-players.use-case';
import { ImportCompetitionClubsUseCase } from '../../application/use-cases/import-competition-clubs.use-case';
import { ImportCompetitionPlayersUseCase } from '../../application/use-cases/import-competition-players.use-case';
import { ImportCompetitionsByCountryUseCase } from '../../application/use-cases/import-competitions-by-country.use-case';
import { ImportCountriesUseCase } from '../../application/use-cases/import-countries.use-case';
import { ImportPlayerUseCase } from '../../application/use-cases/import-player.use-case';
import { ImportTargetCompetitionUseCase } from '../../application/use-cases/import-target-competition.use-case';
import { ImportTeamUseCase } from '../../application/use-cases/import-team.use-case';
import { GetImportJobUseCase } from '../../application/use-cases/get-import-job.use-case';
import { ImportAllTargetCompetitionsUseCase } from '../../application/use-cases/import-all-target-competitions.use-case';
import { ImportCompetitionPipelineUseCase } from '../../application/use-cases/import-competition-pipeline.use-case';
import { ListCompetitionsByCountryUseCase } from '../../application/use-cases/list-competitions-by-country.use-case';
import { ListImportFailedRecordsUseCase } from '../../application/use-cases/list-import-failed-records.use-case';
import { ListImportJobLogsUseCase } from '../../application/use-cases/list-import-job-logs.use-case';
import { ListImportJobsUseCase } from '../../application/use-cases/list-import-jobs.use-case';
import { RetryImportJobUseCase } from '../../application/use-cases/retry-import-job.use-case';
import { ListProviderCountriesUseCase } from '../../application/use-cases/list-provider-countries.use-case';
import { ListTargetCompetitionsUseCase } from '../../application/use-cases/list-target-competitions.use-case';
import { SearchLeaguesUseCase } from '../../application/use-cases/search-leagues.use-case';
import { SearchPlayersUseCase } from '../../application/use-cases/search-players.use-case';
import { SearchTeamsUseCase } from '../../application/use-cases/search-teams.use-case';
import { SyncPlayerProfileUseCase } from '../../application/use-cases/sync-player-profile.use-case';
import { CountryExternalIdDto } from '../dto/country-external-id.dto';
import { ImportClubPlayersDto } from '../dto/import-club-players.dto';
import { SyncMissingSquadPlayersDto } from '../dto/sync-missing-squad-players.dto';
import { ImportCompetitionDto } from '../dto/import-competition.dto';
import { ImportPlayerDto } from '../dto/import-player.dto';
import { ImportTeamDto } from '../dto/import-team.dto';
import { ProviderOnlyDto } from '../dto/provider-only.dto';
import { ProviderSearchQueryDto } from '../dto/provider-search-query.dto';
import {
  toImportFailedRecordDto,
  toImportJobDto,
  toImportJobLogDto,
  toImportJobResult,
} from '../mappers/import-job-response.mapper';
import {
  type CountryDto,
  type ImportedPlayerDto,
  type ImportedTeamDto,
  type LeagueSearchResultDto,
  type PlayerSearchResultDto,
  type TeamSearchResultDto,
  toCountryDto,
  toImportedPlayerDto,
  toImportedTeamDto,
  toLeagueSearchResultDto,
  toPlayerSearchResultDto,
  toTeamSearchResultDto,
} from '../mappers/admin-import-response.mapper';

@Controller('admin/imports')
export class AdminImportsController {
  constructor(
    private readonly searchPlayersUseCase: SearchPlayersUseCase,
    private readonly importPlayerUseCase: ImportPlayerUseCase,
    private readonly syncPlayerProfileUseCase: SyncPlayerProfileUseCase,
    private readonly searchTeamsUseCase: SearchTeamsUseCase,
    private readonly importTeamUseCase: ImportTeamUseCase,
    private readonly importClubPlayersUseCase: ImportClubPlayersUseCase,
    private readonly syncMissingSquadPlayersUseCase: SyncMissingSquadPlayersUseCase,
    private readonly enrichPlayersFromSquadUseCase: EnrichPlayersFromSquadUseCase,
    private readonly searchLeaguesUseCase: SearchLeaguesUseCase,
    private readonly listProviderCountriesUseCase: ListProviderCountriesUseCase,
    private readonly importCountriesUseCase: ImportCountriesUseCase,
    private readonly listCompetitionsByCountryUseCase: ListCompetitionsByCountryUseCase,
    private readonly importCompetitionsByCountryUseCase: ImportCompetitionsByCountryUseCase,
    private readonly listTargetCompetitionsUseCase: ListTargetCompetitionsUseCase,
    private readonly importTargetCompetitionUseCase: ImportTargetCompetitionUseCase,
    private readonly importCompetitionClubsUseCase: ImportCompetitionClubsUseCase,
    private readonly importCompetitionPlayersUseCase: ImportCompetitionPlayersUseCase,
    private readonly getImportJobUseCase: GetImportJobUseCase,
    private readonly listImportJobsUseCase: ListImportJobsUseCase,
    private readonly listImportJobLogsUseCase: ListImportJobLogsUseCase,
    private readonly listImportFailedRecordsUseCase: ListImportFailedRecordsUseCase,
    private readonly importCompetitionPipelineUseCase: ImportCompetitionPipelineUseCase,
    private readonly importAllTargetCompetitionsUseCase: ImportAllTargetCompetitionsUseCase,
    private readonly retryImportJobUseCase: RetryImportJobUseCase,
  ) {}

  @Get('target-competitions')
  @HttpCode(HttpStatus.OK)
  async listTargetCompetitions(): Promise<ApiResponse<readonly TargetCompetitionDto[]>> {
    return { data: await this.listTargetCompetitionsUseCase.execute() };
  }

  @Get('jobs')
  @HttpCode(HttpStatus.OK)
  async listImportJobs(): Promise<ApiResponse<readonly ImportJobDto[]>> {
    const jobs = await this.listImportJobsUseCase.execute();
    return { data: jobs.map(toImportJobDto) };
  }

  @Post('target-competitions')
  @HttpCode(HttpStatus.CREATED)
  async importAllTargetCompetitions(
    @Body() dto: ProviderOnlyDto,
  ): Promise<ApiResponse<ImportJobResultDto>> {
    const tracker = await this.importAllTargetCompetitionsUseCase.schedule({
      provider: dto.provider,
    });
    return { data: toImportJobResult(tracker.entity) };
  }

  @Post('competitions/:competitionId')
  @HttpCode(HttpStatus.CREATED)
  async importCompetitionPipeline(
    @Param('competitionId') competitionId: string,
    @Body() dto: ProviderOnlyDto,
  ): Promise<ApiResponse<ImportJobResultDto>> {
    const tracker = await this.importCompetitionPipelineUseCase.schedule({
      provider: dto.provider,
      competitionExternalId: competitionId,
    });
    return { data: toImportJobResult(tracker.entity) };
  }

  @Post('jobs/:jobId/retry')
  @HttpCode(HttpStatus.CREATED)
  async retryImportJob(@Param('jobId') jobId: string): Promise<ApiResponse<ImportJobResultDto>> {
    const tracker = await this.retryImportJobUseCase.execute({ jobId });
    return { data: toImportJobResult(tracker.entity) };
  }

  @Get('jobs/:jobId/logs')
  @HttpCode(HttpStatus.OK)
  async listImportJobLogs(
    @Param('jobId') jobId: string,
  ): Promise<ApiResponse<readonly ImportJobLogDto[]>> {
    const logs = await this.listImportJobLogsUseCase.execute({ jobId });
    return { data: logs.map(toImportJobLogDto) };
  }

  @Get('jobs/:jobId/failed-records')
  @HttpCode(HttpStatus.OK)
  async listImportFailedRecords(
    @Param('jobId') jobId: string,
  ): Promise<ApiResponse<readonly ImportFailedRecordDto[]>> {
    const records = await this.listImportFailedRecordsUseCase.execute({ jobId });
    return { data: records.map(toImportFailedRecordDto) };
  }

  @Post('competition/import')
  @HttpCode(HttpStatus.CREATED)
  async importTargetCompetition(
    @Body() dto: ImportCompetitionDto,
  ): Promise<ApiResponse<ImportJobResultDto>> {
    const tracker = await this.importTargetCompetitionUseCase.execute({
      provider: dto.provider,
      competitionExternalId: dto.competitionExternalId,
    });

    return { data: toImportJobResult(tracker.entity) };
  }

  @Post('competition/import-clubs')
  @HttpCode(HttpStatus.CREATED)
  async importCompetitionClubs(
    @Body() dto: ImportCompetitionDto,
  ): Promise<ApiResponse<ImportJobResultDto>> {
    const tracker = await this.importCompetitionClubsUseCase.execute({
      provider: dto.provider,
      competitionExternalId: dto.competitionExternalId,
    });

    return { data: toImportJobResult(tracker.entity) };
  }

  @Post('competition/import-players')
  @HttpCode(HttpStatus.CREATED)
  async importCompetitionPlayers(
    @Body() dto: ImportCompetitionDto,
  ): Promise<ApiResponse<ImportJobResultDto>> {
    const tracker = await this.importCompetitionPlayersUseCase.execute({
      provider: dto.provider,
      competitionExternalId: dto.competitionExternalId,
    });

    return { data: toImportJobResult(tracker.entity) };
  }

  @Get('jobs/:jobId')
  @HttpCode(HttpStatus.OK)
  async getImportJob(@Param('jobId') jobId: string): Promise<ApiResponse<ImportJobDto>> {
    const job = await this.getImportJobUseCase.execute({ jobId });
    return { data: toImportJobDto(job) };
  }

  @Post('countries/list')
  @HttpCode(HttpStatus.OK)
  async listCountries(@Body() dto: ProviderOnlyDto): Promise<ApiResponse<readonly CountryDto[]>> {
    const results = await this.listProviderCountriesUseCase.execute({ provider: dto.provider });
    return { data: results.map(toCountryDto) };
  }

  @Post('countries/import')
  @HttpCode(HttpStatus.CREATED)
  async importCountries(@Body() dto: ProviderOnlyDto): Promise<ApiResponse<{ readonly count: number }>> {
    const nations = await this.importCountriesUseCase.execute({ provider: dto.provider });
    return { data: { count: nations.length } };
  }

  @Post('competitions/list')
  @HttpCode(HttpStatus.OK)
  async listCompetitions(
    @Body() dto: CountryExternalIdDto,
  ): Promise<ApiResponse<readonly LeagueSearchResultDto[]>> {
    const results = await this.listCompetitionsByCountryUseCase.execute({
      provider: dto.provider,
      countryExternalId: dto.countryExternalId,
    });
    return { data: results.map(toLeagueSearchResultDto) };
  }

  @Post('competitions/import')
  @HttpCode(HttpStatus.CREATED)
  async importCompetitions(
    @Body() dto: CountryExternalIdDto,
  ): Promise<ApiResponse<{ readonly count: number }>> {
    const leagues = await this.importCompetitionsByCountryUseCase.execute({
      provider: dto.provider,
      countryExternalId: dto.countryExternalId,
    });
    return { data: { count: leagues.length } };
  }

  @Post('players/search')
  @HttpCode(HttpStatus.OK)
  async searchPlayers(
    @Body() dto: ProviderSearchQueryDto,
  ): Promise<ApiResponse<readonly PlayerSearchResultDto[]>> {
    const results = await this.searchPlayersUseCase.execute({
      provider: dto.provider,
      query: dto.query,
    });
    return { data: results.map(toPlayerSearchResultDto) };
  }

  @Post('players')
  @HttpCode(HttpStatus.CREATED)
  async importPlayer(@Body() dto: ImportPlayerDto): Promise<ApiResponse<ImportedPlayerDto>> {
    const player = await this.importPlayerUseCase.execute({
      provider: dto.provider,
      slug: dto.slug,
      externalId: dto.externalId,
    });
    return { data: toImportedPlayerDto(player) };
  }

  @Post('players/sync-profile')
  @HttpCode(HttpStatus.OK)
  async syncPlayerProfile(@Body() dto: ImportPlayerDto): Promise<ApiResponse<ImportedPlayerDto>> {
    const player = await this.syncPlayerProfileUseCase.execute({
      provider: dto.provider,
      externalId: dto.externalId,
      slug: dto.slug,
    });
    return { data: toImportedPlayerDto(player) };
  }

  @Post('teams/search')
  @HttpCode(HttpStatus.OK)
  async searchTeams(
    @Body() dto: ProviderSearchQueryDto,
  ): Promise<ApiResponse<readonly TeamSearchResultDto[]>> {
    const results = await this.searchTeamsUseCase.execute({
      provider: dto.provider,
      query: dto.query,
    });
    return { data: results.map(toTeamSearchResultDto) };
  }

  @Post('teams')
  @HttpCode(HttpStatus.CREATED)
  async importTeam(@Body() dto: ImportTeamDto): Promise<ApiResponse<ImportedTeamDto>> {
    const team = await this.importTeamUseCase.execute({
      provider: dto.provider,
      slug: dto.slug,
      externalId: dto.externalId,
    });
    return { data: toImportedTeamDto(team) };
  }

  @Post('clubs/sync-missing-players')
  @HttpCode(HttpStatus.CREATED)
  async syncMissingSquadPlayers(
    @Body() dto: SyncMissingSquadPlayersDto,
  ): Promise<
    ApiResponse<{
      readonly scannedTeams: number;
      readonly squadPlayers: number;
      readonly imported: number;
      readonly skippedExisting: number;
      readonly failed: number;
      readonly importedPlayers: readonly { readonly externalId: string; readonly displayName: string }[];
      readonly failures: readonly { readonly externalId: string; readonly displayName: string; readonly reason: string }[];
    }>
  > {
    const result = await this.syncMissingSquadPlayersUseCase.execute({
      provider: dto.provider,
      ...(dto.clubExternalId !== undefined ? { clubExternalId: dto.clubExternalId } : {}),
    });

    return { data: result };
  }

  @Post('clubs/enrich-player-metadata')
  @HttpCode(HttpStatus.OK)
  async enrichPlayerMetadata(
    @Body() dto: SyncMissingSquadPlayersDto,
  ): Promise<
    ApiResponse<{
      readonly incompletePlayers: number;
      readonly scannedTeams: number;
      readonly enriched: number;
      readonly unchanged: number;
      readonly notOnSquad: number;
      readonly failed: number;
      readonly enrichedPlayers: readonly {
        readonly externalId: string;
        readonly displayName: string;
        readonly fields: readonly string[];
      }[];
      readonly failures: readonly {
        readonly externalId: string;
        readonly displayName: string;
        readonly reason: string;
      }[];
    }>
  > {
    const result = await this.enrichPlayersFromSquadUseCase.execute({
      provider: dto.provider,
      ...(dto.clubExternalId !== undefined ? { clubExternalId: dto.clubExternalId } : {}),
    });

    return { data: result };
  }

  @Post('clubs/import-players')
  @HttpCode(HttpStatus.CREATED)
  async importClubPlayers(
    @Body() dto: ImportClubPlayersDto,
  ): Promise<
    ApiResponse<{
      readonly count: number;
      readonly failed: number;
      readonly failedPlayers: readonly { readonly externalId: string; readonly displayName: string }[];
    }>
  > {
    const result = await this.importClubPlayersUseCase.execute({
      provider: dto.provider,
      clubExternalId: dto.clubExternalId,
    });
    return {
      data: {
        count: result.imported,
        failed: result.failed,
        failedPlayers: result.failedPlayers,
      },
    };
  }

  @Post('leagues/search')
  @HttpCode(HttpStatus.OK)
  async searchLeagues(
    @Body() dto: ProviderSearchQueryDto,
  ): Promise<ApiResponse<readonly LeagueSearchResultDto[]>> {
    const results = await this.searchLeaguesUseCase.execute({
      provider: dto.provider,
      query: dto.query,
    });
    return { data: results.map(toLeagueSearchResultDto) };
  }
}
