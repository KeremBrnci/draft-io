import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import type { CardTemplate } from '../../domain/entities/card-template.entity';
import type { CardTemplateRepository } from '../../domain/repositories/card-template.repository';
import type { ReferenceId } from '../../domain/value-objects/reference-id.vo';
import { toCardTemplateDomain, toCardTemplatePersistence } from '../mappers/card-template.mapper';

@Injectable()
export class PrismaCardTemplateRepository implements CardTemplateRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: ReferenceId): Promise<CardTemplate | null> {
    const record = await this.prisma.cardTemplate.findUnique({ where: { id: id.value } });
    return record === null ? null : toCardTemplateDomain(record);
  }

  async findByCardTypeId(cardTypeId: ReferenceId): Promise<readonly CardTemplate[]> {
    const records = await this.prisma.cardTemplate.findMany({
      where: { cardTypeId: cardTypeId.value },
      orderBy: { name: 'asc' },
    });

    return records.map((record) => toCardTemplateDomain(record));
  }

  async findAll(options?: { readonly activeOnly?: boolean }): Promise<readonly CardTemplate[]> {
    const records = await this.prisma.cardTemplate.findMany({
      ...(options?.activeOnly === true ? { where: { isActive: true } } : {}),
      orderBy: { name: 'asc' },
    });

    return records.map((record) => toCardTemplateDomain(record));
  }

  async save(cardTemplate: CardTemplate): Promise<void> {
    const data = toCardTemplatePersistence(cardTemplate);

    await this.prisma.cardTemplate.upsert({
      where: { id: data.id },
      create: data,
      update: {
        name: data.name,
        backgroundImage: data.backgroundImage,
        borderImage: data.borderImage,
        animationKey: data.animationKey,
        primaryColor: data.primaryColor,
        secondaryColor: data.secondaryColor,
        isActive: data.isActive,
        updatedAt: data.updatedAt,
      },
    });
  }
}
