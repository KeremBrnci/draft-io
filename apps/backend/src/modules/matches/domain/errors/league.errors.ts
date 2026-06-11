import { DomainError } from '../../../../common/errors/domain.error';

export class LeagueNotCompletedError extends DomainError {
  readonly code = 'LEAGUE_NOT_COMPLETED';

  constructor() {
    super('League must be completed before starting a new round');
  }
}
