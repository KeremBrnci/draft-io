import { Module } from '@nestjs/common';

import { provideUseCase } from '../../common/nest/provide-use-case';

import { ListLeaguesUseCase } from './application/use-cases/list-leagues.use-case';
import { LEAGUE_REPOSITORY } from './domain/repositories/league.repository';
import { PrismaLeagueRepository } from './infrastructure/persistence/prisma-league.repository';
import { LeaguesController } from './presentation/controllers/leagues.controller';

@Module({
  controllers: [LeaguesController],
  providers: [
    provideUseCase(ListLeaguesUseCase, [LEAGUE_REPOSITORY]),
    {
      provide: LEAGUE_REPOSITORY,
      useClass: PrismaLeagueRepository,
    },
  ],
  exports: [ListLeaguesUseCase, LEAGUE_REPOSITORY],
})
export class LeaguesModule {}
