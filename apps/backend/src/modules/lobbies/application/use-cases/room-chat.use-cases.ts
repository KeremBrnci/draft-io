import type { RoomChatMessageDto } from '@draft-io/shared-types';

import { LobbyLifecycleService } from '../services/lobby-lifecycle.service';
import type { RoomEventsPublisher } from '../services/room-events.publisher';
import { RoomPhase } from '../../domain/enums/room-phase.enum';
import {
  InvalidRoomChatMessageError,
  RoomChatNotAllowedError,
} from '../../domain/errors/room-chat.errors';
import { InvalidLobbySessionError } from '../../domain/errors/lobby.errors';
import { RoomEventName } from '../../domain/events/room.events';
import type { LobbyRepository } from '../../domain/repositories/lobby.repository';
import type { RoomChatRepository } from '../../domain/repositories/room-chat.repository';
import { LobbyCode } from '../../domain/value-objects/lobby-code.vo';
import { SessionToken } from '../../domain/value-objects/session-token.vo';

const MAX_MESSAGE_LENGTH = 280;

function normalizeMessageBody(body: string): string {
  return body.replace(/\s+/g, ' ').trim();
}

function toRoomChatMessageDto(
  lobbyCode: string,
  message: {
    readonly id: string;
    readonly participantId: string;
    readonly displayName: string;
    readonly body: string;
    readonly createdAt: Date;
  },
): RoomChatMessageDto {
  return {
    id: message.id,
    lobbyCode,
    participantId: message.participantId,
    displayName: message.displayName,
    body: message.body,
    sentAt: message.createdAt.toISOString(),
  };
}

export class ListRoomChatMessagesUseCase {
  private readonly lifecycle: LobbyLifecycleService;

  constructor(
    private readonly lobbyRepository: LobbyRepository,
    private readonly roomChatRepository: RoomChatRepository,
  ) {
    this.lifecycle = new LobbyLifecycleService(lobbyRepository);
  }

  async execute(command: {
    readonly code: string;
    readonly sessionToken: string;
  }): Promise<readonly RoomChatMessageDto[]> {
    const lobby = await this.lifecycle.requireActiveLobby(LobbyCode.create(command.code));
    const participant = lobby.findParticipantBySessionToken(
      SessionToken.reconstitute(command.sessionToken),
    );
    if (participant === null) {
      throw new InvalidLobbySessionError();
    }

    if (lobby.phase !== RoomPhase.MATCHES) {
      throw new RoomChatNotAllowedError();
    }

    const messages = await this.roomChatRepository.listByLobbyId(lobby.id.value);
    return messages.map((message) => toRoomChatMessageDto(lobby.code.value, message));
  }
}

export class SendRoomChatMessageUseCase {
  private readonly lifecycle: LobbyLifecycleService;

  constructor(
    private readonly lobbyRepository: LobbyRepository,
    private readonly roomChatRepository: RoomChatRepository,
    private readonly roomEventsPublisher: RoomEventsPublisher,
  ) {
    this.lifecycle = new LobbyLifecycleService(lobbyRepository);
  }

  async execute(command: {
    readonly code: string;
    readonly sessionToken: string;
    readonly body: string;
  }): Promise<RoomChatMessageDto> {
    const lobby = await this.lifecycle.requireActiveLobby(LobbyCode.create(command.code));
    const participant = lobby.findParticipantBySessionToken(
      SessionToken.reconstitute(command.sessionToken),
    );
    if (participant === null) {
      throw new InvalidLobbySessionError();
    }

    if (lobby.phase !== RoomPhase.MATCHES) {
      throw new RoomChatNotAllowedError();
    }

    const body = normalizeMessageBody(command.body);
    if (body.length === 0 || body.length > MAX_MESSAGE_LENGTH) {
      throw new InvalidRoomChatMessageError();
    }

    const saved = await this.roomChatRepository.create({
      lobbyId: lobby.id.value,
      participantId: participant.id,
      displayName: participant.displayName.value,
      body,
    });

    const message = toRoomChatMessageDto(lobby.code.value, saved);

    await this.roomEventsPublisher.publish(lobby.code.value, RoomEventName.CHAT_MESSAGE, {
      lobbyCode: lobby.code.value,
      phase: lobby.phase,
      participantId: message.participantId,
      messageId: message.id,
      displayName: message.displayName,
      body: message.body,
      sentAt: message.sentAt,
    });

    return message;
  }
}
