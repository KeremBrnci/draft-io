/**
 * Resumes football data import without wiping existing data.
 * Imports missing competitions and fills club/player rosters (no profile enrichment).
 *
 * Usage: pnpm --filter @draft-io/backend db:resume-import
 */
import 'reflect-metadata';

import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { PrismaClient } from '@prisma/client';

import { SeedAppModule } from './seed-app.module';
import { TARGET_COMPETITIONS } from '../modules/data-providers/domain/catalog/target-competitions.catalog';
import { ImportCompetitionClubsUseCase } from '../modules/data-providers/application/use-cases/import-competition-clubs.use-case';
import { ImportCompetitionPlayersUseCase } from '../modules/data-providers/application/use-cases/import-competition-players.use-case';
import { ImportTargetCompetitionUseCase } from '../modules/data-providers/application/use-cases/import-target-competition.use-case';
import { parseExternalProvider } from '../core/external-reference/external-provider';
import { LEAGUE_REPOSITORY } from '../modules/leagues/domain/repositories/league.repository';
import type { LeagueRepository } from '../modules/leagues/domain/repositories/league.repository';

const PROVIDER = 'TRANSFERMARKT';
const logger = new Logger('ResumeFootballData');

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

  const app = await NestFactory.createApplicationContext(SeedAppModule, {
    logger: ['error', 'warn', 'log'],
  });

  try {
    const leagueRepository = app.get<LeagueRepository>(LEAGUE_REPOSITORY);
    const importTargetCompetition = app.get(ImportTargetCompetitionUseCase);
    const importClubs = app.get(ImportCompetitionClubsUseCase);
    const importPlayers = app.get(ImportCompetitionPlayersUseCase);
    const externalProvider = parseExternalProvider(PROVIDER);

    let hadFailures = false;

    for (const competition of TARGET_COMPETITIONS) {
      logger.log(`Processing ${competition.name}...`);

      const existing = await leagueRepository.findByExternalReference(
        externalProvider,
        competition.externalId,
      );

      if (existing === null) {
        await importTargetCompetition.execute({
          provider: PROVIDER,
          competitionExternalId: competition.externalId,
        });
      }

      const clubsTracker = await importClubs.execute({
        provider: PROVIDER,
        competitionExternalId: competition.externalId,
      });

      if (clubsTracker.entity.failedRecords > 0) {
        hadFailures = true;
        logger.warn(
          `${competition.name} clubs: ${String(clubsTracker.entity.failedRecords)} failure(s)`,
        );
      }

      const playersTracker = await importPlayers.execute({
        provider: PROVIDER,
        competitionExternalId: competition.externalId,
      });

      if (playersTracker.entity.failedRecords > 0) {
        hadFailures = true;
        logger.warn(
          `${competition.name} players: ${String(playersTracker.entity.failedRecords)} failure(s)`,
        );
      }

      logger.log(`${competition.name} done`);
    }

    const prisma = new PrismaClient();
    const summary = {
      leagues: await prisma.league.count(),
      teams: await prisma.team.count(),
      players: await prisma.player.count(),
      unresolvedFailures: await prisma.importFailedRecord.count({ where: { resolved: false } }),
    };
    await prisma.$disconnect();

    logger.log(`Resume finished — ${JSON.stringify(summary)}`);

    if (hadFailures) {
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
