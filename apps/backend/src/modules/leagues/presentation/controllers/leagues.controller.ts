import type { ApiResponse } from '@draft-io/shared-types';
import { Controller, Get } from '@nestjs/common';

import { ListLeaguesUseCase } from '../../application/use-cases/list-leagues.use-case';
import { toLeagueSummaryList, type LeagueSummaryResponse } from '../mappers/league-response.mapper';

@Controller('leagues')
export class LeaguesController {
  constructor(private readonly listLeaguesUseCase: ListLeaguesUseCase) {}

  @Get()
  async list(): Promise<ApiResponse<readonly LeagueSummaryResponse[]>> {
    const leagues = await this.listLeaguesUseCase.execute();
    return { data: toLeagueSummaryList(leagues) };
  }
}
