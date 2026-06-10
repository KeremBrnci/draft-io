import type { ApiResponse, CardSummary } from '@draft-io/shared-types';
import { Controller, Get, Param, Query } from '@nestjs/common';

import { ListCardsByPlayerUseCase } from '../../application/use-cases/list-cards-by-player.use-case';
import { ListCardsQueryDto } from '../dto/list-cards-query.dto';
import { toCardSummaryList } from '../mappers/card-response.mapper';

@Controller('players/:playerId/cards')
export class PlayerCardsController {
  constructor(private readonly listCardsByPlayerUseCase: ListCardsByPlayerUseCase) {}

  @Get()
  async list(
    @Param('playerId') playerId: string,
    @Query() query: ListCardsQueryDto,
  ): Promise<ApiResponse<readonly CardSummary[]>> {
    const cards = await this.listCardsByPlayerUseCase.execute({
      playerId,
      filter: {
        ...(query.cardType !== undefined ? { cardTypeCode: query.cardType } : {}),
        ...(query.cardRarity !== undefined ? { cardRarityCode: query.cardRarity } : {}),
        ...(query.minOverall !== undefined ? { minOverall: query.minOverall } : {}),
        ...(query.maxOverall !== undefined ? { maxOverall: query.maxOverall } : {}),
        ...(query.isActive !== undefined ? { isActive: query.isActive } : {}),
      },
    });

    return { data: toCardSummaryList(cards) };
  }
}
