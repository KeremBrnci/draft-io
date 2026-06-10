/**
 * Backfills missing player metadata (birth date, image) from Transfermarkt squad pages.
 *
 * Usage:
 *   pnpm --filter @draft-io/backend db:backfill-metadata
 *   pnpm --filter @draft-io/backend db:backfill-metadata 583
 */
import 'reflect-metadata';

import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { ExternalProvider } from '../core/external-reference/external-provider';
import { EnrichPlayersFromSquadUseCase } from '../modules/data-providers/application/use-cases/enrich-players-from-squad.use-case';
import { CalculatePlayerOverallUseCase } from '../modules/overall-engine/application/use-cases/calculate-player-overall.use-case';
import { PLAYER_REPOSITORY } from '../modules/players/domain/repositories/player.repository';
import type { PlayerRepository } from '../modules/players/domain/repositories/player.repository';
import { SeedAppModule } from './seed-app.module';

const logger = new Logger('BackfillPlayerMetadata');

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
    const enrichUseCase = app.get(EnrichPlayersFromSquadUseCase);
    const calculateOverallUseCase = app.get(CalculatePlayerOverallUseCase);
    const playerRepository = app.get<PlayerRepository>(PLAYER_REPOSITORY);

    const result = await enrichUseCase.execute({
      provider: 'TRANSFERMARKT',
      ...(clubExternalId !== undefined ? { clubExternalId } : {}),
    });

    logger.log(
      `Incomplete=${String(result.incompletePlayers)} teams=${String(result.scannedTeams)} enriched=${String(result.enriched)} unchanged=${String(result.unchanged)} notOnSquad=${String(result.notOnSquad)} failed=${String(result.failed)}`,
    );

    for (const player of result.enrichedPlayers) {
      logger.log(`  ~ ${player.displayName} (${player.externalId}): ${player.fields.join(', ')}`);
    }

    for (const failure of result.failures.slice(0, 10)) {
      logger.warn(`  ! ${failure.displayName}: ${failure.reason}`);
    }

    let overallRecalculated = 0;
    for (const enriched of result.enrichedPlayers) {
      if (!enriched.fields.includes('birthDate')) {
        continue;
      }

      const player = await playerRepository.findByExternalReference(
        ExternalProvider.TRANSFERMARKT,
        enriched.externalId,
      );

      if (player === null || player.marketValue === null) {
        continue;
      }

      await calculateOverallUseCase.execute({ playerId: player.id.value });
      overallRecalculated += 1;
    }

    if (overallRecalculated > 0) {
      logger.log(`Recalculated overall for ${String(overallRecalculated)} players`);
    }
  } finally {
    await app.close();
  }
}

void main();
