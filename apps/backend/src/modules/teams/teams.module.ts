import { Module } from '@nestjs/common';

import { provideUseCase } from '../../common/nest/provide-use-case';

import { ListTeamsUseCase } from './application/use-cases/list-teams.use-case';
import { TEAM_REPOSITORY } from './domain/repositories/team.repository';
import { PrismaTeamRepository } from './infrastructure/persistence/prisma-team.repository';
import { TeamsController } from './presentation/controllers/teams.controller';

@Module({
  controllers: [TeamsController],
  providers: [
    provideUseCase(ListTeamsUseCase, [TEAM_REPOSITORY]),
    {
      provide: TEAM_REPOSITORY,
      useClass: PrismaTeamRepository,
    },
  ],
  exports: [ListTeamsUseCase, TEAM_REPOSITORY],
})
export class TeamsModule {}
