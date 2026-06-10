import type { PaginatedResponse, PaginationParams } from '@draft-io/shared-types';
import { createPaginationMeta } from '@draft-io/shared-types';
import {
  buildTransfermarktNationalityFlagUrl,
  resolveTransfermarktLeagueLogoUrl,
  resolveTransfermarktPlayerImageUrl,
  resolveTransfermarktTeamLogoUrl,
  translateLeagueName,
  translateNationality,
  translateTeamName,
} from '@draft-io/shared-utils';

import type { LeagueRepository } from '../../../leagues/domain/repositories/league.repository';
import type { TeamRepository } from '../../../teams/domain/repositories/team.repository';
import type { PlayerOverallReadRepository } from '../../domain/repositories/player-overall-read.repository';
import type { PlayerListFilter, PlayerListSort } from '../../domain/repositories/player.repository';
import type { PlayerRepository } from '../../domain/repositories/player.repository';
import type { PlayerBrowserItem } from '../read-models/player-browser-item';

export interface BrowsePlayersQuery extends PlayerListFilter {
  readonly sortField?: PlayerListSort['field'];
  readonly sortDirection?: PlayerListSort['direction'];
  readonly page?: number;
  readonly pageSize?: number;
}

function computeAge(birthDate: Date | null): number | null {
  if (birthDate === null) {
    return null;
  }

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age -= 1;
  }

  return age;
}

export class BrowsePlayersUseCase {
  constructor(
    private readonly playerRepository: PlayerRepository,
    private readonly teamRepository: TeamRepository,
    private readonly leagueRepository: LeagueRepository,
    private readonly playerOverallReadRepository: PlayerOverallReadRepository,
  ) {}

  async execute(query: BrowsePlayersQuery = {}): Promise<PaginatedResponse<PlayerBrowserItem>> {
    const pagination: PaginationParams = {
      page: query.page ?? 1,
      pageSize: query.pageSize ?? 25,
    };

    const sort: PlayerListSort = {
      field: query.sortField ?? 'name',
      direction: query.sortDirection ?? 'asc',
    };

    const filter: PlayerListFilter = {
      ...(query.name !== undefined ? { name: query.name } : {}),
      ...(query.position !== undefined ? { position: query.position } : {}),
      ...(query.primaryPosition !== undefined ? { primaryPosition: query.primaryPosition } : {}),
      ...(query.secondaryPosition !== undefined
        ? { secondaryPosition: query.secondaryPosition }
        : {}),
      ...(query.hasMultiplePositions !== undefined
        ? { hasMultiplePositions: query.hasMultiplePositions }
        : {}),
      ...(query.teamId !== undefined ? { teamId: query.teamId } : {}),
      ...(query.leagueId !== undefined ? { leagueId: query.leagueId } : {}),
      ...(query.nationality !== undefined ? { nationality: query.nationality } : {}),
      ...(query.minAge !== undefined ? { minAge: query.minAge } : {}),
      ...(query.maxAge !== undefined ? { maxAge: query.maxAge } : {}),
      ...(query.minMarketValue !== undefined ? { minMarketValue: query.minMarketValue } : {}),
      ...(query.maxMarketValue !== undefined ? { maxMarketValue: query.maxMarketValue } : {}),
      ...(query.hasImage !== undefined ? { hasImage: query.hasImage } : {}),
      ...(query.hasMarketValue !== undefined ? { hasMarketValue: query.hasMarketValue } : {}),
      ...(query.hasPosition !== undefined ? { hasPosition: query.hasPosition } : {}),
      ...(query.hasAge !== undefined ? { hasAge: query.hasAge } : {}),
    };

    const page = await this.playerRepository.findPaginated(filter, sort, pagination);
    const teams = await this.teamRepository.findAll();
    const leagues = await this.leagueRepository.findAll();

    const teamById = new Map(teams.map((team) => [team.id.value, team]));
    const leagueById = new Map(leagues.map((league) => [league.id.value, league]));
    const overallByPlayerId = await this.playerOverallReadRepository.findLatestByPlayerIds(
      page.items.map((player) => player.id.value),
    );

    const data: PlayerBrowserItem[] = page.items.map((player) => {
      const team = player.teamId === null ? undefined : teamById.get(player.teamId);
      const leagueId = player.leagueId ?? team?.leagueId ?? null;
      const league = leagueId === null ? undefined : leagueById.get(leagueId);

      const teamExternalId = team?.externalReference?.externalId ?? null;
      const leagueExternalId = league?.externalReference?.externalId ?? null;

      return {
        id: player.id.value,
        displayName: player.displayName.value,
        imageUrl: resolveTransfermarktPlayerImageUrl(
          player.imageUrl?.value ?? null,
          player.externalReference?.externalId ?? null,
        ),
        positions: player.positions.assignments.map((assignment) => ({
          positionCode: assignment.positionCode,
          isPrimary: assignment.isPrimary,
        })),
        position: player.primaryPosition.value,
        secondaryPositions: player.positions.secondaryCodes,
        nationality: translateNationality(player.nationality.value),
        nationalityFlagUrl: buildTransfermarktNationalityFlagUrl(player.nationality.value),
        age: computeAge(player.birthDate?.value ?? null),
        marketValue: player.marketValue?.value ?? null,
        teamId: player.teamId,
        teamName: team === undefined ? null : translateTeamName(team.name.value, teamExternalId),
        teamLogoUrl: resolveTransfermarktTeamLogoUrl(team?.logoUrl ?? null, teamExternalId),
        leagueId,
        leagueName:
          league === undefined ? null : translateLeagueName(league.name.value, leagueExternalId),
        leagueLogoUrl: resolveTransfermarktLeagueLogoUrl(league?.logoUrl ?? null, leagueExternalId),
        overall: overallByPlayerId.get(player.id.value) ?? null,
        status: player.status,
      };
    });

    return {
      data,
      pagination: createPaginationMeta(pagination, page.totalItems),
    };
  }
}
