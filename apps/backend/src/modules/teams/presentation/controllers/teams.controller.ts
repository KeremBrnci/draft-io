import type { ApiResponse } from '@draft-io/shared-types';
import { Controller, Get, Query } from '@nestjs/common';

import { ListTeamsUseCase } from '../../application/use-cases/list-teams.use-case';
import { toTeamSummaryList, type TeamSummaryResponse } from '../mappers/team-response.mapper';

@Controller('teams')
export class TeamsController {
  constructor(private readonly listTeamsUseCase: ListTeamsUseCase) {}

  @Get()
  async list(
    @Query('leagueId') leagueId?: string,
  ): Promise<ApiResponse<readonly TeamSummaryResponse[]>> {
    const teams = await this.listTeamsUseCase.execute({
      ...(leagueId !== undefined && leagueId.length > 0 ? { leagueId } : {}),
    });
    return { data: toTeamSummaryList(teams) };
  }
}
