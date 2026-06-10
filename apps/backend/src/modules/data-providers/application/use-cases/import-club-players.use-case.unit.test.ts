import { describe, expect, it, vi } from 'vitest';

import { ExternalProvider } from '../../../../core/external-reference/external-provider';
import { Player } from '../../../players/domain/entities/player.entity';
import { PlayerStatus } from '../../../players/domain/enums/player-status.enum';
import { DisplayName } from '../../../players/domain/value-objects/display-name.vo';
import { ExternalReference } from '../../../players/domain/value-objects/external-reference.vo';
import { Nationality } from '../../../players/domain/value-objects/nationality.vo';
import { PersonName } from '../../../players/domain/value-objects/person-name.vo';
import { PlayerId } from '../../../players/domain/value-objects/player-id.vo';
import { buildTestPlayerPositions } from '../../../players/testing/player-test.factory';
import { Team } from '../../../teams/domain/entities/team.entity';
import { createMockTeamRepository } from '../../../../testing/repository-mocks';
import { TeamExternalReference } from '../../../teams/domain/value-objects/external-reference.vo';
import { TeamId } from '../../../teams/domain/value-objects/team-id.vo';
import { TeamName } from '../../../teams/domain/value-objects/team-name.vo';
import type { ExternalPlayerRecord } from '../../domain/models/external-player-record';
import type { PlayerProvider } from '../../domain/ports/player-provider.port';
import type { ProviderRegistryPort } from '../../domain/ports/provider-registry.port';
import type { ImportPlayerUseCase } from './import-player.use-case';

import { ImportClubPlayersUseCase } from './import-club-players.use-case';

const CLUB_ID = '11';
const LEAGUE_ID = 'GB1';
const TEAM_UUID = '660e8400-e29b-41d4-a716-446655440099';

function rosterRecord(id: string, name: string): ExternalPlayerRecord {
  return {
    provider: ExternalProvider.TRANSFERMARKT,
    slug: name.toLowerCase(),
    externalId: id,
    firstName: name,
    lastName: 'Test',
    displayName: name,
    nationality: 'England',
    teamExternalId: CLUB_ID,
    leagueExternalId: LEAGUE_ID,
    primaryPosition: 'ST',
    secondaryPositions: [],
    age: 24,
    apiOverallHint: null,
    marketValue: 1_000_000,
    marketValueCurrency: 'EUR',
    imageUrl: null,
    status: 'ACTIVE',
  };
}

function buildPlayer(id: string, name: string): Player {
  const playerId = PlayerId.create(`550e8400-e29b-41d4-a716-4466554400${id.padStart(2, '0')}`);

  return Player.create({
    id: playerId,
    externalReference: ExternalReference.create(ExternalProvider.TRANSFERMARKT, id),
    firstName: PersonName.create(name),
    lastName: PersonName.create('Test'),
    displayName: DisplayName.create(name),
    birthDate: null,
    nationality: Nationality.create('england'),
    countryId: null,
    teamId: TEAM_UUID,
    leagueId: null,
    positions: buildTestPlayerPositions(playerId, 'ST'),
    marketValue: null,
    marketValueCurrency: null,
    imageUrl: null,
    status: PlayerStatus.ACTIVE,
  });
}

describe('ImportClubPlayersUseCase', () => {
  it('imports full roster from list endpoint without per-player profile calls', async () => {
    const roster = [rosterRecord('1', 'Player A'), rosterRecord('2', 'Player B')];

    const playerProvider: PlayerProvider = {
      searchPlayers: vi.fn(),
      fetchBySlugAndId: vi.fn(),
      fetchClubPlayers: vi.fn().mockResolvedValue(roster),
    };

    const providerRegistry = {
      getPlayerProvider: vi.fn().mockReturnValue(playerProvider),
    } as unknown as ProviderRegistryPort;

    const importPlayerUseCase = {
      execute: vi.fn(),
      upsertFromRecord: vi
        .fn()
        .mockImplementation(async (record: ExternalPlayerRecord) =>
          buildPlayer(record.externalId, record.displayName),
        ),
    } as unknown as ImportPlayerUseCase;

    const team = Team.create({
      id: TeamId.create(TEAM_UUID),
      externalReference: TeamExternalReference.create(ExternalProvider.TRANSFERMARKT, CLUB_ID),
      name: TeamName.create('Arsenal'),
      shortName: null,
      country: 'England',
      logoUrl: null,
      leagueId: 'league-uuid',
    });

    const teamRepository = createMockTeamRepository({
      findByExternalReference: vi.fn().mockResolvedValue(team),
    });

    const useCase = new ImportClubPlayersUseCase(providerRegistry, teamRepository, importPlayerUseCase);
    const result = await useCase.execute({
      provider: 'TRANSFERMARKT',
      clubExternalId: CLUB_ID,
      leagueExternalId: LEAGUE_ID,
    });

    expect(playerProvider.fetchClubPlayers).toHaveBeenCalledWith(CLUB_ID, LEAGUE_ID);
    expect(importPlayerUseCase.upsertFromRecord).toHaveBeenCalledTimes(2);
    expect(importPlayerUseCase.execute).not.toHaveBeenCalled();
    expect(result.imported).toBe(2);
    expect(result.failed).toBe(0);
    expect(result.failedPlayers).toEqual([]);
  });

  it('continues importing when individual players fail', async () => {
    const roster = [rosterRecord('1', 'Player A'), rosterRecord('2', 'Player B')];

    const playerProvider: PlayerProvider = {
      searchPlayers: vi.fn(),
      fetchBySlugAndId: vi.fn(),
      fetchClubPlayers: vi.fn().mockResolvedValue(roster),
    };

    const providerRegistry = {
      getPlayerProvider: vi.fn().mockReturnValue(playerProvider),
    } as unknown as ProviderRegistryPort;

    const importPlayerUseCase = {
      upsertFromRecord: vi
        .fn()
        .mockResolvedValueOnce(buildPlayer('1', 'Player A'))
        .mockRejectedValueOnce(new Error('invalid name')),
    } as unknown as ImportPlayerUseCase;

    (playerProvider as PlayerProvider & { fetchProfile?: () => Promise<null> }).fetchProfile = vi
      .fn()
      .mockResolvedValue(null);

    const useCase = new ImportClubPlayersUseCase(
      providerRegistry,
      createMockTeamRepository(),
      importPlayerUseCase,
    );

    const result = await useCase.execute({
      provider: 'TRANSFERMARKT',
      clubExternalId: CLUB_ID,
    });

    expect(result.imported).toBe(1);
    expect(result.failed).toBe(1);
    expect(result.failedPlayers).toEqual([{ externalId: '2', displayName: 'Player B' }]);
  });

  it('recovers roster failures via profile fetch', async () => {
    const roster = [rosterRecord('1', 'Player A'), rosterRecord('2', 'Player B')];
    const profileRecord = rosterRecord('2', 'Player B Profile');

    const playerProvider: PlayerProvider = {
      searchPlayers: vi.fn(),
      fetchBySlugAndId: vi.fn(),
      fetchClubPlayers: vi.fn().mockResolvedValue(roster),
      fetchProfile: vi.fn().mockResolvedValue(profileRecord),
    };

    const providerRegistry = {
      getPlayerProvider: vi.fn().mockReturnValue(playerProvider),
    } as unknown as ProviderRegistryPort;

    const importPlayerUseCase = {
      upsertFromRecord: vi
        .fn()
        .mockResolvedValueOnce(buildPlayer('1', 'Player A'))
        .mockRejectedValueOnce(new Error('invalid roster row'))
        .mockResolvedValueOnce(buildPlayer('2', 'Player B Profile')),
    } as unknown as ImportPlayerUseCase;

    const useCase = new ImportClubPlayersUseCase(
      providerRegistry,
      createMockTeamRepository(),
      importPlayerUseCase,
    );

    const result = await useCase.execute({
      provider: 'TRANSFERMARKT',
      clubExternalId: CLUB_ID,
    });

    expect(playerProvider.fetchProfile).toHaveBeenCalledWith('2');
    expect(result.imported).toBe(2);
    expect(result.failed).toBe(0);
    expect(result.failedPlayers).toEqual([]);
  });
});
