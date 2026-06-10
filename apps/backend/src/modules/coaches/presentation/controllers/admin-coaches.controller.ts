import type { CoachBrowserItemDto, PaginatedResponse } from '@draft-io/shared-types';
import { Controller, Get, HttpCode, HttpStatus, Query } from '@nestjs/common';

import { BrowseCoachesUseCase } from '../../application/use-cases/browse-coaches.use-case';
import { BrowseCoachesQueryDto } from '../dto/browse-coaches-query.dto';
import { toCoachBrowserItemDto } from '../mappers/coach-browser-response.mapper';

@Controller('admin/coaches')
export class AdminCoachesController {
  constructor(private readonly browseCoachesUseCase: BrowseCoachesUseCase) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async browse(
    @Query() query: BrowseCoachesQueryDto,
  ): Promise<PaginatedResponse<CoachBrowserItemDto>> {
    const result = await this.browseCoachesUseCase.execute({
      ...(query.name !== undefined ? { name: query.name } : {}),
      ...(query.role !== undefined ? { role: query.role } : {}),
      ...(query.teamId !== undefined ? { teamId: query.teamId } : {}),
      ...(query.leagueId !== undefined ? { leagueId: query.leagueId } : {}),
      ...(query.nationality !== undefined ? { nationality: query.nationality } : {}),
      ...(query.hasImage !== undefined ? { hasImage: query.hasImage } : {}),
      ...(query.hasAge !== undefined ? { hasAge: query.hasAge } : {}),
      ...(query.sortField !== undefined ? { sortField: query.sortField } : {}),
      ...(query.sortDirection !== undefined ? { sortDirection: query.sortDirection } : {}),
      ...(query.page !== undefined ? { page: query.page } : {}),
      ...(query.pageSize !== undefined ? { pageSize: query.pageSize } : {}),
    });

    return {
      data: result.data.map(toCoachBrowserItemDto),
      pagination: result.pagination,
    };
  }
}
