import { Module } from '@nestjs/common';

import { provideUseCase } from '../../common/nest/provide-use-case';
import { LEAGUE_REPOSITORY } from '../leagues/domain/repositories/league.repository';
import { LeaguesModule } from '../leagues/leagues.module';
import { TEAM_REPOSITORY } from '../teams/domain/repositories/team.repository';
import { TeamsModule } from '../teams/teams.module';

import { BrowsePlayersUseCase } from './application/use-cases/browse-players.use-case';
import { CreatePlayerUseCase } from './application/use-cases/create-player.use-case';
import { GetPlayerByIdUseCase } from './application/use-cases/get-player-by-id.use-case';
import { ListPlayersUseCase } from './application/use-cases/list-players.use-case';
import { UpdatePlayerUseCase } from './application/use-cases/update-player.use-case';
import { PLAYER_OVERALL_READ_REPOSITORY } from './domain/repositories/player-overall-read.repository';
import { PLAYER_REPOSITORY } from './domain/repositories/player.repository';
import { PrismaPlayerOverallReadRepository } from './infrastructure/persistence/prisma-player-overall-read.repository';
import { PrismaPlayerRepository } from './infrastructure/persistence/prisma-player.repository';
import { AdminPlayersController } from './presentation/controllers/admin-players.controller';
import { PlayersController } from './presentation/controllers/players.controller';

@Module({
  imports: [TeamsModule, LeaguesModule],
  controllers: [PlayersController, AdminPlayersController],
  providers: [
    provideUseCase(CreatePlayerUseCase, [PLAYER_REPOSITORY]),
    provideUseCase(UpdatePlayerUseCase, [PLAYER_REPOSITORY]),
    provideUseCase(GetPlayerByIdUseCase, [PLAYER_REPOSITORY]),
    provideUseCase(ListPlayersUseCase, [PLAYER_REPOSITORY]),
    provideUseCase(BrowsePlayersUseCase, [
      PLAYER_REPOSITORY,
      TEAM_REPOSITORY,
      LEAGUE_REPOSITORY,
      PLAYER_OVERALL_READ_REPOSITORY,
    ]),
    {
      provide: PLAYER_REPOSITORY,
      useClass: PrismaPlayerRepository,
    },
    {
      provide: PLAYER_OVERALL_READ_REPOSITORY,
      useClass: PrismaPlayerOverallReadRepository,
    },
  ],
  exports: [
    CreatePlayerUseCase,
    UpdatePlayerUseCase,
    GetPlayerByIdUseCase,
    ListPlayersUseCase,
    BrowsePlayersUseCase,
    PLAYER_REPOSITORY,
  ],
})
export class PlayersModule {}
