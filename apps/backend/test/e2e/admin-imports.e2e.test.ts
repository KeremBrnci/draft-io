import 'reflect-metadata';

import type { INestApplication } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import { HttpExceptionFilter } from '../../src/common/filters/http-exception.filter';
import { LoggerService } from '../../src/common/logging/logger.service';
import { ExternalProvider } from '../../src/core/external-reference/external-provider';
import { ImportClubPlayersUseCase } from '../../src/modules/data-providers/application/use-cases/import-club-players.use-case';
import { ImportAllTargetCompetitionsUseCase } from '../../src/modules/data-providers/application/use-cases/import-all-target-competitions.use-case';
import { ImportCompetitionClubsUseCase } from '../../src/modules/data-providers/application/use-cases/import-competition-clubs.use-case';
import { ImportCompetitionPipelineUseCase } from '../../src/modules/data-providers/application/use-cases/import-competition-pipeline.use-case';
import { ImportCompetitionPlayersUseCase } from '../../src/modules/data-providers/application/use-cases/import-competition-players.use-case';
import { ImportCompetitionsByCountryUseCase } from '../../src/modules/data-providers/application/use-cases/import-competitions-by-country.use-case';
import { ImportCountriesUseCase } from '../../src/modules/data-providers/application/use-cases/import-countries.use-case';
import { ImportPlayerUseCase } from '../../src/modules/data-providers/application/use-cases/import-player.use-case';
import { ImportTargetCompetitionUseCase } from '../../src/modules/data-providers/application/use-cases/import-target-competition.use-case';
import { ImportTeamUseCase } from '../../src/modules/data-providers/application/use-cases/import-team.use-case';
import { GetImportJobUseCase } from '../../src/modules/data-providers/application/use-cases/get-import-job.use-case';
import { ListCompetitionsByCountryUseCase } from '../../src/modules/data-providers/application/use-cases/list-competitions-by-country.use-case';
import { ListImportFailedRecordsUseCase } from '../../src/modules/data-providers/application/use-cases/list-import-failed-records.use-case';
import { ListImportJobLogsUseCase } from '../../src/modules/data-providers/application/use-cases/list-import-job-logs.use-case';
import { ListImportJobsUseCase } from '../../src/modules/data-providers/application/use-cases/list-import-jobs.use-case';
import { ListProviderCountriesUseCase } from '../../src/modules/data-providers/application/use-cases/list-provider-countries.use-case';
import { ListTargetCompetitionsUseCase } from '../../src/modules/data-providers/application/use-cases/list-target-competitions.use-case';
import { RetryImportJobUseCase } from '../../src/modules/data-providers/application/use-cases/retry-import-job.use-case';
import { ImportJob } from '../../src/modules/data-providers/domain/entities/import-job.entity';
import { ImportJobType } from '../../src/modules/data-providers/domain/enums/import-job-type';
import { ImportJobId } from '../../src/modules/data-providers/domain/value-objects/import-job-id.vo';
import { SearchLeaguesUseCase } from '../../src/modules/data-providers/application/use-cases/search-leagues.use-case';
import { SearchPlayersUseCase } from '../../src/modules/data-providers/application/use-cases/search-players.use-case';
import { SearchTeamsUseCase } from '../../src/modules/data-providers/application/use-cases/search-teams.use-case';
import { SyncPlayerProfileUseCase } from '../../src/modules/data-providers/application/use-cases/sync-player-profile.use-case';
import { AdminImportsController } from '../../src/modules/data-providers/presentation/controllers/admin-imports.controller';
import { DisplayName } from '../../src/modules/players/domain/value-objects/display-name.vo';
import { ExternalReference } from '../../src/modules/players/domain/value-objects/external-reference.vo';
import { PlayerId } from '../../src/modules/players/domain/value-objects/player-id.vo';
import { buildTestPlayer } from '../../src/modules/players/testing/player-test.factory';
import { Position } from '../../src/modules/positions/domain/value-objects/position.vo';
import { Team } from '../../src/modules/teams/domain/entities/team.entity';
import { TeamExternalReference } from '../../src/modules/teams/domain/value-objects/external-reference.vo';
import { TeamId } from '../../src/modules/teams/domain/value-objects/team-id.vo';
import { TeamName } from '../../src/modules/teams/domain/value-objects/team-name.vo';

describe('Admin Imports API (E2E)', () => {
  let app: INestApplication;
  let httpServer: Parameters<typeof request>[0];

  const mockPlayer = buildTestPlayer({
    id: PlayerId.create('770e8400-e29b-41d4-a716-446655440002'),
    externalReference: ExternalReference.create(ExternalProvider.SPORTDB, 'vgOOdZbd'),
    displayName: DisplayName.create('Lionel Messi'),
    primaryPosition: Position.create('RW'),
  });

  const mockTeam = Team.create({
    id: TeamId.create('660e8400-e29b-41d4-a716-446655440011'),
    externalReference: TeamExternalReference.create(ExternalProvider.SPORTDB, 'SKbpVP6K'),
    name: TeamName.create('Barcelona'),
    shortName: null,
    countryId: null,
    leagueId: null,
    country: 'Spain',
    logoUrl: null,
  });

  const searchPlayersUseCase = {
    execute: vi.fn().mockResolvedValue([
      {
        slug: 'messi-lionel',
        externalId: 'vgOOdZbd',
        displayName: 'Lionel Messi',
        nationality: 'Argentina',
        teamName: 'Inter Miami',
      },
    ]),
  };
  const importPlayerUseCase = { execute: vi.fn().mockResolvedValue(mockPlayer) };
  const syncPlayerProfileUseCase = { execute: vi.fn().mockResolvedValue(mockPlayer) };
  const searchTeamsUseCase = {
    execute: vi.fn().mockResolvedValue([
      {
        slug: 'barcelona',
        externalId: 'SKbpVP6K',
        name: 'Barcelona',
        country: 'Spain',
      },
    ]),
  };
  const importTeamUseCase = { execute: vi.fn().mockResolvedValue(mockTeam) };
  const importClubPlayersUseCase = { execute: vi.fn().mockResolvedValue({ count: 0 }) };
  const searchLeaguesUseCase = {
    execute: vi.fn().mockResolvedValue([
      {
        slug: 'bundesliga',
        externalId: 'bundesliga-de',
        name: 'Bundesliga',
        country: 'Germany',
      },
    ]),
  };
  const listProviderCountriesUseCase = { execute: vi.fn().mockResolvedValue([]) };
  const importCountriesUseCase = { execute: vi.fn().mockResolvedValue([]) };
  const listCompetitionsByCountryUseCase = { execute: vi.fn().mockResolvedValue([]) };
  const importCompetitionsByCountryUseCase = { execute: vi.fn().mockResolvedValue([]) };
  const listTargetCompetitionsUseCase = { execute: vi.fn().mockReturnValue([{ externalId: 'L1', slug: 'bundesliga', name: 'Bundesliga', countryName: 'Germany', tier: 1 }]) };

  const mockJob = ImportJob.create({
    id: ImportJobId.create('880e8400-e29b-41d4-a716-446655440099'),
    jobType: ImportJobType.COMPETITION,
    provider: 'TRANSFERMARKT',
    targetExternalId: 'L1',
    targetName: 'Bundesliga',
  });
  mockJob.markRunning(1);
  mockJob.recordSuccess();
  mockJob.markCompleted();

  const mockTracker = { id: mockJob.id, entity: mockJob };
  const importTargetCompetitionUseCase = { execute: vi.fn().mockResolvedValue(mockTracker) };
  const importCompetitionClubsUseCase = { execute: vi.fn().mockResolvedValue(mockTracker) };
  const importCompetitionPlayersUseCase = { execute: vi.fn().mockResolvedValue(mockTracker) };
  const getImportJobUseCase = { execute: vi.fn().mockResolvedValue(mockJob) };
  const listImportJobsUseCase = { execute: vi.fn().mockResolvedValue([mockJob]) };
  const listImportJobLogsUseCase = { execute: vi.fn().mockResolvedValue([]) };
  const listImportFailedRecordsUseCase = { execute: vi.fn().mockResolvedValue([]) };
  const importCompetitionPipelineUseCase = { execute: vi.fn().mockResolvedValue(mockTracker) };
  const importAllTargetCompetitionsUseCase = { execute: vi.fn().mockResolvedValue(mockTracker) };
  const retryImportJobUseCase = { execute: vi.fn().mockResolvedValue(mockTracker) };

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true })],
      controllers: [AdminImportsController],
      providers: [
        { provide: SearchPlayersUseCase, useValue: searchPlayersUseCase },
        { provide: ImportPlayerUseCase, useValue: importPlayerUseCase },
        { provide: SyncPlayerProfileUseCase, useValue: syncPlayerProfileUseCase },
        { provide: SearchTeamsUseCase, useValue: searchTeamsUseCase },
        { provide: ImportTeamUseCase, useValue: importTeamUseCase },
        { provide: ImportClubPlayersUseCase, useValue: importClubPlayersUseCase },
        { provide: SearchLeaguesUseCase, useValue: searchLeaguesUseCase },
        { provide: ListProviderCountriesUseCase, useValue: listProviderCountriesUseCase },
        { provide: ImportCountriesUseCase, useValue: importCountriesUseCase },
        { provide: ListCompetitionsByCountryUseCase, useValue: listCompetitionsByCountryUseCase },
        { provide: ImportCompetitionsByCountryUseCase, useValue: importCompetitionsByCountryUseCase },
        { provide: ListTargetCompetitionsUseCase, useValue: listTargetCompetitionsUseCase },
        { provide: ImportTargetCompetitionUseCase, useValue: importTargetCompetitionUseCase },
        { provide: ImportCompetitionClubsUseCase, useValue: importCompetitionClubsUseCase },
        { provide: ImportCompetitionPlayersUseCase, useValue: importCompetitionPlayersUseCase },
        { provide: GetImportJobUseCase, useValue: getImportJobUseCase },
        { provide: ListImportJobsUseCase, useValue: listImportJobsUseCase },
        { provide: ListImportJobLogsUseCase, useValue: listImportJobLogsUseCase },
        { provide: ListImportFailedRecordsUseCase, useValue: listImportFailedRecordsUseCase },
        { provide: ImportCompetitionPipelineUseCase, useValue: importCompetitionPipelineUseCase },
        { provide: ImportAllTargetCompetitionsUseCase, useValue: importAllTargetCompetitionsUseCase },
        { provide: RetryImportJobUseCase, useValue: retryImportJobUseCase },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    const logger = new LoggerService(app.get(ConfigService));

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useGlobalFilters(new HttpExceptionFilter(logger));
    app.setGlobalPrefix('api/v1');

    await app.init();
    httpServer = app.getHttpServer() as Parameters<typeof request>[0];
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /api/v1/admin/imports/players/search returns search results', async () => {
    const response = await request(httpServer)
      .post('/api/v1/admin/imports/players/search')
      .send({ provider: 'SPORTDB', query: 'messi' })
      .expect(200);

    expect(response.body.data[0].externalId).toBe('vgOOdZbd');
  });

  it('POST /api/v1/admin/imports/players imports a player', async () => {
    const response = await request(httpServer)
      .post('/api/v1/admin/imports/players')
      .send({
        provider: 'SPORTDB',
        slug: 'messi-lionel',
        externalId: 'vgOOdZbd',
      })
      .expect(201);

    expect(response.body.data.displayName).toBe('Lionel Messi');
  });

  it('POST /api/v1/admin/imports/teams/search returns search results', async () => {
    const response = await request(httpServer)
      .post('/api/v1/admin/imports/teams/search')
      .send({ provider: 'SPORTDB', query: 'barcelona' })
      .expect(200);

    expect(response.body.data[0].name).toBe('Barcelona');
  });

  it('GET /api/v1/admin/imports/target-competitions returns curated list', async () => {
    const response = await request(httpServer).get('/api/v1/admin/imports/target-competitions').expect(200);

    expect(response.body.data[0].externalId).toBe('L1');
  });

  it('POST /api/v1/admin/imports/competition/import returns job result', async () => {
    const response = await request(httpServer)
      .post('/api/v1/admin/imports/competition/import')
      .send({ provider: 'TRANSFERMARKT', competitionExternalId: 'L1' })
      .expect(201);

    expect(response.body.data.jobId).toBe(mockJob.id.value);
  });

  it('rejects invalid import payload', async () => {
    await request(httpServer)
      .post('/api/v1/admin/imports/players')
      .send({ provider: 'INVALID', slug: '', externalId: '' })
      .expect(400);
  });
});
