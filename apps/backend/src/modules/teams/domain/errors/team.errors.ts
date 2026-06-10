import { DomainError } from '../../../../common/errors/domain.error';

export class InvalidTeamIdError extends DomainError {
  readonly code = 'INVALID_TEAM_ID';

  constructor(value: string) {
    super(`Invalid team id: "${value}"`);
  }
}

export class InvalidTeamNameError extends DomainError {
  readonly code = 'INVALID_TEAM_NAME';

  constructor() {
    super('Team name must be a non-empty string with at most 100 characters');
  }
}

export class InvalidStartingElevenError extends DomainError {
  readonly code = 'INVALID_STARTING_ELEVEN';

  constructor() {
    super('Starting eleven must have exactly 11 slots');
  }
}

export class TeamNotFoundError extends DomainError {
  readonly code = 'TEAM_NOT_FOUND';

  constructor(teamId: string) {
    super(`Team with id "${teamId}" was not found`);
  }
}

export class InvalidTeamShortNameError extends DomainError {
  readonly code = 'INVALID_TEAM_SHORT_NAME';

  constructor() {
    super('Team short name must be between 1 and 32 characters');
  }
}

export class InvalidTeamExternalReferenceError extends DomainError {
  readonly code = 'INVALID_TEAM_EXTERNAL_REFERENCE';

  constructor() {
    super('Team external reference requires a non-empty external ID');
  }
}

export class TeamAlreadyImportedError extends DomainError {
  readonly code = 'CONFLICT_TEAM_ALREADY_IMPORTED';

  constructor(provider: string, externalId: string) {
    super(`Team already imported: ${provider}/${externalId}`);
  }
}
