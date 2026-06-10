import { DomainError } from '../../../../common/errors/domain.error';

export class InvalidFormationCodeError extends DomainError {
  readonly code = 'INVALID_FORMATION_CODE';

  constructor(value: string) {
    super(`Invalid formation code: "${value}"`);
  }
}

export class FormationNotFoundError extends DomainError {
  readonly code = 'FORMATION_NOT_FOUND';

  constructor(code: string) {
    super(`Formation with code "${code}" was not found`);
  }
}
