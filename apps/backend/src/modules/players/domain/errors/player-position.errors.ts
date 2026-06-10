import { DomainError } from '../../../../common/errors/domain.error';

export class InvalidPlayerPositionIdError extends DomainError {
  readonly code = 'INVALID_PLAYER_POSITION_ID';

  constructor(value: string) {
    super(`Invalid player position ID: ${value}`);
  }
}

export class PlayerPositionsRequiredError extends DomainError {
  readonly code = 'PLAYER_POSITIONS_REQUIRED';

  constructor() {
    super('Player must have at least one position');
  }
}

export class PlayerPrimaryPositionRequiredError extends DomainError {
  readonly code = 'PLAYER_PRIMARY_POSITION_REQUIRED';

  constructor() {
    super('Player must have exactly one primary position');
  }
}

export class PlayerMultiplePrimaryPositionsError extends DomainError {
  readonly code = 'PLAYER_MULTIPLE_PRIMARY_POSITIONS';

  constructor() {
    super('Player cannot have more than one primary position');
  }
}

export class DuplicatePlayerPositionError extends DomainError {
  readonly code = 'DUPLICATE_PLAYER_POSITION';

  constructor(positionCode: string) {
    super(`Duplicate position assignment: ${positionCode}`);
  }
}
