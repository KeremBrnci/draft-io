import { DomainError } from '../../../../common/errors/domain.error';

export class ExternalPlayerNotFoundError extends DomainError {
  readonly code = 'EXTERNAL_PLAYER_NOT_FOUND';

  constructor(externalId: string) {
    super(`External player not found: ${externalId}`);
  }
}

export class ExternalTeamNotFoundError extends DomainError {
  readonly code = 'EXTERNAL_TEAM_NOT_FOUND';

  constructor(externalId: string) {
    super(`External team not found: ${externalId}`);
  }
}

export class ExternalLeagueNotFoundError extends DomainError {
  readonly code = 'EXTERNAL_LEAGUE_NOT_FOUND';

  constructor(externalId: string) {
    super(`External league not found: ${externalId}`);
  }
}

export class ProviderConfigurationError extends DomainError {
  readonly code = 'PROVIDER_CONFIGURATION_ERROR';

  constructor(message: string) {
    super(message);
  }
}

export class ProviderRateLimitError extends DomainError {
  readonly code = 'PROVIDER_RATE_LIMIT_ERROR';

  constructor() {
    super('External provider rate limit exceeded');
  }
}

export class ProviderTransportError extends DomainError {
  readonly code = 'PROVIDER_TRANSPORT_ERROR';

  constructor(message: string) {
    super(message);
  }
}

export class ProviderResponseError extends DomainError {
  readonly code = 'PROVIDER_RESPONSE_ERROR';
  readonly statusCode: number;

  constructor(statusCode: number, message: string) {
    super(`Provider responded with ${String(statusCode)}: ${message}`);
    this.statusCode = statusCode;
  }
}
