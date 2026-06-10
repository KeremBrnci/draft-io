import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import type { ImportJob } from '../../domain/entities/import-job.entity';
import { ImportJobStatus } from '../../domain/enums/import-job-status';
import type { ImportJobRepository } from '../../domain/repositories/import-job.repository';
import type { ImportJobId } from '../../domain/value-objects/import-job-id.vo';
import { toImportJobDomain, toImportJobPersistence } from '../mappers/import-job.mapper';

@Injectable()
export class PrismaImportJobRepository implements ImportJobRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: ImportJobId): Promise<ImportJob | null> {
    const record = await this.prisma.importJob.findUnique({ where: { id: id.value } });
    return record === null ? null : toImportJobDomain(record);
  }

  async findRecent(limit: number): Promise<readonly ImportJob[]> {
    const records = await this.prisma.importJob.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return records.map((record) => toImportJobDomain(record));
  }

  async countFailed(): Promise<number> {
    return this.prisma.importJob.count({
      where: { status: ImportJobStatus.FAILED },
    });
  }

  async countCompletedSince(since: Date): Promise<number> {
    return this.prisma.importJob.count({
      where: {
        status: ImportJobStatus.COMPLETED,
        finishedAt: { gte: since },
      },
    });
  }

  async save(job: ImportJob): Promise<void> {
    const data = toImportJobPersistence(job);

    await this.prisma.importJob.upsert({
      where: { id: data.id },
      create: data,
      update: {
        status: data.status,
        startedAt: data.startedAt,
        finishedAt: data.finishedAt,
        totalRecords: data.totalRecords,
        processedRecords: data.processedRecords,
        failedRecords: data.failedRecords,
        errorMessage: data.errorMessage,
        updatedAt: data.updatedAt,
      },
    });
  }
}
