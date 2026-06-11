/**
 * Re-imports and enriches one competition's squads (players, positions, cards).
 *
 * Usage:
 *   pnpm --filter @draft-io/backend db:refresh-competition
 *   pnpm --filter @draft-io/backend db:refresh-competition TR1
 */
import 'reflect-metadata';

import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { PrismaClient } from '@prisma/client';

import { parseExternalProvider } from '../core/external-reference/external-provider';
import { seedPlayerCardsIfMissing } from '../modules/cards/infrastructure/seed/seed-player-cards';
import { ImportCompetitionClubsUseCase } from '../modules/data-providers/application/use-cases/import-competition-clubs.use-case';
import { ImportCompetitionPlayersUseCase } from '../modules/data-providers/application/use-cases/import-competition-players.use-case';
import { SyncMissingSquadPlayersUseCase } from '../modules/data-providers/application/use-cases/sync-missing-squad-players.use-case';
import { SyncPlayerPositionsUseCase } from '../modules/data-providers/application/use-cases/sync-player-positions.use-case';
import { findTargetCompetitionByExternalId } from '../modules/data-providers/domain/catalog/target-competitions.catalog';
import { LEAGUE_REPOSITORY } from '../modules/leagues/domain/repositories/league.repository';
import type { LeagueRepository } from '../modules/leagues/domain/repositories/league.repository';
import { RecalculateOverallUseCase } from '../modules/overall-engine/application/use-cases/recalculate-overall.use-case';
import { PLAYER_REPOSITORY } from '../modules/players/domain/repositories/player.repository';
import type { PlayerRepository } from '../modules/players/domain/repositories/player.repository';

import { SeedAppModule } from './seed-app.module';

const PROVIDER = 'TRANSFERMARKT';
const logger = new Logger('RefreshCompetition');

function loadEnvFile(): void {
  const envPath = resolve(process.cwd(), '.env');

  if (!existsSync(envPath)) {
    return;
  }

  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();

    if (trimmed.length === 0 || trimmed.startsWith('#')) {
      continue;
    }

    const separatorIndex = trimmed.indexOf('=');

    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();

    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

async function main(): Promise<void> {
  loadEnvFile();

  const competitionExternalId = process.argv.slice(2).find((arg) => arg !== '--') ?? 'TR1';
  const target = findTargetCompetitionByExternalId(competitionExternalId);

  if (target === undefined) {
    throw new Error(`Unknown competition: ${competitionExternalId}`);
  }

  const app = await NestFactory.createApplicationContext(SeedAppModule, {
    logger: ['error', 'warn', 'log'],
  });

  const prisma = new PrismaClient();

  try {
    const leagueRepository = app.get<LeagueRepository>(LEAGUE_REPOSITORY);
    const playerRepository = app.get<PlayerRepository>(PLAYER_REPOSITORY);
    const importClubs = app.get(ImportCompetitionClubsUseCase);
    const importPlayers = app.get(ImportCompetitionPlayersUseCase);
    const syncMissing = app.get(SyncMissingSquadPlayersUseCase);
    const syncPositions = app.get(SyncPlayerPositionsUseCase);
    const recalculateOverall = app.get(RecalculateOverallUseCase);
    const externalProvider = parseExternalProvider(PROVIDER);

    logger.log(`Refreshing ${target.name} (${competitionExternalId})...`);

    try {
      await importClubs.execute({ provider: PROVIDER, competitionExternalId });
      await importPlayers.execute({ provider: PROVIDER, competitionExternalId });
    } catch (error) {
      logger.warn(
        `Roster API import skipped: ${error instanceof Error ? error.message : String(error)}`,
      );
    }

    const missing = await syncMissing.execute({
      provider: PROVIDER,
      competitionExternalId,
    });
    logger.log(
      `Missing squads: imported=${String(missing.imported)} existing=${String(missing.skippedExisting)} failed=${String(missing.failed)}`,
    );

    const positions = await syncPositions.execute({
      provider: PROVIDER,
      competitionExternalId,
    });
    logger.log(
      `Positions: enriched=${String(positions.enriched)} unchanged=${String(positions.unchanged)} failed=${String(positions.failed)}`,
    );

    const league = await leagueRepository.findByExternalReference(
      externalProvider,
      competitionExternalId,
    );

    if (league !== null) {
      const page = await playerRepository.findPaginated(
        { leagueId: league.id.value },
        { field: 'name', direction: 'asc' },
        { page: 1, pageSize: 20_000 },
      );
      const playerIds = page.items.map((player) => player.id.value);
      const overall = await recalculateOverall.execute({ playerIds });
      logger.log(
        `Overall: processed=${String(overall.processed)} calculated=${String(overall.calculated)} failed=${String(overall.failed)}`,
      );
    }

    const activeCards = await seedPlayerCardsIfMissing(prisma);
    const gkCards = await prisma.card.count({
      where: {
        isActive: true,
        player: {
          league: { externalId: competitionExternalId },
          positions: { some: { positionCode: 'GK' } },
        },
      },
    });

    logger.log(`Cards active=${String(activeCards)} ${target.name} GK cards=${String(gkCards)}`);
  } finally {
    await prisma.$disconnect();
    await app.close();
  }
}

void main().catch((error: unknown) => {
  logger.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
