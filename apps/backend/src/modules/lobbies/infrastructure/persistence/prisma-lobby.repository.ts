import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import type { Lobby } from '../../domain/entities/lobby.entity';
import type { LobbyRepository } from '../../domain/repositories/lobby.repository';
import type { LobbyCode } from '../../domain/value-objects/lobby-code.vo';
import type { LobbyId } from '../../domain/value-objects/lobby-id.vo';
import { toLobbyDomain, toLobbyPersistence } from '../mappers/lobby.mapper';

const participantInclude = {
  orderBy: { joinedAt: 'asc' as const },
  include: {
    formationOptions: {
      orderBy: { sortOrder: 'asc' as const },
    },
    coachOptions: {
      orderBy: { sortOrder: 'asc' as const },
    },
  },
};

@Injectable()
export class PrismaLobbyRepository implements LobbyRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: LobbyId): Promise<Lobby | null> {
    const record = await this.prisma.lobby.findUnique({
      where: { id: id.value },
      include: { participants: participantInclude },
    });

    return record === null ? null : toLobbyDomain(record);
  }

  async findByCode(code: LobbyCode): Promise<Lobby | null> {
    const record = await this.prisma.lobby.findUnique({
      where: { code: code.value },
      include: { participants: participantInclude },
    });

    return record === null ? null : toLobbyDomain(record);
  }

  async existsByCode(code: LobbyCode): Promise<boolean> {
    const count = await this.prisma.lobby.count({ where: { code: code.value } });
    return count > 0;
  }

  async save(lobby: Lobby): Promise<void> {
    const { lobby: lobbyData, participants } = toLobbyPersistence(lobby);

    await this.prisma.$transaction(async (tx) => {
      await tx.lobby.upsert({
        where: { id: lobbyData.id },
        create: lobbyData,
        update: {
          name: lobbyData.name,
          status: lobbyData.status,
          phase: lobbyData.phase,
          maxPlayers: lobbyData.maxPlayers,
          expiresAt: lobbyData.expiresAt,
          formationSelectionStartedAt: lobbyData.formationSelectionStartedAt,
          formationSelectionDeadline: lobbyData.formationSelectionDeadline,
          updatedAt: lobbyData.updatedAt,
        },
      });

      const existing = await tx.lobbyParticipant.findMany({
        where: { lobbyId: lobbyData.id },
        select: { id: true },
      });
      const existingIds = new Set(existing.map((item) => item.id));
      const nextIds = new Set(participants.map((participant) => participant.id));

      const idsToDelete = [...existingIds].filter((id) => !nextIds.has(id));

      if (idsToDelete.length > 0) {
        await tx.lobbyParticipant.deleteMany({ where: { id: { in: idsToDelete } } });
      }

      for (const participant of participants) {
        const { formationOptionIds, coachOptionIds, ...participantData } = participant;

        await tx.lobbyParticipant.upsert({
          where: { id: participant.id },
          create: participantData,
          update: {
            displayName: participant.displayName,
            isHost: participant.isHost,
            isReady: participant.isReady,
            phaseStatus: participant.phaseStatus,
            selectedFormationId: participant.selectedFormationId,
            selectedCoachId: participant.selectedCoachId,
            sessionToken: participant.sessionToken,
          },
        });

        await tx.lobbyParticipantFormationOption.deleteMany({
          where: { participantId: participant.id },
        });

        if (formationOptionIds.length > 0) {
          await tx.lobbyParticipantFormationOption.createMany({
            data: formationOptionIds.map((formationId, index) => ({
              participantId: participant.id,
              formationId,
              sortOrder: index,
            })),
          });
        }

        await tx.lobbyParticipantCoachOption.deleteMany({
          where: { participantId: participant.id },
        });

        if (coachOptionIds.length > 0) {
          await tx.lobbyParticipantCoachOption.createMany({
            data: coachOptionIds.map((coachId, index) => ({
              participantId: participant.id,
              coachId,
              sortOrder: index,
            })),
          });
        }
      }
    });
  }

  async delete(id: LobbyId): Promise<void> {
    await this.prisma.lobby.delete({ where: { id: id.value } });
  }
}
