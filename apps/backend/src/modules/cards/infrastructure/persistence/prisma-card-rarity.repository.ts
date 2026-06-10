import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import type { CardRarity } from '../../domain/entities/card-rarity.entity';
import type { CardRarityRepository } from '../../domain/repositories/card-rarity.repository';
import type { ReferenceCode } from '../../domain/value-objects/reference-code.vo';
import type { ReferenceId } from '../../domain/value-objects/reference-id.vo';
import { toCardRarityDomain, toCardRarityPersistence } from '../mappers/card-rarity.mapper';

@Injectable()
export class PrismaCardRarityRepository implements CardRarityRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: ReferenceId): Promise<CardRarity | null> {
    const record = await this.prisma.cardRarity.findUnique({ where: { id: id.value } });
    return record === null ? null : toCardRarityDomain(record);
  }

  async findByCode(code: ReferenceCode): Promise<CardRarity | null> {
    const record = await this.prisma.cardRarity.findUnique({ where: { code: code.value } });
    return record === null ? null : toCardRarityDomain(record);
  }

  async findAll(options?: { readonly activeOnly?: boolean }): Promise<readonly CardRarity[]> {
    const records = await this.prisma.cardRarity.findMany({
      ...(options?.activeOnly === true ? { where: { isActive: true } } : {}),
      orderBy: { sortOrder: 'asc' },
    });

    return records.map((record) => toCardRarityDomain(record));
  }

  async save(cardRarity: CardRarity): Promise<void> {
    const data = toCardRarityPersistence(cardRarity);

    await this.prisma.cardRarity.upsert({
      where: { id: data.id },
      create: data,
      update: {
        name: data.name,
        description: data.description,
        sortOrder: data.sortOrder,
        isActive: data.isActive,
        updatedAt: data.updatedAt,
      },
    });
  }
}
