import type { ApiResponse, PlayerSummary } from '@draft-io/shared-types';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

import { CreatePlayerUseCase } from '../../application/use-cases/create-player.use-case';
import { GetPlayerByIdUseCase } from '../../application/use-cases/get-player-by-id.use-case';
import { ListPlayersUseCase } from '../../application/use-cases/list-players.use-case';
import { UpdatePlayerUseCase } from '../../application/use-cases/update-player.use-case';
import { CreatePlayerDto } from '../dto/create-player.dto';
import { UpdatePlayerDto } from '../dto/update-player.dto';
import {
  toPlayerSummary,
  toPlayerSummaryList,
} from '../mappers/player-response.mapper';

@Controller('players')
export class PlayersController {
  constructor(
    private readonly createPlayerUseCase: CreatePlayerUseCase,
    private readonly updatePlayerUseCase: UpdatePlayerUseCase,
    private readonly getPlayerByIdUseCase: GetPlayerByIdUseCase,
    private readonly listPlayersUseCase: ListPlayersUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreatePlayerDto): Promise<ApiResponse<PlayerSummary>> {
    const player = await this.createPlayerUseCase.execute({
      name: dto.name,
      position: dto.position,
      ...(dto.nationality !== undefined ? { nationality: dto.nationality } : {}),
    });

    return { data: toPlayerSummary(player) };
  }

  @Get()
  async list(@Query('position') position?: string): Promise<ApiResponse<readonly PlayerSummary[]>> {
    const players = await this.listPlayersUseCase.execute({ position });
    return { data: toPlayerSummaryList(players) };
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ApiResponse<PlayerSummary>> {
    const player = await this.getPlayerByIdUseCase.execute({ playerId: id });
    return { data: toPlayerSummary(player) };
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdatePlayerDto,
  ): Promise<ApiResponse<PlayerSummary>> {
    const player = await this.updatePlayerUseCase.execute({
      playerId: id,
      ...(dto.position !== undefined ? { position: dto.position } : {}),
    });

    return { data: toPlayerSummary(player) };
  }
}
