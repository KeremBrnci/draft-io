import { DomainError } from '../../../../common/errors/domain.error';

export class CardDomainError extends DomainError {
  readonly code = 'CARD_DOMAIN_ERROR';

  constructor(message: string) {
    super(message);
  }
}

export class InvalidCardIdError extends CardDomainError {
  constructor(value: string) {
    super(`Invalid card id: ${value}`);
    this.name = 'InvalidCardIdError';
  }
}

export class InvalidCardOverallError extends CardDomainError {
  constructor(value: number) {
    super(`Card overall must be an integer between 1 and 99, got ${String(value)}`);
    this.name = 'InvalidCardOverallError';
  }
}

export class InvalidCardVersionError extends CardDomainError {
  constructor(value: string) {
    super(`Invalid card version: ${value}`);
    this.name = 'InvalidCardVersionError';
  }
}

export class CardPlayerReferenceError extends CardDomainError {
  constructor(message: string) {
    super(message);
    this.name = 'CardPlayerReferenceError';
  }
}

export class InvalidReferenceIdError extends CardDomainError {
  constructor(value: string) {
    super(`Invalid reference id: ${value}`);
    this.name = 'InvalidReferenceIdError';
  }
}

export class InvalidReferenceCodeError extends CardDomainError {
  constructor(value: string) {
    super(`Invalid reference code: ${value}`);
    this.name = 'InvalidReferenceCodeError';
  }
}

export class CardNotFoundError extends DomainError {
  readonly code = 'CARD_NOT_FOUND';

  constructor(id: string) {
    super(`Card not found: ${id}`);
  }
}

export class InactiveReferenceError extends CardDomainError {
  constructor(entity: string, code: string) {
    super(`${entity} is inactive: ${code}`);
    this.name = 'InactiveReferenceError';
  }
}
