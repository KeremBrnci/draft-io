import { Module } from '@nestjs/common';

import { provideUseCase } from '../../common/nest/provide-use-case';

import { ListPositionsUseCase } from './application/use-cases/list-positions.use-case';
import { PositionsController } from './presentation/controllers/positions.controller';

@Module({
  controllers: [PositionsController],
  providers: [provideUseCase(ListPositionsUseCase)],
  exports: [ListPositionsUseCase],
})
export class PositionsModule {}
