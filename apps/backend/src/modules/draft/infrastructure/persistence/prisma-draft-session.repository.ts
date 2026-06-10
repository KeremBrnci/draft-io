import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import type { DraftSession } from '../../domain/repositories/draft-session.repository';
import type { DraftSessionRepository } from '../../domain/repositories/draft-session.repository';
import {
  toDraftSessionDomain,
  toDraftSessionPersistence,
} from '../mappers/draft-session.mapper';

@Injectable()
export class PrismaDraftSessionRepository implements DraftSessionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(session: DraftSession): Promise<void> {
    const { session: sessionData, participants } = toDraftSessionPersistence(session);

    await this.prisma.$transaction(async (tx) => {
      await tx.draftSession.upsert({
        where: { id: sessionData.id },
        create: sessionData,
        update: {
          status: sessionData.status,
          rosterSize: sessionData.rosterSize,
          config: sessionData.config,
          updatedAt: sessionData.updatedAt,
        },
      });

      await tx.draftParticipantState.deleteMany({
        where: { draftSessionId: sessionData.id },
      });

      if (participants.length > 0) {
        await tx.draftParticipantState.createMany({
          data: participants.map((participant) => ({
            ...participant,
            id: uuidv4(),
          })),
        });
      }
    });
  }

  async findByLobbyId(lobbyId: string): Promise<DraftSession | null> {
    const record = await this.prisma.draftSession.findUnique({
      where: { lobbyId },
      include: { participants: true },
    });

    return record === null ? null : toDraftSessionDomain(record);
  }

  async findById(id: string): Promise<DraftSession | null> {
    const record = await this.prisma.draftSession.findUnique({
      where: { id },
      include: { participants: true },
    });

    return record === null ? null : toDraftSessionDomain(record);
  }
}
