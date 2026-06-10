import { randomUUID } from 'node:crypto';

import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import type {
  CreateImportFailedRecordProps,
  ImportFailedRecordEntry,
  ImportFailedRecordRepository,
  ImportFailedRecordType,
} from '../../domain/repositories/import-failed-record.repository';

@Injectable()
export class PrismaImportFailedRecordRepository implements ImportFailedRecordRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(props: CreateImportFailedRecordProps): Promise<ImportFailedRecordEntry> {
    const record = await this.prisma.importFailedRecord.create({
      data: {
        id: randomUUID(),
        jobId: props.jobId.value,
        recordType: props.recordType,
        externalId: props.externalId ?? null,
        slug: props.slug ?? null,
        displayName: props.displayName ?? null,
        errorMessage: props.errorMessage.slice(0, 1024),
      },
    });

    return this.toEntry(record);
  }

  async findByJobId(
    jobId: CreateImportFailedRecordProps['jobId'],
  ): Promise<readonly ImportFailedRecordEntry[]> {
    const records = await this.prisma.importFailedRecord.findMany({
      where: { jobId: jobId.value },
      orderBy: { createdAt: 'desc' },
    });

    return records.map((record) => this.toEntry(record));
  }

  async findUnresolvedByJobId(
    jobId: CreateImportFailedRecordProps['jobId'],
  ): Promise<readonly ImportFailedRecordEntry[]> {
    const records = await this.prisma.importFailedRecord.findMany({
      where: { jobId: jobId.value, resolved: false },
      orderBy: { createdAt: 'asc' },
    });

    return records.map((record) => this.toEntry(record));
  }

  async markResolved(id: string): Promise<void> {
    await this.prisma.importFailedRecord.update({
      where: { id },
      data: { resolved: true },
    });
  }

  private toEntry(record: {
    id: string;
    jobId: string;
    recordType: string;
    externalId: string | null;
    slug: string | null;
    displayName: string | null;
    errorMessage: string;
    resolved: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): ImportFailedRecordEntry {
    return {
      id: record.id,
      jobId: record.jobId,
      recordType: record.recordType as ImportFailedRecordType,
      externalId: record.externalId,
      slug: record.slug,
      displayName: record.displayName,
      errorMessage: record.errorMessage,
      resolved: record.resolved,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }
}
