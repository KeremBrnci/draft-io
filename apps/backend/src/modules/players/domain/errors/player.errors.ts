import { DomainError } from '../../../../common/errors/domain.error';

export class PlayerNotFoundError extends DomainError {
  readonly code = 'PLAYER_NOT_FOUND';

  constructor(playerId: string) {
    super(`Player not found: ${playerId}`);
  }
}

export class InvalidPlayerIdError extends DomainError {
  readonly code = 'INVALID_PLAYER_ID';

  constructor(value: string) {
    super(`Invalid player ID: ${value}`);
  }
}

export class InvalidOverallRatingError extends DomainError {
  readonly code = 'INVALID_OVERALL_RATING';

  constructor(value: number) {
    super(`Overall rating must be an integer between 1 and 99, received: ${String(value)}`);
  }
}

export class InvalidPlayerNameError extends DomainError {
  readonly code = 'INVALID_PLAYER_NAME';

  constructor() {
    super('Player name must be between 1 and 100 characters');
  }
}

export class InvalidExternalReferenceError extends DomainError {
  readonly code = 'INVALID_EXTERNAL_REFERENCE';

  constructor() {
    super('External reference requires a non-empty external ID');
  }
}

export class InvalidPersonNameError extends DomainError {
  readonly code = 'INVALID_PERSON_NAME';

  constructor() {
    super('Person name must be between 1 and 100 characters');
  }
}

export class InvalidDisplayNameError extends DomainError {
  readonly code = 'INVALID_DISPLAY_NAME';

  constructor() {
    super('Display name must be between 1 and 120 characters');
  }
}

export class InvalidNationalityError extends DomainError {
  readonly code = 'INVALID_NATIONALITY';

  constructor() {
    super('Nationality must be a non-empty string');
  }
}

export class InvalidBirthDateError extends DomainError {
  readonly code = 'INVALID_BIRTH_DATE';

  constructor(message: string) {
    super(message);
  }
}

export class InvalidPlayerAgeError extends DomainError {
  readonly code = 'INVALID_PLAYER_AGE';

  constructor(value: number) {
    super(`Player age must be an integer between 15 and 50, received: ${String(value)}`);
  }
}

export class InvalidMarketValueError extends DomainError {
  readonly code = 'INVALID_MARKET_VALUE';

  constructor(value: number) {
    super(`Market value must be a non-negative number, received: ${String(value)}`);
  }
}

export class InvalidImageUrlError extends DomainError {
  readonly code = 'INVALID_IMAGE_URL';

  constructor() {
    super('Image URL must be a valid http or https URL');
  }
}

export class PlayerAlreadyImportedError extends DomainError {
  readonly code = 'CONFLICT_PLAYER_ALREADY_IMPORTED';

  constructor(provider: string, externalId: string) {
    super(`Player already imported: ${provider}/${externalId}`);
  }
}
