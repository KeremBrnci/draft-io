/**
 * Imports head coaches from Transfermarkt staff pages.
 *
 * Usage:
 *   pnpm --filter @draft-io/backend db:sync-coaches
 *   pnpm --filter @draft-io/backend db:sync-coaches 583
 */
import 'reflect-metadata';

import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { SyncCoachesFromStaffUseCase } from '../modules/data-providers/application/use-cases/sync-coaches-from-staff.use-case';
import { SeedAppModule } from './seed-app.module';

const logger = new Logger('SyncCoaches');

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
    const syncUseCase = app.get(SyncCoachesFromStaffUseCase);

    const result = await syncUseCase.execute({
      provider: 'TRANSFERMARKT',
      ...(clubExternalId !== undefined ? { clubExternalId } : {}),
    });

    logger.log(
      `Scanned ${String(result.scannedTeams)} teams, imported=${String(result.imported)}, updated=${String(result.updated)}, missing=${String(result.missing)}, failed=${String(result.failed)}`,
    );

    for (const coach of result.coaches.slice(0, 20)) {
      logger.log(`  + ${coach.displayName} (${coach.teamName})`);
    }

    for (const failure of result.failures.slice(0, 10)) {
      logger.warn(`  ! ${failure.displayName}: ${failure.reason}`);
    }
  } finally {
    await app.close();
  }
}

void main();
