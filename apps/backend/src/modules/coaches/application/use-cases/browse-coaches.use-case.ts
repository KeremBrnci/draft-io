import type { PaginatedResponse, PaginationParams } from '@draft-io/shared-types';
import { createPaginationMeta } from '@draft-io/shared-types';
import {
  buildTransfermarktNationalityFlagUrl,
  resolveTransfermarktLeagueLogoUrl,
  resolveTransfermarktTeamLogoUrl,
  translateLeagueName,
  translateNationality,
  translateTeamName,
} from '@draft-io/shared-utils';

import type { LeagueRepository } from '../../../leagues/domain/repositories/league.repository';
import type { TeamRepository } from '../../../teams/domain/repositories/team.repository';
import type { CoachListFilter, CoachListSort } from '../../domain/repositories/coach.repository';
import type { CoachRepository } from '../../domain/repositories/coach.repository';
import type { CoachBrowserItem } from '../read-models/coach-browser-item';

export interface BrowseCoachesQuery extends CoachListFilter {
  readonly sortField?: CoachListSort['field'];
  readonly sortDirection?: CoachListSort['direction'];
  readonly page?: number;
  readonly pageSize?: number;
}

function formatDate(value: Date | null): string | null {
  if (value === null) {
    return null;
  }

  return value.toISOString().slice(0, 10);
}

export class BrowseCoachesUseCase {
  constructor(
    private readonly coachRepository: CoachRepository,
    private readonly teamRepository: TeamRepository,
    private readonly leagueRepository: LeagueRepository,
  ) {}

  async execute(query: BrowseCoachesQuery = {}): Promise<PaginatedResponse<CoachBrowserItem>> {
    const pagination: PaginationParams = {
      page: query.page ?? 1,
      pageSize: query.pageSize ?? 25,
    };

    const sort: CoachListSort = {
      field: query.sortField ?? 'name',
      direction: query.sortDirection ?? 'asc',
    };

    const filter: CoachListFilter = {
      ...(query.name !== undefined ? { name: query.name } : {}),
      ...(query.role !== undefined ? { role: query.role } : {}),
      ...(query.teamId !== undefined ? { teamId: query.teamId } : {}),
      ...(query.leagueId !== undefined ? { leagueId: query.leagueId } : {}),
      ...(query.nationality !== undefined ? { nationality: query.nationality } : {}),
      ...(query.hasImage !== undefined ? { hasImage: query.hasImage } : {}),
      ...(query.hasAge !== undefined ? { hasAge: query.hasAge } : {}),
    };

    const page = await this.coachRepository.findPaginated(filter, sort, pagination);
    const teams = await this.teamRepository.findAll();
    const leagues = await this.leagueRepository.findAll();
    const teamById = new Map(teams.map((team) => [team.id.value, team]));
    const leagueById = new Map(leagues.map((league) => [league.id.value, league]));

    const data: CoachBrowserItem[] = page.items.map((coach) => {
      const team = coach.teamId === null ? undefined : teamById.get(coach.teamId);
      const leagueId = coach.leagueId ?? team?.leagueId ?? null;
      const league = leagueId === null ? undefined : leagueById.get(leagueId);
      const teamExternalId = team?.externalReference?.externalId ?? null;
      const leagueExternalId = league?.externalReference?.externalId ?? null;

      return {
        id: coach.id.value,
        displayName: coach.displayName,
        imageUrl: coach.imageUrl,
        role: coach.role,
        nationality: translateNationality(coach.nationality),
        nationalityFlagUrl: buildTransfermarktNationalityFlagUrl(coach.nationality),
        age: coach.age,
        appointedDate: formatDate(coach.appointedDate),
        contractExpires: formatDate(coach.contractExpires),
        teamId: coach.teamId,
        teamName: team === undefined ? null : translateTeamName(team.name.value, teamExternalId),
        teamLogoUrl: resolveTransfermarktTeamLogoUrl(team?.logoUrl ?? null, teamExternalId),
        leagueId,
        leagueName:
          league === undefined ? null : translateLeagueName(league.name.value, leagueExternalId),
        leagueLogoUrl: resolveTransfermarktLeagueLogoUrl(league?.logoUrl ?? null, leagueExternalId),
      };
    });

    return {
      data,
      pagination: createPaginationMeta(pagination, page.totalItems),
    };
  }
}
