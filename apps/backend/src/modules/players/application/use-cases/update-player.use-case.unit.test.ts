import { describe, expect, it, vi } from 'vitest';

import { createMockPlayerRepository } from '../../../../testing/repository-mocks';
import { PlayerNotFoundError } from '../../domain/errors/player.errors';
import { PlayerId } from '../../domain/value-objects/player-id.vo';
import { buildTestPlayer } from '../../testing/player-test.factory';

import { UpdatePlayerUseCase } from './update-player.use-case';

const VALID_PLAYER_ID = '550e8400-e29b-41d4-a716-446655440000';

describe('UpdatePlayerUseCase', () => {
  it('updates position when player exists', async () => {
    const player = buildTestPlayer({ id: PlayerId.create(VALID_PLAYER_ID) });

    const repository = createMockPlayerRepository({
      findById: vi.fn().mockResolvedValue(player),
      save: vi.fn().mockResolvedValue(undefined),
    });

    const useCase = new UpdatePlayerUseCase(repository);
    const updated = await useCase.execute({
      playerId: VALID_PLAYER_ID,
      position: 'ST',
    });

    expect(updated.primaryPosition.value).toBe('ST');
    expect(repository.save).toHaveBeenCalledWith(player);
  });

  it('throws when player is not found', async () => {
    const repository = createMockPlayerRepository({
      findById: vi.fn().mockResolvedValue(null),
    });

    const useCase = new UpdatePlayerUseCase(repository);

    await expect(useCase.execute({ playerId: VALID_PLAYER_ID, position: 'ST' })).rejects.toThrow(
      PlayerNotFoundError,
    );
  });
});
