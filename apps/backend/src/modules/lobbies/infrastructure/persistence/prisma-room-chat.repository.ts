import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';

import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import type {
  CreateRoomChatMessageInput,
  RoomChatMessageRecord,
  RoomChatRepository,
} from '../../domain/repositories/room-chat.repository';

const DEFAULT_LIST_LIMIT = 100;

@Injectable()
export class PrismaRoomChatRepository implements RoomChatRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listByLobbyId(
    lobbyId: string,
    limit = DEFAULT_LIST_LIMIT,
  ): Promise<readonly RoomChatMessageRecord[]> {
    const records = await this.prisma.roomChatMessage.findMany({
      where: { lobbyId },
      orderBy: { createdAt: 'asc' },
      take: limit,
    });

    return records.map((record) => ({
      id: record.id,
      lobbyId: record.lobbyId,
      participantId: record.participantId,
      displayName: record.displayName,
      body: record.body,
      createdAt: record.createdAt,
    }));
  }

  async create(input: CreateRoomChatMessageInput): Promise<RoomChatMessageRecord> {
    const record = await this.prisma.roomChatMessage.create({
      data: {
        id: randomUUID(),
        lobbyId: input.lobbyId,
        participantId: input.participantId,
        displayName: input.displayName,
        body: input.body,
      },
    });

    return {
      id: record.id,
      lobbyId: record.lobbyId,
      participantId: record.participantId,
      displayName: record.displayName,
      body: record.body,
      createdAt: record.createdAt,
    };
  }

  async deleteByLobbyId(lobbyId: string): Promise<void> {
    await this.prisma.roomChatMessage.deleteMany({ where: { lobbyId } });
  }
}
