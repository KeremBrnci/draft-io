import { DomainError } from '../../../../common/errors/domain.error';

export class InvalidNationIdError extends DomainError {
  readonly code = 'INVALID_NATION_ID';

  constructor(value: string) {
    super(`Invalid nation id: "${value}"`);
  }
}

export class InvalidNationNameError extends DomainError {
  readonly code = 'INVALID_NATION_NAME';

  constructor() {
    super('Nation name must be a non-empty string with at most 100 characters');
  }
}

export class InvalidNationExternalReferenceError extends DomainError {
  readonly code = 'INVALID_NATION_EXTERNAL_REFERENCE';

  constructor(message: string) {
    super(message);
  }
}

export class NationNotFoundError extends DomainError {
  readonly code = 'NATION_NOT_FOUND';

  constructor(nationId: string) {
    super(`Nation with id "${nationId}" was not found`);
  }
}
