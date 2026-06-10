/**
 * Backfills player portrait URLs from Transfermarkt squad pages.
 *
 * Usage: pnpm --filter @draft-io/backend db:backfill-images
 */
import 'reflect-metadata';

import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { extractTransfermarktPortraitUrlsFromHtml } from '@draft-io/shared-utils';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { PrismaClient } from '@prisma/client';

import { resolveTransfermarktSeasonId } from '../modules/data-providers/infrastructure/transfermarkt/utils/transfermarkt-season';

import { SeedAppModule } from './seed-app.module';

const logger = new Logger('BackfillPlayerImages');
const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36';
const REQUEST_DELAY_MS = 250;

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

function sleep(ms: number): Promise<void> {
  return new Promise((resolveSleep) => {
    setTimeout(resolveSleep, ms);
  });
}

async function fetchSquadPortraits(
  clubExternalId: string,
  seasonId: string,
): Promise<Map<string, string>> {
  const url = `https://www.transfermarkt.com/-/kader/verein/${encodeURIComponent(clubExternalId)}/saison_id/${seasonId}/plus/1`;
  const response = await fetch(url, {
    headers: {
      'User-Agent': USER_AGENT,
      'Accept-Language': 'en-US,en;q=0.9',
    },
  });

  if (!response.ok) {
    throw new Error(`Squad page failed (${String(response.status)}): ${url}`);
  }

  const html = await response.text();
  return new Map(extractTransfermarktPortraitUrlsFromHtml(html));
}

async function main(): Promise<void> {
  loadEnvFile();

  await NestFactory.createApplicationContext(SeedAppModule, {
    logger: ['error', 'warn'],
  });

  const prisma = new PrismaClient();
  const seasonId = resolveTransfermarktSeasonId();

  try {
    const teams = await prisma.$queryRaw<{ id: string; name: string; external_id: string }[]>`
      SELECT t.id::text AS id, t.name, t.external_id
      FROM teams t
      WHERE t.external_id IS NOT NULL
      ORDER BY t.name
    `;

    let updated = 0;
    let missing = 0;
    let failedTeams = 0;

    for (const team of teams) {
      try {
        const portraits = await fetchSquadPortraits(team.external_id, seasonId);
        const players = await prisma.player.findMany({
          where: { teamId: team.id, externalId: { not: null } },
          select: { id: true, externalId: true, imageUrl: true },
        });

        for (const player of players) {
          const portraitUrl =
            player.externalId === null ? undefined : portraits.get(player.externalId);

          if (portraitUrl === undefined) {
            missing += 1;
            continue;
          }

          if (player.imageUrl === portraitUrl) {
            continue;
          }

          await prisma.player.update({
            where: { id: player.id },
            data: { imageUrl: portraitUrl },
          });
          updated += 1;
        }

        logger.log(`${team.name}: ${String(portraits.size)} portraits`);
      } catch (error) {
        failedTeams += 1;
        logger.warn(
          `${team.name}: ${error instanceof Error ? error.message : 'squad scrape failed'}`,
        );
      }

      await sleep(REQUEST_DELAY_MS);
    }

    const withImage = await prisma.player.count({ where: { imageUrl: { not: null } } });
    const total = await prisma.player.count();

    logger.log(
      `Done: updated=${String(updated)} missing=${String(missing)} failedTeams=${String(failedTeams)} withImage=${String(withImage)}/${String(total)}`,
    );
  } finally {
    await prisma.$disconnect();
  }
}

void main();
