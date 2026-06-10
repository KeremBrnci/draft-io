import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import type { CardType } from '../../domain/entities/card-type.entity';
import type { CardTypeRepository } from '../../domain/repositories/card-type.repository';
import type { ReferenceCode } from '../../domain/value-objects/reference-code.vo';
import type { ReferenceId } from '../../domain/value-objects/reference-id.vo';
import { toCardTypeDomain, toCardTypePersistence } from '../mappers/card-type.mapper';

@Injectable()
export class PrismaCardTypeRepository implements CardTypeRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: ReferenceId): Promise<CardType | null> {
    const record = await this.prisma.cardType.findUnique({ where: { id: id.value } });
    return record === null ? null : toCardTypeDomain(record);
  }

  async findByCode(code: ReferenceCode): Promise<CardType | null> {
    const record = await this.prisma.cardType.findUnique({ where: { code: code.value } });
    return record === null ? null : toCardTypeDomain(record);
  }

  async findAll(options?: { readonly activeOnly?: boolean }): Promise<readonly CardType[]> {
    const records = await this.prisma.cardType.findMany({
      ...(options?.activeOnly === true ? { where: { isActive: true } } : {}),
      orderBy: { code: 'asc' },
    });

    return records.map((record) => toCardTypeDomain(record));
  }

  async save(cardType: CardType): Promise<void> {
    const data = toCardTypePersistence(cardType);

    await this.prisma.cardType.upsert({
      where: { id: data.id },
      create: data,
      update: {
        name: data.name,
        description: data.description,
        isActive: data.isActive,
        updatedAt: data.updatedAt,
      },
    });
  }
}
