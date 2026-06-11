/**
 * Imports players that exist on Transfermarkt squad pages but are missing in DB.
 *
 * Usage:
 *   pnpm --filter @draft-io/backend db:sync-missing-players
 *   pnpm --filter @draft-io/backend db:sync-missing-players -- 583
 */
import 'reflect-metadata';

import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { ExternalProvider } from '../core/external-reference/external-provider';
import { PrismaService } from '../infrastructure/database/prisma.service';
import { seedPlayerCardsIfMissing } from '../modules/cards/infrastructure/seed/seed-player-cards';
import { SyncMissingSquadPlayersUseCase } from '../modules/data-providers/application/use-cases/sync-missing-squad-players.use-case';
import { CalculatePlayerOverallUseCase } from '../modules/overall-engine/application/use-cases/calculate-player-overall.use-case';
import { RecalculateOverallUseCase } from '../modules/overall-engine/application/use-cases/recalculate-overall.use-case';
import { PLAYER_REPOSITORY } from '../modules/players/domain/repositories/player.repository';
import type { PlayerRepository } from '../modules/players/domain/repositories/player.repository';

import { SeedAppModule } from './seed-app.module';

const logger = new Logger('SyncMissingPlayers');

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

  const clubExternalId = process.argv.slice(2).find((arg) => arg !== '--' && /^\d+$/.test(arg));
  const app = await NestFactory.createApplicationContext(SeedAppModule, {
    logger: ['error', 'warn', 'log'],
  });

  try {
    const syncUseCase = app.get(SyncMissingSquadPlayersUseCase);
    const calculateOverallUseCase = app.get(CalculatePlayerOverallUseCase);
    const recalculateOverallUseCase = app.get(RecalculateOverallUseCase);
    const playerRepository = app.get<PlayerRepository>(PLAYER_REPOSITORY);
    const prisma = app.get(PrismaService);

    const result = await syncUseCase.execute({
      provider: 'TRANSFERMARKT',
      ...(clubExternalId !== undefined ? { clubExternalId } : {}),
    });

    logger.log(
      `Scanned ${String(result.scannedTeams)} teams, squad=${String(result.squadPlayers)}, imported=${String(result.imported)}, existing=${String(result.skippedExisting)}, failed=${String(result.failed)}`,
    );

    for (const player of result.importedPlayers) {
      logger.log(`  + ${player.displayName} (${player.externalId})`);
    }

    for (const failure of result.failures.slice(0, 10)) {
      logger.warn(`  ! ${failure.displayName}: ${failure.reason}`);
    }

    let overallCalculated = 0;
    for (const imported of result.importedPlayers) {
      const player = await playerRepository.findByExternalReference(
        ExternalProvider.TRANSFERMARKT,
        imported.externalId,
      );

      if (player === null || player.marketValue === null) {
        continue;
      }

      await calculateOverallUseCase.execute({ playerId: player.id.value });
      overallCalculated += 1;
    }

    if (overallCalculated > 0) {
      logger.log(`Calculated overall for ${String(overallCalculated)} imported players`);
    }

    const activeCards = await seedPlayerCardsIfMissing(prisma);
    logger.log(`Draft card pool size after seed: ${String(activeCards)}`);

    const goalkeeperIds = await prisma.player.findMany({
      where: {
        status: 'ACTIVE',
        marketValue: { not: null },
        positions: { some: { positionCode: 'GK', isPrimary: true } },
      },
      select: { id: true },
    });

    if (goalkeeperIds.length > 0) {
      const gkRecalc = await recalculateOverallUseCase.execute({
        playerIds: goalkeeperIds.map((entry) => entry.id),
      });
      logger.log(
        `Recalculated goalkeeper overalls: processed=${String(gkRecalc.processed)} calculated=${String(gkRecalc.calculated)} failed=${String(gkRecalc.failed)}`,
      );
    }
  } finally {
    await app.close();
  }
}

void main();
