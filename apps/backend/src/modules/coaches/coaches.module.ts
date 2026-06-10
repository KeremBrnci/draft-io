import { Module } from '@nestjs/common';

import { provideUseCase } from '../../common/nest/provide-use-case';
import { LEAGUE_REPOSITORY } from '../leagues/domain/repositories/league.repository';
import { LeaguesModule } from '../leagues/leagues.module';
import { TEAM_REPOSITORY } from '../teams/domain/repositories/team.repository';
import { TeamsModule } from '../teams/teams.module';

import { BrowseCoachesUseCase } from './application/use-cases/browse-coaches.use-case';
import { COACH_REPOSITORY } from './domain/repositories/coach.repository';
import { PrismaCoachRepository } from './infrastructure/persistence/prisma-coach.repository';
import { AdminCoachesController } from './presentation/controllers/admin-coaches.controller';

@Module({
  imports: [TeamsModule, LeaguesModule],
  controllers: [AdminCoachesController],
  providers: [
    provideUseCase(BrowseCoachesUseCase, [
      COACH_REPOSITORY,
      TEAM_REPOSITORY,
      LEAGUE_REPOSITORY,
    ]),
    {
      provide: COACH_REPOSITORY,
      useClass: PrismaCoachRepository,
    },
  ],
  exports: [BrowseCoachesUseCase, COACH_REPOSITORY],
})
export class CoachesModule {}
