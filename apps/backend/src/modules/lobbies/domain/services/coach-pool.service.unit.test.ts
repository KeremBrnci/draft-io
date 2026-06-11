import { describe, expect, it } from 'vitest';

import { COACH_POOL_SIZE, CoachPoolService } from './coach-pool.service';

describe('CoachPoolService', () => {
  const service = new CoachPoolService();
  const catalog = Array.from({ length: 24 }, (_, index) => ({ id: `coach-${index}` }));

  it('assigns different coach pools per participant', () => {
    const pools = service.assignPersonalPools('lobby-1', ['p1', 'p2', 'p3'], catalog);

    expect(pools.get('p1')).toHaveLength(COACH_POOL_SIZE);
    expect(pools.get('p2')).toHaveLength(COACH_POOL_SIZE);
    expect(new Set([...(pools.get('p1') ?? []), ...(pools.get('p2') ?? [])]).size).toBeGreaterThan(
      COACH_POOL_SIZE,
    );
  });

  it('is stable for the same lobby and participants', () => {
    const first = service.assignPersonalPools('lobby-9', ['p1'], catalog);
    const second = service.assignPersonalPools('lobby-9', ['p1'], catalog);

    expect(first.get('p1')).toEqual(second.get('p1'));
  });
});
