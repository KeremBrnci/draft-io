import { DomainError } from '../../../../common/errors/domain.error';

export class DraftSessionNotFoundError extends DomainError {
  readonly code = 'DRAFT_SESSION_NOT_FOUND';

  constructor(reference: string) {
    super(`Draft session not found: ${reference}`);
  }
}

export class DraftSessionAlreadyExistsError extends DomainError {
  readonly code = 'CONFLICT_DRAFT_SESSION';

  constructor(lobbyId: string) {
    super(`Draft session already exists for lobby: ${lobbyId}`);
  }
}

export class DraftParticipantNotFoundError extends DomainError {
  readonly code = 'DRAFT_PARTICIPANT_NOT_FOUND';

  constructor(participantId: string) {
    super(`Draft participant not found: ${participantId}`);
  }
}

export class InvalidDraftPickError extends DomainError {
  readonly code = 'INVALID_DRAFT_PICK';

  constructor(message: string) {
    super(message);
  }
}
