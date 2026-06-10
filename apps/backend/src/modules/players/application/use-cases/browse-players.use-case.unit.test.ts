import { describe, expect, it, vi } from 'vitest';

import { ExternalProvider } from '../../../../core/external-reference/external-provider';
import {
  createMockLeagueRepository,
  createMockPlayerRepository,
  createMockTeamRepository,
} from '../../../../testing/repository-mocks';
import { League } from '../../../leagues/domain/entities/league.entity';
import { LeagueExternalReference } from '../../../leagues/domain/value-objects/external-reference.vo';
import { LeagueId } from '../../../leagues/domain/value-objects/league-id.vo';
import { LeagueName } from '../../../leagues/domain/value-objects/league-name.vo';
import { Team } from '../../../teams/domain/entities/team.entity';
import { TeamExternalReference } from '../../../teams/domain/value-objects/external-reference.vo';
import { TeamId } from '../../../teams/domain/value-objects/team-id.vo';
import { TeamName } from '../../../teams/domain/value-objects/team-name.vo';
import { Player } from '../../domain/entities/player.entity';
import { PlayerStatus } from '../../domain/enums/player-status.enum';
import { BirthDate } from '../../domain/value-objects/birth-date.vo';
import { DisplayName } from '../../domain/value-objects/display-name.vo';
import { ExternalReference } from '../../domain/value-objects/external-reference.vo';
import { Nationality } from '../../domain/value-objects/nationality.vo';
import { PersonName } from '../../domain/value-objects/person-name.vo';
import { PlayerId } from '../../domain/value-objects/player-id.vo';
import { buildTestPlayerPositions } from '../../testing/player-test.factory';

import { BrowsePlayersUseCase } from './browse-players.use-case';

const TEAM_ID = '660e8400-e29b-41d4-a716-446655440001';
const LEAGUE_ID = '770e8400-e29b-41d4-a716-446655440002';

function buildPlayer(): Player {
  const playerId = PlayerId.create('550e8400-e29b-41d4-a716-446655440000');

  return Player.create({
    id: playerId,
    externalReference: ExternalReference.create(ExternalProvider.TRANSFERMARKT, '123'),
    firstName: PersonName.create('Erling'),
    lastName: PersonName.create('Haaland'),
    displayName: DisplayName.create('Erling Haaland'),
    birthDate: BirthDate.create(new Date('2000-07-21')),
    nationality: Nationality.create('NORWAY'),
    countryId: null,
    teamId: TEAM_ID,
    leagueId: LEAGUE_ID,
    positions: buildTestPlayerPositions(playerId, 'ST'),
    marketValue: null,
    marketValueCurrency: null,
    imageUrl: null,
    status: PlayerStatus.ACTIVE,
  });
}

describe('BrowsePlayersUseCase', () => {
  it('passes filters to repository and resolves club and competition names', async () => {
    const player = buildPlayer();
    const playerRepository = createMockPlayerRepository({
      findPaginated: vi.fn().mockResolvedValue({ items: [player], totalItems: 1 }),
    });
    const teamRepository = createMockTeamRepository({
      findAll: vi.fn().mockResolvedValue([
        Team.create({
          id: TeamId.create(TEAM_ID),
          externalReference: TeamExternalReference.create(ExternalProvider.TRANSFERMARKT, '281'),
          name: TeamName.create('Manchester City'),
          shortName: null,
          country: 'England',
          logoUrl: 'https://tmssl.akamaized.net//images/wappen/big/281.png',
          leagueId: LEAGUE_ID,
          formationCode: null,
          manager: null,
          chemistryScore: null,
          teamOverall: null,
        }),
      ]),
    });
    const leagueRepository = createMockLeagueRepository({
      findAll: vi.fn().mockResolvedValue([
        League.create({
          id: LeagueId.create(LEAGUE_ID),
          externalReference: LeagueExternalReference.create(ExternalProvider.TRANSFERMARKT, 'GB1'),
          name: LeagueName.create('Premier League'),
          country: 'England',
          logoUrl: null,
        }),
      ]),
    });

    const playerOverallReadRepository = {
      findLatestByPlayerIds: vi
        .fn()
        .mockResolvedValue(new Map([['550e8400-e29b-41d4-a716-446655440000', 91]])),
    };

    const useCase = new BrowsePlayersUseCase(
      playerRepository,
      teamRepository,
      leagueRepository,
      playerOverallReadRepository,
    );
    const result = await useCase.execute({
      name: 'Haaland',
      hasImage: false,
      hasMarketValue: false,
      sortField: 'age',
      sortDirection: 'desc',
      page: 1,
      pageSize: 25,
    });

    expect(playerRepository.findPaginated).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Haaland',
        hasImage: false,
        hasMarketValue: false,
      }),
      { field: 'age', direction: 'desc' },
      { page: 1, pageSize: 25 },
    );
    expect(result.data[0]?.teamName).toBe('Manchester City');
    expect(result.data[0]?.leagueName).toBe('Premier Lig');
    expect(result.data[0]?.imageUrl).toBeNull();
    expect(result.data[0]?.teamLogoUrl).toBe(
      'https://tmssl.akamaized.net//images/wappen/big/281.png',
    );
    expect(result.data[0]?.leagueLogoUrl).toBe(
      'https://tmssl.akamaized.net//images/logo/normal/gb1.png',
    );
    expect(result.data[0]?.nationalityFlagUrl).toBe(
      'https://tmssl.akamaized.net//images/flagge/verysmall/125.png',
    );
    expect(result.data[0]?.overall).toBe(91);
    expect(result.data[0]?.position).toBe('ST');
    expect(result.data[0]?.age).toBeGreaterThan(20);
    expect(result.pagination.totalItems).toBe(1);
  });

  it('falls back to team competition when player league is missing', async () => {
    const playerId = PlayerId.create('550e8400-e29b-41d4-a716-446655440000');
    const player = Player.create({
      id: playerId,
      externalReference: ExternalReference.create(ExternalProvider.TRANSFERMARKT, '123'),
      firstName: PersonName.create('Aaron'),
      lastName: PersonName.create('Ramsdale'),
      displayName: DisplayName.create('Aaron Ramsdale'),
      birthDate: BirthDate.create(new Date('1998-05-14')),
      nationality: Nationality.create('england'),
      countryId: null,
      teamId: TEAM_ID,
      leagueId: null,
      positions: buildTestPlayerPositions(playerId, 'GK'),
      marketValue: null,
      marketValueCurrency: null,
      imageUrl: null,
      status: PlayerStatus.ACTIVE,
    });
    const playerRepository = createMockPlayerRepository({
      findPaginated: vi.fn().mockResolvedValue({ items: [player], totalItems: 1 }),
    });
    const teamRepository = createMockTeamRepository({
      findAll: vi.fn().mockResolvedValue([
        Team.create({
          id: TeamId.create(TEAM_ID),
          externalReference: null,
          name: TeamName.create('Newcastle United'),
          shortName: null,
          country: 'England',
          logoUrl: null,
          leagueId: LEAGUE_ID,
          formationCode: null,
          manager: null,
          chemistryScore: null,
          teamOverall: null,
        }),
      ]),
    });
    const leagueRepository = createMockLeagueRepository({
      findAll: vi.fn().mockResolvedValue([
        League.create({
          id: LeagueId.create(LEAGUE_ID),
          externalReference: null,
          name: LeagueName.create('Premier League'),
          country: 'England',
          logoUrl: null,
        }),
      ]),
    });

    const playerOverallReadRepository = {
      findLatestByPlayerIds: vi
        .fn()
        .mockResolvedValue(new Map([['550e8400-e29b-41d4-a716-446655440000', 91]])),
    };

    const useCase = new BrowsePlayersUseCase(
      playerRepository,
      teamRepository,
      leagueRepository,
      playerOverallReadRepository,
    );
    const result = await useCase.execute();

    expect(result.data[0]?.leagueName).toBe('Premier Lig');
    expect(result.data[0]?.nationality).toBe('İngiltere');
    expect(result.data[0]?.leagueId).toBe(LEAGUE_ID);
  });
});
