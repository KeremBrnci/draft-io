import { DomainError } from '../../../../common/errors/domain.error';

export class InvalidPositionError extends DomainError {
  readonly code = 'INVALID_POSITION';

  constructor(value: string) {
    super(`Invalid position code: "${value}"`);
  }
}
