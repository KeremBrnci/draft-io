/**
 * Wipes imported football data and runs the one-time Transfermarkt seed:
 * countries → all target competitions (leagues, clubs, players).
 * Profile enrichment is skipped for speed — roster data is sufficient for admin.
 *
 * Usage: pnpm --filter @draft-io/backend db:seed
 */
import 'reflect-metadata';

import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { PrismaClient } from '@prisma/client';

import { ImportAllTargetCompetitionsUseCase } from '../modules/data-providers/application/use-cases/import-all-target-competitions.use-case';
import { ImportCountriesUseCase } from '../modules/data-providers/application/use-cases/import-countries.use-case';

import { SeedAppModule } from './seed-app.module';

const PROVIDER = 'TRANSFERMARKT';
const logger = new Logger('SeedFootballData');

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

async function wipeImportData(prisma: PrismaClient): Promise<void> {
  logger.log('Wiping existing import data...');

  const result = await prisma.$transaction([
    prisma.importFailedRecord.deleteMany(),
    prisma.importJobLog.deleteMany(),
    prisma.importJob.deleteMany(),
    prisma.card.deleteMany(),
    prisma.playerPosition.deleteMany(),
    prisma.player.deleteMany(),
    prisma.team.deleteMany(),
    prisma.league.deleteMany(),
    prisma.country.deleteMany(),
  ]);

  logger.log(
    `Deleted players=${String(result[5]?.count ?? 0)}, teams=${String(result[6]?.count ?? 0)}, leagues=${String(result[7]?.count ?? 0)}`,
  );
}

async function main(): Promise<void> {
  loadEnvFile();
  process.env.IMPORT_SKIP_ENRICHMENT = '1';

  const prisma = new PrismaClient();

  try {
    await wipeImportData(prisma);
  } finally {
    await prisma.$disconnect();
  }

  const app = await NestFactory.createApplicationContext(SeedAppModule, {
    logger: ['error', 'warn', 'log'],
  });

  try {
    const importCountries = app.get(ImportCountriesUseCase);
    const importAllCompetitions = app.get(ImportAllTargetCompetitionsUseCase);

    logger.log('Importing countries...');
    const nations = await importCountries.execute({ provider: PROVIDER });
    logger.log(`Imported ${String(nations.length)} countries`);

    logger.log('Importing all target competitions (this may take a while)...');
    const tracker = await importAllCompetitions.execute({ provider: PROVIDER });
    const job = tracker.entity;

    logger.log(
      `Seed finished — status=${job.status}, processed=${String(job.processedRecords)}/${String(job.totalRecords)}, failedRecords=${String(job.failedRecords)}`,
    );

    if (job.failedRecords > 0) {
      process.exitCode = 1;
    }
  } finally {
    await app.close();
  }
}

main().catch((error: unknown) => {
  logger.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
