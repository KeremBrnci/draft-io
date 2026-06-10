import { randomUUID } from 'node:crypto';

import type { PrismaClient } from '@prisma/client';

const BATCH_SIZE = 250;
const DEFAULT_OVERALL = 70;
const CARD_TYPE_CODE = 'BASE';
const CARD_RARITY_CODE = 'COMMON';
const CARD_VERSION = '2026';

interface CardCatalogIds {
  readonly cardTypeId: string;
  readonly cardRarityId: string;
  readonly cardTemplateId: string;
}

/** Ensures every active player has a base draft card. Returns total active cards. */
export async function seedPlayerCardsIfMissing(prisma: PrismaClient): Promise<number> {
  const catalog = await ensureCardCatalog(prisma);
  const overallByPlayerId = await loadLatestOverallByPlayerId(prisma);

  const playersWithoutCards = await prisma.player.findMany({
    where: {
      status: 'ACTIVE',
      cards: { none: { isActive: true } },
    },
    select: { id: true },
  });

  for (let offset = 0; offset < playersWithoutCards.length; offset += BATCH_SIZE) {
    const batch = playersWithoutCards.slice(offset, offset + BATCH_SIZE);
    const now = new Date();

    await prisma.card.createMany({
      data: batch.map((player) => ({
        id: randomUUID(),
        playerId: player.id,
        cardTypeId: catalog.cardTypeId,
        cardRarityId: catalog.cardRarityId,
        cardTemplateId: catalog.cardTemplateId,
        overall: overallByPlayerId.get(player.id) ?? DEFAULT_OVERALL,
        overallSource: 'CALCULATED',
        cardVersion: CARD_VERSION,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      })),
      skipDuplicates: true,
    });
  }

  return prisma.card.count({ where: { isActive: true } });
}

async function ensureCardCatalog(prisma: PrismaClient): Promise<CardCatalogIds> {
  const cardType = await prisma.cardType.upsert({
    where: { code: CARD_TYPE_CODE },
    create: {
      code: CARD_TYPE_CODE,
      name: 'Base Card',
      description: 'Default playable edition generated from player overall',
      isActive: true,
    },
    update: { isActive: true },
  });

  const cardRarity = await prisma.cardRarity.upsert({
    where: { code: CARD_RARITY_CODE },
    create: {
      code: CARD_RARITY_CODE,
      name: 'Common',
      description: 'Standard draft pool rarity',
      sortOrder: 10,
      isActive: true,
    },
    update: { isActive: true },
  });

  const existingTemplate = await prisma.cardTemplate.findFirst({
    where: { cardTypeId: cardType.id, name: 'Base Gold Template', isActive: true },
    select: { id: true },
  });

  const cardTemplateId =
    existingTemplate?.id ??
    (
      await prisma.cardTemplate.create({
        data: {
          cardTypeId: cardType.id,
          name: 'Base Gold Template',
          primaryColor: '#D4AF37',
          secondaryColor: '#FFFFFF',
          isActive: true,
        },
        select: { id: true },
      })
    ).id;

  return {
    cardTypeId: cardType.id,
    cardRarityId: cardRarity.id,
    cardTemplateId,
  };
}

async function loadLatestOverallByPlayerId(prisma: PrismaClient): Promise<Map<string, number>> {
  const rows = await prisma.$queryRaw<{ player_id: string; final_overall: number }[]>`
    SELECT DISTINCT ON (player_id)
      player_id,
      final_overall
    FROM overall_calculations
    ORDER BY player_id, created_at DESC
  `;

  return new Map(rows.map((row) => [row.player_id, row.final_overall]));
}
