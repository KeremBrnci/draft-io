/**
 * Calculates overall ratings for all players with market value.
 *
 * Usage: pnpm --filter @draft-io/backend db:recalculate-overall
 */
import 'reflect-metadata';

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { RecalculateOverallUseCase } from '../modules/overall-engine/application/use-cases/recalculate-overall.use-case';
import { SeedAppModule } from './seed-app.module';

const logger = new Logger('RecalculateOverall');

async function main(): Promise<void> {
  const app = await NestFactory.createApplicationContext(SeedAppModule, {
    logger: ['error', 'warn', 'log'],
  });

  try {
    const useCase = app.get(RecalculateOverallUseCase);
    const playerIds = process.argv.slice(2).filter((arg) => arg !== '--');
    const result = await useCase.execute(
      playerIds.length > 0 ? { playerIds } : {},
    );

    logger.log(
      `Done: processed=${String(result.processed)} calculated=${String(result.calculated)} failed=${String(result.failed)}`,
    );
  } finally {
    await app.close();
  }
}

void main();
