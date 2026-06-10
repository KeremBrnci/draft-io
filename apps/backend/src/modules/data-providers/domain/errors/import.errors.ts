import { DomainError } from '../../../../common/errors/domain.error';

export class CompetitionAlreadyImportedError extends DomainError {
  readonly code = 'CONFLICT_COMPETITION_ALREADY_IMPORTED';

  constructor(competitionName: string) {
    super(`Competition already imported: ${competitionName}`);
  }
}
