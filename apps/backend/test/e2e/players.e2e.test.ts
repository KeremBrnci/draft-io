import 'reflect-metadata';

import type { INestApplication } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { Response } from 'supertest';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import { HttpExceptionFilter } from '../../src/common/filters/http-exception.filter';
import { LoggerService } from '../../src/common/logging/logger.service';
import { CreatePlayerUseCase } from '../../src/modules/players/application/use-cases/create-player.use-case';
import { GetPlayerByIdUseCase } from '../../src/modules/players/application/use-cases/get-player-by-id.use-case';
import { ListPlayersUseCase } from '../../src/modules/players/application/use-cases/list-players.use-case';
import { UpdatePlayerUseCase } from '../../src/modules/players/application/use-cases/update-player.use-case';
import { DisplayName } from '../../src/modules/players/domain/value-objects/display-name.vo';
import { PlayerId } from '../../src/modules/players/domain/value-objects/player-id.vo';
import { PlayersController } from '../../src/modules/players/presentation/controllers/players.controller';
import { buildTestPlayer, buildTestPlayerPositions } from '../../src/modules/players/testing/player-test.factory';

const VALID_PLAYER_ID = '770e8400-e29b-41d4-a716-446655440002';

interface PlayerApiResponse {
  readonly data: {
    readonly id: string;
    readonly displayName: string;
    readonly position: string;
  };
}

describe('Players API (E2E)', () => {
  let app: INestApplication;
  let httpServer: Parameters<typeof request>[0];

  const mockPlayerId = PlayerId.create(VALID_PLAYER_ID);
  const mockPlayer = buildTestPlayer({
    id: mockPlayerId,
    displayName: DisplayName.create('E2E Test Player'),
    positions: buildTestPlayerPositions(mockPlayerId, 'ST'),
  });

  const createPlayerUseCase = { execute: vi.fn().mockResolvedValue(mockPlayer) };
  const updatePlayerUseCase = { execute: vi.fn().mockResolvedValue(mockPlayer) };
  const getPlayerByIdUseCase = { execute: vi.fn().mockResolvedValue(mockPlayer) };
  const listPlayersUseCase = { execute: vi.fn().mockResolvedValue([mockPlayer]) };

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true })],
      controllers: [PlayersController],
      providers: [
        { provide: CreatePlayerUseCase, useValue: createPlayerUseCase },
        { provide: UpdatePlayerUseCase, useValue: updatePlayerUseCase },
        { provide: GetPlayerByIdUseCase, useValue: getPlayerByIdUseCase },
        { provide: ListPlayersUseCase, useValue: listPlayersUseCase },
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

  it('POST /api/v1/players creates a player identity', async () => {
    const response = await request(httpServer)
      .post('/api/v1/players')
      .send({
        name: 'E2E Test Player',
        position: 'ST',
      })
      .expect(201);

    const body = response.body as PlayerApiResponse;

    expect(body.data.displayName).toBe('E2E Test Player');
    expect(body.data.position).toBe('ST');
  });

  it('GET /api/v1/players/:id returns a player', async () => {
    const response = await request(httpServer)
      .get(`/api/v1/players/${VALID_PLAYER_ID}`)
      .expect(200);

    const body = response.body as PlayerApiResponse;
    expect(body.data.id).toBe(VALID_PLAYER_ID);
  });

  it('POST /api/v1/players rejects invalid payload', async () => {
    const response: Response = await request(httpServer)
      .post('/api/v1/players')
      .send({
        name: '',
        position: 'INVALID',
      })
      .expect(400);

    expect(response.status).toBe(400);
  });
});
