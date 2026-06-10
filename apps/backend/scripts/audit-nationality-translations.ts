import { findUntranslatedNationalities } from '@draft-io/shared-utils';
import { PrismaClient } from '@prisma/client';

async function main(): Promise<void> {
  const prisma = new PrismaClient();

  try {
    const rows = await prisma.player.groupBy({
      by: ['nationality'],
      _count: { _all: true },
      orderBy: { _count: { nationality: 'desc' } },
    });

    const values = rows.map((row) => row.nationality);
    const untranslated = findUntranslatedNationalities(values);

    if (untranslated.length > 0) {
      console.error('Untranslated nationalities found:');
      for (const nationality of untranslated) {
        const count = rows.find((row) => row.nationality === nationality)?._count._all ?? 0;
        console.error(`- ${nationality} (${count})`);
      }
      process.exitCode = 1;
      return;
    }

    const providerStyle = values.filter((value) => /^(THE |DR )|,|'/i.test(value));
    console.log(`All ${values.length} nationalities translate to Turkish.`);
    console.log(`Provider-style labels covered: ${providerStyle.length}`);
    for (const nationality of providerStyle) {
      console.log(`  ${nationality}`);
    }
  } finally {
    await prisma.$disconnect();
  }
}

void main();
