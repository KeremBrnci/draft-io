import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import type { Card } from '../../domain/entities/card.entity';
import type { CardListFilter, CardRepository } from '../../domain/repositories/card.repository';
import type { CardId } from '../../domain/value-objects/card-id.vo';
import { toCardDomain, toCardPersistence } from '../mappers/card.mapper';

import { toPrismaCardWhere } from './card-list-filter.prisma';

@Injectable()
export class PrismaCardRepository implements CardRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: CardId): Promise<Card | null> {
    const record = await this.prisma.card.findUnique({ where: { id: id.value } });
    return record === null ? null : toCardDomain(record);
  }

  async findAll(filter?: CardListFilter): Promise<readonly Card[]> {
    const records = await this.prisma.card.findMany({
      where: toPrismaCardWhere(filter),
      orderBy: [{ overall: 'desc' }, { createdAt: 'desc' }],
    });

    return records.map((record) => toCardDomain(record));
  }

  async findByPlayerId(playerId: string, filter?: CardListFilter): Promise<readonly Card[]> {
    return this.findAll({ ...filter, playerId });
  }

  async save(card: Card): Promise<void> {
    const data = toCardPersistence(card);

    await this.prisma.card.upsert({
      where: { id: data.id },
      create: data,
      update: {
        cardTypeId: data.cardTypeId,
        cardRarityId: data.cardRarityId,
        cardTemplateId: data.cardTemplateId,
        overall: data.overall,
        overallSource: data.overallSource,
        cardVersion: data.cardVersion,
        releaseDate: data.releaseDate,
        isActive: data.isActive,
        updatedAt: data.updatedAt,
      },
    });
  }
}
