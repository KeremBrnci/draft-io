import { describe, expect, it, vi } from 'vitest';

import { createMockPlayerRepository } from '../../../../testing/repository-mocks';
import { DisplayName } from '../../domain/value-objects/display-name.vo';
import { PlayerId } from '../../domain/value-objects/player-id.vo';
import { buildTestPlayer, buildTestPlayerPositions } from '../../testing/player-test.factory';

import { ListPlayersUseCase } from './list-players.use-case';

describe('ListPlayersUseCase', () => {
  it('filters players by position', async () => {
    const strikerId = PlayerId.create('550e8400-e29b-41d4-a716-446655440001');
    const keeperId = PlayerId.create('550e8400-e29b-41d4-a716-446655440002');
    const striker = buildTestPlayer({
      id: strikerId,
      displayName: DisplayName.create('Striker'),
      positions: buildTestPlayerPositions(strikerId, 'ST'),
    });
    const keeper = buildTestPlayer({
      id: keeperId,
      displayName: DisplayName.create('Keeper'),
      positions: buildTestPlayerPositions(keeperId, 'GK'),
    });

    const repository = createMockPlayerRepository({
      findAll: vi.fn().mockResolvedValue([striker, keeper]),
    });

    const useCase = new ListPlayersUseCase(repository);
    const result = await useCase.execute({ position: 'ST' });

    expect(result).toHaveLength(1);
    expect(result[0]?.primaryPosition.value).toBe('ST');
  });
});
