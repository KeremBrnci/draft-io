import { DomainError } from '../../../../common/errors/domain.error';

export class RoomChatNotAllowedError extends DomainError {
  readonly code = 'ROOM_CHAT_NOT_ALLOWED';

  constructor() {
    super('Chat is only available during matches');
  }
}

export class InvalidRoomChatMessageError extends DomainError {
  readonly code = 'INVALID_ROOM_CHAT_MESSAGE';

  constructor() {
    super('Chat message must be between 1 and 280 characters');
  }
}
