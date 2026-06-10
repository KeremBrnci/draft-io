import type { ApiResponse } from '@draft-io/shared-types';
import { Controller, Get } from '@nestjs/common';

import { ListPositionsUseCase } from '../../application/use-cases/list-positions.use-case';
import {
  toPositionResponseList,
  type PositionResponse,
} from '../mappers/position-response.mapper';

@Controller('positions')
export class PositionsController {
  constructor(private readonly listPositionsUseCase: ListPositionsUseCase) {}

  @Get()
  list(): ApiResponse<readonly PositionResponse[]> {
    const positions = this.listPositionsUseCase.execute();
    return { data: toPositionResponseList(positions) };
  }
}
