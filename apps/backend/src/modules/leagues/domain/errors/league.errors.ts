import { DomainError } from '../../../../common/errors/domain.error';

export class InvalidLeagueIdError extends DomainError {
  readonly code = 'INVALID_LEAGUE_ID';

  constructor(value: string) {
    super(`Invalid league id: "${value}"`);
  }
}

export class InvalidLeagueNameError extends DomainError {
  readonly code = 'INVALID_LEAGUE_NAME';

  constructor() {
    super('League name must be a non-empty string with at most 100 characters');
  }
}

export class LeagueNotFoundError extends DomainError {
  readonly code = 'LEAGUE_NOT_FOUND';

  constructor(leagueId: string) {
    super(`League with id "${leagueId}" was not found`);
  }
}

export class InvalidLeagueExternalReferenceError extends DomainError {
  readonly code = 'INVALID_LEAGUE_EXTERNAL_REFERENCE';

  constructor() {
    super('League external reference requires a non-empty external ID');
  }
}

export class LeagueAlreadyImportedError extends DomainError {
  readonly code = 'CONFLICT_LEAGUE_ALREADY_IMPORTED';

  constructor(provider: string, externalId: string) {
    super(`League already imported: ${provider}/${externalId}`);
  }
}
