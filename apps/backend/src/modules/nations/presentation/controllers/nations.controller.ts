import type { ApiResponse } from '@draft-io/shared-types';
import { Controller, Get } from '@nestjs/common';

import { ListNationsUseCase } from '../../application/use-cases/list-nations.use-case';
import { toNationSummaryList, type NationSummaryResponse } from '../mappers/nation-response.mapper';

@Controller('nations')
export class NationsController {
  constructor(private readonly listNationsUseCase: ListNationsUseCase) {}

  @Get()
  async list(): Promise<ApiResponse<readonly NationSummaryResponse[]>> {
    const nations = await this.listNationsUseCase.execute();
    return { data: toNationSummaryList(nations) };
  }
}
