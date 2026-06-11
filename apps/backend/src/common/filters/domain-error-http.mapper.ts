import { HttpStatus } from '@nestjs/common';

import type { DomainError } from '../errors/domain.error';

/**
 * Convention-based HTTP status mapping for domain errors.
 * Avoids per-module code registries that create tight coupling.
 *
 * Conventions:
 * - *_NOT_FOUND  -> 404
 * - INVALID_*    -> 400
 * - UNAUTHORIZED_* / FORBIDDEN_* -> 401 / 403 (future)
 * - default      -> 422
 */
export function mapDomainErrorToHttpStatus(error: DomainError): HttpStatus {
  const { code } = error;

  if (code.endsWith('_NOT_FOUND')) {
    return HttpStatus.NOT_FOUND;
  }

  if (code.startsWith('INVALID_')) {
    return HttpStatus.BAD_REQUEST;
  }

  if (code.startsWith('UNAUTHORIZED_')) {
    return HttpStatus.UNAUTHORIZED;
  }

  if (code.startsWith('FORBIDDEN_')) {
    return HttpStatus.FORBIDDEN;
  }

  if (code.startsWith('CONFLICT_')) {
    return HttpStatus.CONFLICT;
  }

  if (code === 'LEAGUE_NOT_COMPLETED') {
    return HttpStatus.CONFLICT;
  }

  if (code === 'LOBBY_EXPIRED') {
    return HttpStatus.GONE;
  }

  if (code === 'PROVIDER_CONFIGURATION_ERROR') {
    return HttpStatus.SERVICE_UNAVAILABLE;
  }

  if (code === 'PROVIDER_RATE_LIMIT_ERROR') {
    return HttpStatus.TOO_MANY_REQUESTS;
  }

  if (code === 'PROVIDER_TRANSPORT_ERROR') {
    return HttpStatus.BAD_GATEWAY;
  }

  if (code === 'PROVIDER_RESPONSE_ERROR') {
    return HttpStatus.BAD_GATEWAY;
  }

  return HttpStatus.UNPROCESSABLE_ENTITY;
}
