import { describe, expect, it } from 'vitest';

import { FormationPoolService } from '../../../lobbies/domain/services/formation-pool.service';
import { getAllFormations } from '../../domain/constants/formation-templates';

describe('FormationPoolService', () => {
  const service = new FormationPoolService();

  it('assigns five unique personal formations per participant', () => {
    const formations = getAllFormations();
    const pools = service.assignPersonalPools('lobby-1', ['player-a', 'player-b'], formations);

    expect(pools.get('player-a')).toHaveLength(5);
    expect(pools.get('player-b')).toHaveLength(5);
    expect(pools.get('player-a')).not.toEqual(pools.get('player-b'));
  });

  it('is deterministic for the same lobby and participant', () => {
    const formations = getAllFormations();
    const first = service.assignPersonalPools('lobby-1', ['player-a'], formations);
    const second = service.assignPersonalPools('lobby-1', ['player-a'], formations);
    expect(first.get('player-a')).toEqual(second.get('player-a'));
  });
});
