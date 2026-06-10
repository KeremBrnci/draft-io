import { DomainError } from '../../../../common/errors/domain.error';

export class FormationNotInPoolError extends DomainError {
  readonly code = 'FORMATION_NOT_IN_POOL';

  constructor(formationId: string) {
    super(`Formation is not in your selection pool: ${formationId}`);
  }
}

export class FormationAlreadySelectedError extends DomainError {
  readonly code = 'FORMATION_ALREADY_SELECTED';

  constructor() {
    super('Formation is already locked for this participant');
  }
}

export class FormationSelectionIncompleteError extends DomainError {
  readonly code = 'FORMATION_SELECTION_INCOMPLETE';

  constructor() {
    super('All players must select a formation before starting the draft');
  }
}

export class DraftNotStartableError extends DomainError {
  readonly code = 'DRAFT_NOT_STARTABLE';

  constructor(phase: string) {
    super(`Draft cannot start while room phase is ${phase}`);
  }
}
