import { describe, expect, it, vi } from 'vitest';

import { buildTestPlayer } from '../../../players/testing/player-test.factory';

import type { ImportPlayerUseCase } from './import-player.use-case';
import { ImportPlayersBatchUseCase } from './import-players-batch.use-case';

describe('ImportPlayersBatchUseCase', () => {
  it('delegates to single import for each item', async () => {
    const player = buildTestPlayer();
    const importPlayerUseCase = {
      execute: vi.fn().mockResolvedValue(player),
    } as unknown as ImportPlayerUseCase;

    const useCase = new ImportPlayersBatchUseCase(importPlayerUseCase);
    const result = await useCase.execute({
      items: [
        { provider: 'SPORTDB', slug: 'a', externalId: 'a' },
        { provider: 'SPORTDB', slug: 'b', externalId: 'b' },
      ],
    });

    expect(result).toHaveLength(2);
    expect(importPlayerUseCase.execute).toHaveBeenCalledTimes(2);
  });
});
