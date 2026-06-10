/**
 * Imports or refreshes a single player by provider external id.
 *
 * Usage:
 *   pnpm --filter @draft-io/backend db:import-player -- TRANSFERMARKT 529729
 */
import 'reflect-metadata';

import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { ImportPlayerUseCase } from '../modules/data-providers/application/use-cases/import-player.use-case';
import { SeedAppModule } from './seed-app.module';

const logger = new Logger('ImportPlayer');

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

  const provider = process.argv[2] ?? 'TRANSFERMARKT';
  const externalId = process.argv[3];

  if (externalId === undefined || externalId.length === 0) {
    logger.error('Usage: db:import-player -- <PROVIDER> <EXTERNAL_ID>');
    process.exit(1);
  }

  const app = await NestFactory.createApplicationContext(SeedAppModule, {
    logger: ['error', 'warn', 'log'],
  });

  try {
    const useCase = app.get(ImportPlayerUseCase);
    const player = await useCase.execute({
      provider,
      slug: externalId,
      externalId,
    });

    logger.log(`Imported: ${player.displayName.value} (${externalId})`);
  } finally {
    await app.close();
  }
}

void main();
