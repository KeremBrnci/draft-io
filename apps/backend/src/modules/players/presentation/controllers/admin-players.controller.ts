import type { PaginatedResponse, PlayerBrowserItemDto } from '@draft-io/shared-types';
import { Controller, Get, HttpCode, HttpStatus, Query } from '@nestjs/common';

import { BrowsePlayersUseCase } from '../../application/use-cases/browse-players.use-case';
import { BrowsePlayersQueryDto } from '../dto/browse-players-query.dto';
import { toPlayerBrowserItemDto } from '../mappers/player-browser-response.mapper';

@Controller('admin/players')
export class AdminPlayersController {
  constructor(private readonly browsePlayersUseCase: BrowsePlayersUseCase) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async browse(@Query() query: BrowsePlayersQueryDto): Promise<PaginatedResponse<PlayerBrowserItemDto>> {
    const result = await this.browsePlayersUseCase.execute({
      ...(query.name !== undefined ? { name: query.name } : {}),
      ...(query.position !== undefined ? { position: query.position } : {}),
      ...(query.primaryPosition !== undefined ? { primaryPosition: query.primaryPosition } : {}),
      ...(query.secondaryPosition !== undefined ? { secondaryPosition: query.secondaryPosition } : {}),
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
      ...(query.sortField !== undefined ? { sortField: query.sortField } : {}),
      ...(query.sortDirection !== undefined ? { sortDirection: query.sortDirection } : {}),
      ...(query.page !== undefined ? { page: query.page } : {}),
      ...(query.pageSize !== undefined ? { pageSize: query.pageSize } : {}),
    });

    return {
      data: result.data.map(toPlayerBrowserItemDto),
      pagination: result.pagination,
    };
  }
}
