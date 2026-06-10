import { DomainError } from '../../../../common/errors/domain.error';

export class InvalidLobbyNameError extends DomainError {
  readonly code = 'INVALID_LOBBY_NAME';

  constructor(value: string) {
    super(`Invalid lobby name: "${value}"`);
  }
}

export class InvalidLobbyCodeError extends DomainError {
  readonly code = 'INVALID_LOBBY_CODE';

  constructor(value: string) {
    super(`Invalid lobby code: "${value}"`);
  }
}

export class InvalidParticipantDisplayNameError extends DomainError {
  readonly code = 'INVALID_PARTICIPANT_DISPLAY_NAME';

  constructor(value: string) {
    super(`Invalid participant display name: "${value}"`);
  }
}

export class InvalidLobbyCapacityError extends DomainError {
  readonly code = 'INVALID_LOBBY_CAPACITY';

  constructor(value: number) {
    super(`Invalid lobby capacity: ${String(value)}`);
  }
}

export class LobbyNotFoundError extends DomainError {
  readonly code = 'LOBBY_NOT_FOUND';

  constructor(identifier: string) {
    super(`Lobby not found: "${identifier}"`);
  }
}

export class LobbyNotJoinableError extends DomainError {
  readonly code = 'LOBBY_NOT_JOINABLE';

  constructor(status: string) {
    super(`Lobby is not joinable while status is ${status}`);
  }
}

export class LobbyFullError extends DomainError {
  readonly code = 'LOBBY_FULL';

  constructor() {
    super('Lobby is full');
  }
}

export class DuplicateParticipantDisplayNameError extends DomainError {
  readonly code = 'CONFLICT_PARTICIPANT_DISPLAY_NAME';

  constructor(displayName: string) {
    super(`Display name already taken in lobby: "${displayName}"`);
  }
}

export class InvalidLobbySessionError extends DomainError {
  readonly code = 'INVALID_LOBBY_SESSION';

  constructor() {
    super('Invalid lobby session token');
  }
}

export class NotLobbyHostError extends DomainError {
  readonly code = 'NOT_LOBBY_HOST';

  constructor() {
    super('Only the lobby host can start the game');
  }
}

export class LobbyNotStartableError extends DomainError {
  readonly code = 'LOBBY_NOT_STARTABLE';

  constructor() {
    super('All players must be ready before starting');
  }
}

export class LobbyExpiredError extends DomainError {
  readonly code = 'LOBBY_EXPIRED';

  constructor(code: string) {
    super(`Lobby code expired: ${code}`);
  }
}

export class InvalidRoomPhaseTransitionError extends DomainError {
  readonly code = 'INVALID_ROOM_PHASE_TRANSITION';

  constructor(from: string, to: string) {
    super(`Cannot transition room phase from ${from} to ${to}`);
  }
}

export class DraftRosterIncompleteError extends DomainError {
  readonly code = 'DRAFT_ROSTER_INCOMPLETE';

  constructor() {
    super('Complete your starting eleven before marking ready');
  }
}
