import { describe, expect, it } from 'vitest';

import { DEFAULT_DRAFT_BALANCE_CONFIG } from '../../domain/config/default-draft-balance.config';
import { BudgetAllocator } from '../../domain/services/budget-allocator.service';
import { SeededRandomSource } from '../../infrastructure/random/seeded-random-source';

describe('BudgetAllocator', () => {
  it('allocates budgets within 3% deviation', () => {
    const random = new SeededRandomSource(123);
    const allocator = new BudgetAllocator(DEFAULT_DRAFT_BALANCE_CONFIG, random);
    const budgets = allocator.allocateForParticipants(['p1', 'p2', 'p3', 'p4']);
    const values = [...budgets.values()];
    const base =
      DEFAULT_DRAFT_BALANCE_CONFIG.targetTeamAverageOverall *
      DEFAULT_DRAFT_BALANCE_CONFIG.rosterSize;

    for (const budget of values) {
      const deviation = Math.abs(budget - base) / base;
      expect(deviation).toBeLessThanOrEqual(0.03);
    }

    const spread = Math.max(...values) - Math.min(...values);
    expect(spread / base).toBeLessThanOrEqual(0.06);
  });
});
