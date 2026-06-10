import { describe, expect, it, vi } from 'vitest';

import { ExternalProvider } from '../../../../core/external-reference/external-provider';
import {
  createMockLeagueRepository,
  createMockPlayerRepository,
  createMockTeamRepository,
} from '../../../../testing/repository-mocks';
import { League } from '../../../leagues/domain/entities/league.entity';
import { LeagueId } from '../../../leagues/domain/value-objects/league-id.vo';
import { LeagueName } from '../../../leagues/domain/value-objects/league-name.vo';
import { Team } from '../../../teams/domain/entities/team.entity';
import { TeamExternalReference } from '../../../teams/domain/value-objects/external-reference.vo';
import { TeamId } from '../../../teams/domain/value-objects/team-id.vo';
import { TeamName } from '../../../teams/domain/value-objects/team-name.vo';
import { ExternalPlayerNotFoundError } from '../../domain/errors/data-provider.errors';
import type { ExternalPlayerRecord } from '../../domain/models/external-player-record';
import type { PlayerProvider } from '../../domain/ports/player-provider.port';
import type { ProviderRegistryPort } from '../../domain/ports/provider-registry.port';
import { mapExternalPlayerToDomain } from '../mappers/external-player-to-player.mapper';

import { ImportPlayerUseCase } from './import-player.use-case';

const externalRecord: ExternalPlayerRecord = {
  provider: ExternalProvider.SPORTDB,
  slug: 'messi-lionel',
  externalId: 'vgOOdZbd',
  firstName: 'Lionel',
  lastName: 'Messi',
  displayName: 'Lionel Messi',
  nationality: 'AR',
  teamExternalId: null,
  leagueExternalId: null,
  primaryPosition: 'RW',
  secondaryPositions: [],
  age: 36,
  apiOverallHint: 94,
  marketValue: null,
  marketValueCurrency: null,
  imageUrl: null,
  status: 'ACTIVE',
};

const importCommand = {
  provider: 'SPORTDB',
  slug: 'messi-lionel',
  externalId: 'vgOOdZbd',
};

function buildUseCase(playerProvider: PlayerProvider) {
  const providerRegistry = {
    getPlayerProvider: vi.fn().mockReturnValue(playerProvider),
  } as unknown as ProviderRegistryPort;

  const playerRepository = createMockPlayerRepository({
    findByExternalReference: vi.fn().mockResolvedValue(null),
    save: vi.fn().mockResolvedValue(undefined),
  });
  const teamRepository = createMockTeamRepository();
  const leagueRepository = createMockLeagueRepository();

  const useCase = new ImportPlayerUseCase(
    providerRegistry,
    playerRepository,
    teamRepository,
    leagueRepository,
  );

  return { useCase, playerRepository, teamRepository, leagueRepository };
}

describe('ImportPlayerUseCase', () => {
  it('imports player identity without assigning overall or creating cards', async () => {
    const playerProvider: PlayerProvider = {
      searchPlayers: vi.fn(),
      fetchBySlugAndId: vi.fn().mockResolvedValue(externalRecord),
    };
    const { useCase, playerRepository } = buildUseCase(playerProvider);

    const player = await useCase.execute(importCommand);

    expect(player.externalReference?.externalId).toBe('vgOOdZbd');
    expect('overall' in player).toBe(false);
    expect(playerRepository.save).toHaveBeenCalledTimes(1);
  });

  it('updates existing player on re-import without creating duplicate', async () => {
    const existing = mapExternalPlayerToDomain(externalRecord, {
      countryId: null,
      teamId: null,
      leagueId: null,
    });

    const updatedRecord: ExternalPlayerRecord = {
      ...externalRecord,
      displayName: 'Leo Messi',
      age: 37,
    };

    const playerProvider: PlayerProvider = {
      searchPlayers: vi.fn(),
      fetchBySlugAndId: vi.fn().mockResolvedValue(updatedRecord),
    };
    const { useCase, playerRepository } = buildUseCase(playerProvider);
    vi.mocked(playerRepository.findByExternalReference).mockResolvedValue(existing);

    const player = await useCase.execute(importCommand);

    expect(player.id.value).toBe(existing.id.value);
    expect(player.displayName.value).toBe('Leo Messi');
    expect(playerRepository.save).toHaveBeenCalledTimes(1);
  });

  it('resolves team id when team already imported', async () => {
    const recordWithTeam: ExternalPlayerRecord = {
      ...externalRecord,
      teamExternalId: 'team-1',
    };
    const importedTeam = Team.create({
      id: TeamId.create('660e8400-e29b-41d4-a716-446655440011'),
      externalReference: TeamExternalReference.create(ExternalProvider.SPORTDB, 'team-1'),
      name: TeamName.create('Team'),
      shortName: null,
      countryId: null,
      leagueId: null,
      country: null,
      logoUrl: null,
    });

    const playerProvider: PlayerProvider = {
      searchPlayers: vi.fn(),
      fetchBySlugAndId: vi.fn().mockResolvedValue(recordWithTeam),
    };
    const { useCase, teamRepository } = buildUseCase(playerProvider);
    vi.mocked(teamRepository.findByExternalReference).mockResolvedValue(importedTeam);

    const player = await useCase.execute(importCommand);
    expect(player.teamId).toBe(importedTeam.id.value);
  });

  it('resolves league id from record when team league is not set yet', async () => {
    const recordWithLeague: ExternalPlayerRecord = {
      ...externalRecord,
      teamExternalId: 'team-1',
      leagueExternalId: 'GB1',
    };
    const importedTeam = Team.create({
      id: TeamId.create('660e8400-e29b-41d4-a716-446655440011'),
      externalReference: TeamExternalReference.create(ExternalProvider.SPORTDB, 'team-1'),
      name: TeamName.create('Team'),
      shortName: null,
      countryId: null,
      leagueId: null,
      country: null,
      logoUrl: null,
    });
    const importedLeague = League.create({
      id: LeagueId.create('770e8400-e29b-41d4-a716-446655440002'),
      externalReference: null,
      name: LeagueName.create('Premier League'),
      country: 'England',
      logoUrl: null,
    });

    const playerProvider: PlayerProvider = {
      searchPlayers: vi.fn(),
      fetchBySlugAndId: vi.fn().mockResolvedValue(recordWithLeague),
    };
    const { useCase, teamRepository, leagueRepository } = buildUseCase(playerProvider);
    vi.mocked(teamRepository.findByExternalReference).mockResolvedValue(importedTeam);
    vi.mocked(leagueRepository.findByExternalReference).mockResolvedValue(importedLeague);

    const player = await useCase.execute(importCommand);

    expect(player.leagueId).toBe(importedLeague.id.value);
  });

  it('falls back to team league when profile record has no league', async () => {
    const recordWithTeam: ExternalPlayerRecord = {
      ...externalRecord,
      teamExternalId: 'team-1',
      leagueExternalId: null,
    };
    const importedTeam = Team.create({
      id: TeamId.create('660e8400-e29b-41d4-a716-446655440011'),
      externalReference: TeamExternalReference.create(ExternalProvider.SPORTDB, 'team-1'),
      name: TeamName.create('Team'),
      shortName: null,
      countryId: null,
      leagueId: '770e8400-e29b-41d4-a716-446655440002',
      country: null,
      logoUrl: null,
    });

    const playerProvider: PlayerProvider = {
      searchPlayers: vi.fn(),
      fetchBySlugAndId: vi.fn().mockResolvedValue(recordWithTeam),
    };
    const { useCase, teamRepository } = buildUseCase(playerProvider);
    vi.mocked(teamRepository.findByExternalReference).mockResolvedValue(importedTeam);
    vi.mocked(teamRepository.findById).mockResolvedValue(importedTeam);

    const player = await useCase.execute(importCommand);

    expect(player.leagueId).toBe(importedTeam.leagueId);
  });

  it('throws when external player is not found', async () => {
    const playerProvider: PlayerProvider = {
      searchPlayers: vi.fn(),
      fetchBySlugAndId: vi.fn().mockResolvedValue(null),
    };
    const { useCase } = buildUseCase(playerProvider);

    await expect(
      useCase.execute({ provider: 'SPORTDB', slug: 'missing', externalId: 'missing' }),
    ).rejects.toThrow(ExternalPlayerNotFoundError);
  });
});
