import { Injectable } from '@nestjs/common';

import type { ExternalProvider } from '../../../../core/external-reference/external-provider';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import type { Nation } from '../../domain/entities/nation.entity';
import type { NationRepository } from '../../domain/repositories/nation.repository';
import type { NationId } from '../../domain/value-objects/nation-id.vo';
import { toNationDomain, toNationPersistence } from '../mappers/nation.mapper';

@Injectable()
export class PrismaNationRepository implements NationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: NationId): Promise<Nation | null> {
    const record = await this.prisma.country.findUnique({
      where: { id: id.value },
    });

    return record === null ? null : toNationDomain(record);
  }

  async findByExternalReference(
    provider: ExternalProvider,
    externalId: string,
  ): Promise<Nation | null> {
    const record = await this.prisma.country.findUnique({
      where: {
        provider_externalId: {
          provider,
          externalId,
        },
      },
    });

    return record === null ? null : toNationDomain(record);
  }

  async findAll(): Promise<readonly Nation[]> {
    const records = await this.prisma.country.findMany({
      orderBy: { name: 'asc' },
    });

    return records.map((record) => toNationDomain(record));
  }

  async save(nation: Nation): Promise<void> {
    const data = toNationPersistence(nation);

    await this.prisma.country.upsert({
      where: { id: data.id },
      create: data,
      update: {
        provider: data.provider,
        externalId: data.externalId,
        name: data.name,
        updatedAt: data.updatedAt,
      },
    });
  }
}
