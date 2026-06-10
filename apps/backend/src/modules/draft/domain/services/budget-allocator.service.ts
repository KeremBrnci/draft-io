import type { DraftBalanceConfigDto } from '@draft-io/shared-types';

import { computeBasePowerBudget } from '../config/default-draft-balance.config';
import type { RandomSource } from '../ports/random-source.port';

export class BudgetAllocator {
  constructor(
    private readonly config: DraftBalanceConfigDto,
    private readonly random: RandomSource,
  ) {}

  allocateForParticipants(participantIds: readonly string[]): ReadonlyMap<string, number> {
    const baseBudget = computeBasePowerBudget(this.config);
    const maxDeviation = this.config.budgetDeviationMaxPercent / 100;
    const budgets = new Map<string, number>();

    for (const participantId of participantIds) {
      const jitter = (this.random.next() * 2 - 1) * maxDeviation * 0.99;
      const budget = Math.round(baseBudget * (1 + jitter));
      budgets.set(participantId, budget);
    }

    return budgets;
  }
}
