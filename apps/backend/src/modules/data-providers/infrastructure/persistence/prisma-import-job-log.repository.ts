import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';

import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import type {
  ImportJobLogEntry,
  ImportJobLogRepository,
  ImportLogLevel,
} from '../../domain/repositories/import-job-log.repository';
import type { ImportJobId } from '../../domain/value-objects/import-job-id.vo';

@Injectable()
export class PrismaImportJobLogRepository implements ImportJobLogRepository {
  constructor(private readonly prisma: PrismaService) {}

  async append(jobId: ImportJobId, level: ImportLogLevel, message: string): Promise<void> {
    await this.prisma.importJobLog.create({
      data: {
        id: randomUUID(),
        jobId: jobId.value,
        level,
        message: message.slice(0, 1024),
      },
    });
  }

  async findByJobId(jobId: ImportJobId, limit = 200): Promise<readonly ImportJobLogEntry[]> {
    const records = await this.prisma.importJobLog.findMany({
      where: { jobId: jobId.value },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return records.map((record) => ({
      id: record.id,
      jobId: record.jobId,
      level: record.level as ImportLogLevel,
      message: record.message,
      createdAt: record.createdAt,
    }));
  }
}
