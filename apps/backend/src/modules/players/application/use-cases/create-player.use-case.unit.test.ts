import { describe, expect, it, vi } from 'vitest';

import { createMockPlayerRepository } from '../../../../testing/repository-mocks';

import { CreatePlayerUseCase } from './create-player.use-case';

describe('CreatePlayerUseCase', () => {
  it('creates and persists a player identity without overall', async () => {
    const repository = createMockPlayerRepository({
      save: vi.fn().mockResolvedValue(undefined),
    });

    const useCase = new CreatePlayerUseCase(repository);

    const player = await useCase.execute({
      name: 'New Player',
      position: 'CM',
    });

    expect(player.displayName.value).toBe('New Player');
    expect(player.primaryPosition.value).toBe('CM');
    expect('overall' in player).toBe(false);
    expect(repository.save).toHaveBeenCalledTimes(1);
  });
});
