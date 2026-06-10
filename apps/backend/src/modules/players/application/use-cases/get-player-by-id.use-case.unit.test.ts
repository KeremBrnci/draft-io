import { describe, expect, it, vi } from 'vitest';

import { PlayerNotFoundError } from '../../domain/errors/player.errors';
import { PlayerId } from '../../domain/value-objects/player-id.vo';
import { buildTestPlayer } from '../../testing/player-test.factory';
import { createMockPlayerRepository } from '../../../../testing/repository-mocks';

import { GetPlayerByIdUseCase } from './get-player-by-id.use-case';

const VALID_PLAYER_ID = '550e8400-e29b-41d4-a716-446655440000';

describe('GetPlayerByIdUseCase', () => {
  const player = buildTestPlayer({ id: PlayerId.create(VALID_PLAYER_ID) });

  it('returns player when found', async () => {
    const repository = createMockPlayerRepository({
      findById: vi.fn().mockResolvedValue(player),
    });

    const useCase = new GetPlayerByIdUseCase(repository);
    const result = await useCase.execute({ playerId: VALID_PLAYER_ID });

    expect(result.id.value).toBe(VALID_PLAYER_ID);
  });

  it('throws when player is not found', async () => {
    const repository = createMockPlayerRepository({
      findById: vi.fn().mockResolvedValue(null),
    });

    const useCase = new GetPlayerByIdUseCase(repository);

    await expect(useCase.execute({ playerId: VALID_PLAYER_ID })).rejects.toThrow(
      PlayerNotFoundError,
    );
  });
});
