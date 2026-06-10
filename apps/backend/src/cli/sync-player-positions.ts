/**
 * Backfills primary + secondary positions from Transfermarkt player profiles.
 *
 * Usage:
 *   pnpm --filter @draft-io/backend db:sync-player-positions
 *   pnpm --filter @draft-io/backend db:sync-player-positions 27
 */
import 'reflect-metadata';

import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { SyncPlayerPositionsUseCase } from '../modules/data-providers/application/use-cases/sync-player-positions.use-case';
import { SeedAppModule } from './seed-app.module';

const logger = new Logger('SyncPlayerPositions');

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
    const syncUseCase = app.get(SyncPlayerPositionsUseCase);

    const result = await syncUseCase.execute({
      provider: 'TRANSFERMARKT',
      ...(clubExternalId !== undefined ? { clubExternalId } : {}),
    });

    logger.log(
      `Scanned=${String(result.scannedPlayers)} enriched=${String(result.enriched)} unchanged=${String(result.unchanged)} withoutProfile=${String(result.withoutProfile)} failed=${String(result.failed)}`,
    );

    for (const player of result.enrichedPlayers.slice(0, 20)) {
      logger.log(`  ~ ${player.displayName}: ${player.positions.join(', ')}`);
    }
  } finally {
    await app.close();
  }
}

void main();
