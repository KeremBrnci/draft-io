import { vi } from 'vitest';

import type { LeagueRepository } from '../modules/leagues/domain/repositories/league.repository';
import type { PlayerRepository } from '../modules/players/domain/repositories/player.repository';
import type { TeamRepository } from '../modules/teams/domain/repositories/team.repository';

export function createMockPlayerRepository(
  overrides: Partial<PlayerRepository> = {},
): PlayerRepository {
  return {
    findById: vi.fn(),
    findByExternalReference: vi.fn(),
    findAll: vi.fn().mockResolvedValue([]),
    findPaginated: vi.fn().mockResolvedValue({ items: [], totalItems: 0 }),
    count: vi.fn().mockResolvedValue(0),
    countCreatedSince: vi.fn().mockResolvedValue(0),
    save: vi.fn(),
    ...overrides,
  };
}

export function createMockTeamRepository(overrides: Partial<TeamRepository> = {}): TeamRepository {
  return {
    findById: vi.fn(),
    findByExternalReference: vi.fn(),
    findByLeagueId: vi.fn().mockResolvedValue([]),
    findAll: vi.fn().mockResolvedValue([]),
    count: vi.fn().mockResolvedValue(0),
    save: vi.fn(),
    ...overrides,
  };
}

export function createMockLeagueRepository(
  overrides: Partial<LeagueRepository> = {},
): LeagueRepository {
  return {
    findById: vi.fn(),
    findByExternalReference: vi.fn(),
    findAll: vi.fn().mockResolvedValue([]),
    count: vi.fn().mockResolvedValue(0),
    save: vi.fn(),
    ...overrides,
  };
}
