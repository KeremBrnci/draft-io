/**
 * Wipes all imported football data and import job history.
 * Keeps card catalog tables (card_types, card_rarities, card_templates) intact.
 *
 * Usage: pnpm --filter @draft-io/backend db:wipe-import
 */
import './load-env';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log('Wiping import data...');

  const [failedRecords, jobLogs, jobs, cards, playerPositions, players, teams, leagues, countries] =
    await prisma.$transaction([
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

  console.log('Deleted:');
  console.log(`  import_failed_records: ${String(failedRecords.count)}`);
  console.log(`  import_job_logs:       ${String(jobLogs.count)}`);
  console.log(`  import_jobs:           ${String(jobs.count)}`);
  console.log(`  cards:                 ${String(cards.count)}`);
  console.log(`  player_positions:      ${String(playerPositions.count)}`);
  console.log(`  players:               ${String(players.count)}`);
  console.log(`  teams:                 ${String(teams.count)}`);
  console.log(`  leagues:               ${String(leagues.count)}`);
  console.log(`  countries:             ${String(countries.count)}`);
  console.log('Done. Run pnpm --filter @draft-io/backend db:seed to repopulate.');
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
