import { DomainError } from '../../../../common/errors/domain.error';

export class OverallCalculatorNotConfiguredError extends DomainError {
  readonly code = 'OVERALL_CALCULATOR_NOT_CONFIGURED';

  constructor() {
    super('Overall calculator has no strategy configured');
  }
}

export class OverallCalculationNotImplementedError extends DomainError {
  readonly code = 'OVERALL_CALCULATION_NOT_IMPLEMENTED';

  constructor() {
    super('Overall calculation algorithm is not implemented yet');
  }
}

export class PlayerMetricsNotFoundError extends DomainError {
  readonly code = 'PLAYER_METRICS_NOT_FOUND';

  constructor(playerId: string) {
    super(`Player metrics not found for player ${playerId}`);
  }
}

export class OverallAlgorithmVersionNotFoundError extends DomainError {
  readonly code = 'OVERALL_ALGORITHM_VERSION_NOT_FOUND';

  constructor(code: string) {
    super(`Overall algorithm version not found: ${code}`);
  }
}
