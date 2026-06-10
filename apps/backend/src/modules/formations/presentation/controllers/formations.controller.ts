import type { ApiResponse } from '@draft-io/shared-types';
import { Controller, Get, Param } from '@nestjs/common';

import { GetFormationUseCase } from '../../application/use-cases/get-formation.use-case';
import { ListFormationsUseCase } from '../../application/use-cases/list-formations.use-case';
import {
  toFormationSummary,
  toFormationSummaryList,
  type FormationSummaryResponse,
} from '../mappers/formation-response.mapper';

@Controller('formations')
export class FormationsController {
  constructor(
    private readonly listFormationsUseCase: ListFormationsUseCase,
    private readonly getFormationUseCase: GetFormationUseCase,
  ) {}

  @Get()
  async list(): Promise<ApiResponse<readonly FormationSummaryResponse[]>> {
    const formations = await this.listFormationsUseCase.execute();
    return { data: toFormationSummaryList(formations) };
  }

  @Get(':code')
  async findOne(@Param('code') code: string): Promise<ApiResponse<FormationSummaryResponse>> {
    const formation = await this.getFormationUseCase.execute({ code });
    return { data: toFormationSummary(formation) };
  }
}
