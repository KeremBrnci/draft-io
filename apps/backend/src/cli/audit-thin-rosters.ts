/**
 * Lists clubs with suspiciously small squads (likely incomplete imports).
 *
 * Usage: pnpm --filter @draft-io/backend db:audit-rosters
 */
import 'reflect-metadata';

import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { PrismaClient } from '@prisma/client';

import { SeedAppModule } from './seed-app.module';

const logger = new Logger('AuditThinRosters');
const MIN_EXPECTED_PLAYERS = 23;

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

  await NestFactory.createApplicationContext(SeedAppModule, {
    logger: ['error', 'warn'],
  });

  const prisma = new PrismaClient();

  try {
    const rows = await prisma.$queryRaw<
      {
        league: string;
        team: string;
        external_id: string;
        player_count: number;
      }[]
    >`
      SELECT
        l.external_id AS league,
        t.name AS team,
        t.external_id,
        COUNT(p.id)::int AS player_count
      FROM teams t
      JOIN leagues l ON l.id = t.league_id
      LEFT JOIN players p ON p.team_id = t.id
      WHERE l.external_id IN ('GB1', 'ES1', 'L1', 'IT1', 'FR1', 'TR1', 'NL1', 'PO1')
      GROUP BY l.external_id, t.name, t.external_id
      HAVING COUNT(p.id) < ${MIN_EXPECTED_PLAYERS}
      ORDER BY player_count ASC, l.external_id, t.name
    `;

    if (rows.length === 0) {
      logger.log('All target-league clubs meet the minimum squad threshold.');
      return;
    }

    logger.warn(`Clubs with fewer than ${String(MIN_EXPECTED_PLAYERS)} players:`);

    for (const row of rows) {
      logger.warn(
        `  ${row.league} | ${row.team} (${row.external_id}): ${String(row.player_count)} players`,
      );
    }
  } finally {
    await prisma.$disconnect();
  }
}

void main();
