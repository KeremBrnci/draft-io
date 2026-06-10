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
import { GetCardByIdUseCase } from '../../src/modules/cards/application/use-cases/get-card-by-id.use-case';
import { ListCardsByPlayerUseCase } from '../../src/modules/cards/application/use-cases/list-cards-by-player.use-case';
import { ListCardsUseCase } from '../../src/modules/cards/application/use-cases/list-cards.use-case';
import { CardsController } from '../../src/modules/cards/presentation/controllers/cards.controller';
import { PlayerCardsController } from '../../src/modules/cards/presentation/controllers/player-cards.controller';
import {
  buildTestCard,
  TEST_CARD_ID,
  TEST_PLAYER_ID,
} from '../../src/modules/cards/testing/card-test.factory';

const cardDetail = {
  card: buildTestCard(),
  cardTypeCode: 'BASE',
  cardRarityCode: 'COMMON',
  cardTemplateName: 'Base Gold Template',
};

describe('Cards API (E2E)', () => {
  let app: INestApplication;
  let httpServer: Parameters<typeof request>[0];

  const listCardsUseCase = { execute: vi.fn().mockResolvedValue([cardDetail]) };
  const getCardByIdUseCase = { execute: vi.fn().mockResolvedValue(cardDetail) };
  const listCardsByPlayerUseCase = { execute: vi.fn().mockResolvedValue([cardDetail]) };

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true })],
      controllers: [CardsController, PlayerCardsController],
      providers: [
        { provide: ListCardsUseCase, useValue: listCardsUseCase },
        { provide: GetCardByIdUseCase, useValue: getCardByIdUseCase },
        { provide: ListCardsByPlayerUseCase, useValue: listCardsByPlayerUseCase },
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

  it('GET /api/v1/cards lists cards with filters', async () => {
    const response = await request(httpServer)
      .get('/api/v1/cards')
      .query({ cardType: 'BASE', minOverall: 80 })
      .expect(200);

    expect(response.body.data[0].cardTypeCode).toBe('BASE');
  });

  it('GET /api/v1/cards/:id returns a card', async () => {
    const response = await request(httpServer).get(`/api/v1/cards/${TEST_CARD_ID}`).expect(200);

    expect(response.body.data.id).toBe(TEST_CARD_ID);
    expect(response.body.data.overall).toBe(89);
  });

  it('GET /api/v1/players/:playerId/cards lists player editions', async () => {
    const response = await request(httpServer)
      .get(`/api/v1/players/${TEST_PLAYER_ID}/cards`)
      .expect(200);

    expect(response.body.data[0].playerId).toBe(TEST_PLAYER_ID);
  });
});
