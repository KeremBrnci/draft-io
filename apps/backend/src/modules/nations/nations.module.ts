import { Module } from '@nestjs/common';

import { provideUseCase } from '../../common/nest/provide-use-case';

import { ListNationsUseCase } from './application/use-cases/list-nations.use-case';
import { NATION_REPOSITORY } from './domain/repositories/nation.repository';
import { PrismaNationRepository } from './infrastructure/persistence/prisma-nation.repository';
import { NationsController } from './presentation/controllers/nations.controller';

@Module({
  controllers: [NationsController],
  providers: [
    provideUseCase(ListNationsUseCase, [NATION_REPOSITORY]),
    {
      provide: NATION_REPOSITORY,
      useClass: PrismaNationRepository,
    },
  ],
  exports: [ListNationsUseCase, NATION_REPOSITORY],
})
export class NationsModule {}
