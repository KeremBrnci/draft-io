/**
 * Collapses duplicate equivalent positions already stored in the database (LW/LM, RW/RM, ST/CF).
 *
 * Usage:
 *   pnpm --filter @draft-io/backend db:normalize-player-positions
 */
import 'reflect-metadata';

import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { collapseEquivalentPositionCodes } from '@draft-io/shared-utils';
import { v4 as uuidv4 } from 'uuid';

import { PlayerPositions } from '../modules/players/domain/value-objects/player-positions.vo';
import { PlayerPositionId } from '../modules/players/domain/value-objects/player-position-id.vo';
import type { PlayerRepository } from '../modules/players/domain/repositories/player.repository';
import { PLAYER_REPOSITORY } from '../modules/players/domain/repositories/player.repository';
import { SeedAppModule } from './seed-app.module';

const logger = new Logger('NormalizePlayerPositions');

function loadEnvFile(): void {
  const envPath = resolve(process.cwd(), '.env');

  if (!envPath || !existsSync(envPath)) {
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

function positionCodesEqual(left: readonly string[], right: readonly string[]): boolean {
  if (left.length !== right.length) {
    return false;
  }

  return left.every((code, index) => code === right[index]);
}

async function main(): Promise<void> {
  loadEnvFile();

  const app = await NestFactory.createApplicationContext(SeedAppModule, {
    logger: ['error', 'warn', 'log'],
  });

  try {
    const playerRepository = app.get<PlayerRepository>(PLAYER_REPOSITORY);
    const page = await playerRepository.findPaginated(
      {},
      { field: 'name', direction: 'asc' },
      { page: 1, pageSize: 10_000 },
    );

    let updated = 0;

    for (const player of page.items) {
      const currentCodes = player.positions.allCodes;
      const { primary, secondary } = collapseEquivalentPositionCodes(
        player.positions.primaryCode,
        player.positions.secondaryCodes,
      );
      const nextCodes = [primary, ...secondary];

      if (positionCodesEqual(currentCodes, nextCodes)) {
        continue;
      }

      player.replacePositions(
        PlayerPositions.fromPrimaryAndSecondary(
          player.id,
          () => PlayerPositionId.generate(uuidv4()),
          primary,
          secondary,
        ),
      );
      await playerRepository.save(player);
      updated += 1;
    }

    logger.log(`Scanned=${String(page.items.length)} updated=${String(updated)}`);
  } finally {
    await app.close();
  }
}

void main();
