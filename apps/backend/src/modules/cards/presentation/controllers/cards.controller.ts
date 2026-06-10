import type { ApiResponse, CardSummary } from '@draft-io/shared-types';
import { Controller, Get, Param, Query } from '@nestjs/common';

import { GetCardByIdUseCase } from '../../application/use-cases/get-card-by-id.use-case';
import { ListCardsUseCase } from '../../application/use-cases/list-cards.use-case';
import { ListCardsQueryDto } from '../dto/list-cards-query.dto';
import { toCardSummary, toCardSummaryList } from '../mappers/card-response.mapper';

@Controller('cards')
export class CardsController {
  constructor(
    private readonly listCardsUseCase: ListCardsUseCase,
    private readonly getCardByIdUseCase: GetCardByIdUseCase,
  ) {}

  @Get()
  async list(@Query() query: ListCardsQueryDto): Promise<ApiResponse<readonly CardSummary[]>> {
    const cards = await this.listCardsUseCase.execute({
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

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ApiResponse<CardSummary>> {
    const card = await this.getCardByIdUseCase.execute({ cardId: id });
    return { data: toCardSummary(card) };
  }
}
