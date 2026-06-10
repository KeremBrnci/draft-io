import { HttpStatus } from '@nestjs/common';
import { describe, expect, it } from 'vitest';

import { DomainError } from '../errors/domain.error';

import { mapDomainErrorToHttpStatus } from './domain-error-http.mapper';

class TestNotFoundError extends DomainError {
  readonly code = 'PLAYER_NOT_FOUND';
  constructor() {
    super('not found');
  }
}

class TestInvalidError extends DomainError {
  readonly code = 'INVALID_PLAYER_NAME';
  constructor() {
    super('invalid');
  }
}

class TestUnknownError extends DomainError {
  readonly code = 'BUSINESS_RULE_VIOLATION';
  constructor() {
    super('violation');
  }
}

describe('mapDomainErrorToHttpStatus', () => {
  it('maps *_NOT_FOUND to 404', () => {
    expect(mapDomainErrorToHttpStatus(new TestNotFoundError())).toBe(HttpStatus.NOT_FOUND);
  });

  it('maps INVALID_* to 400', () => {
    expect(mapDomainErrorToHttpStatus(new TestInvalidError())).toBe(HttpStatus.BAD_REQUEST);
  });

  it('maps unknown codes to 422', () => {
    expect(mapDomainErrorToHttpStatus(new TestUnknownError())).toBe(
      HttpStatus.UNPROCESSABLE_ENTITY,
    );
  });
});
