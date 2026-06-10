import { describe, expect, it, vi } from 'vitest';

import { createMockTeamRepository } from '../../../../testing/repository-mocks';

import { ListTeamsUseCase } from './list-teams.use-case';

const LEAGUE_ID = '770e8400-e29b-41d4-a716-446655440002';

describe('ListTeamsUseCase', () => {
  it('returns all teams when league is not provided', async () => {
    const repository = createMockTeamRepository({
      findAll: vi.fn().mockResolvedValue([]),
    });

    const useCase = new ListTeamsUseCase(repository);
    const result = await useCase.execute();

    expect(result).toEqual([]);
    expect(repository.findAll).toHaveBeenCalledTimes(1);
  });

  it('returns league teams when leagueId is provided', async () => {
    const repository = createMockTeamRepository({
      findByLeagueId: vi.fn().mockResolvedValue([]),
    });

    const useCase = new ListTeamsUseCase(repository);
    const result = await useCase.execute({ leagueId: LEAGUE_ID });

    expect(result).toEqual([]);
    expect(repository.findByLeagueId).toHaveBeenCalledWith(LEAGUE_ID);
  });
});
