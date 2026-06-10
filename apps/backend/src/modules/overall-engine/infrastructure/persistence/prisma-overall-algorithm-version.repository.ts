import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import type {
  OverallAlgorithmVersionRecord,
  OverallAlgorithmVersionRepository,
} from '../../domain/repositories/overall-algorithm-version.repository';

@Injectable()
export class PrismaOverallAlgorithmVersionRepository implements OverallAlgorithmVersionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async ensureVersion(
    code: string,
    name: string,
    description?: string,
  ): Promise<OverallAlgorithmVersionRecord> {
    const record = await this.prisma.overallAlgorithmVersion.upsert({
      where: { code },
      create: { code, name, description: description ?? null },
      update: { name, ...(description !== undefined ? { description } : {}) },
    });

    return toRecord(record);
  }

  async findById(id: string): Promise<OverallAlgorithmVersionRecord | null> {
    const record = await this.prisma.overallAlgorithmVersion.findUnique({ where: { id } });
    return record === null ? null : toRecord(record);
  }

  async findByCode(code: string): Promise<OverallAlgorithmVersionRecord | null> {
    const record = await this.prisma.overallAlgorithmVersion.findUnique({ where: { code } });
    return record === null ? null : toRecord(record);
  }
}

function toRecord(record: {
  id: string;
  code: string;
  name: string;
  description: string | null;
  isActive: boolean;
}): OverallAlgorithmVersionRecord {
  return {
    id: record.id,
    code: record.code,
    name: record.name,
    description: record.description,
    isActive: record.isActive,
  };
}
