import { DomainError } from '../../../../common/errors/domain.error';

export class CoachNotInPoolError extends DomainError {
  readonly code = 'COACH_NOT_IN_POOL';

  constructor(coachId: string) {
    super(`Coach is not in your selection pool: ${coachId}`);
  }
}

export class CoachAlreadySelectedError extends DomainError {
  readonly code = 'COACH_ALREADY_SELECTED';

  constructor() {
    super('Coach is already locked for this participant');
  }
}

export class CoachSelectionIncompleteError extends DomainError {
  readonly code = 'COACH_SELECTION_INCOMPLETE';

  constructor() {
    super('All players must select a coach before continuing');
  }
}
