import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { CommonModule } from './common/common.module';
import { validateEnvironment } from './infrastructure/config/environment.validation';
import { DatabaseModule } from './infrastructure/database/database.module';
import { RedisModule } from './infrastructure/redis/redis.module';
import { AuthModule } from './modules/auth/auth.module';
import { CardsModule } from './modules/cards/cards.module';
import { CoachesModule } from './modules/coaches/coaches.module';
import { DataProvidersModule } from './modules/data-providers/data-providers.module';
import { DataQualityModule } from './modules/data-quality/data-quality.module';
import { DraftModule } from './modules/draft/draft.module';
import { FormationsModule } from './modules/formations/formations.module';
import { LeaguesModule } from './modules/leagues/leagues.module';
import { LobbiesModule } from './modules/lobbies/lobbies.module';
import { MatchesModule } from './modules/matches/matches.module';
import { NationsModule } from './modules/nations/nations.module';
import { OverallEngineModule } from './modules/overall-engine/overall-engine.module';
import { PlayersModule } from './modules/players/players.module';
import { PositionsModule } from './modules/positions/positions.module';
import { SimulationModule } from './modules/simulation/simulation.module';
import { TeamsModule } from './modules/teams/teams.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnvironment,
    }),
    CommonModule,
    DatabaseModule,
    RedisModule,
    AuthModule,
    UsersModule,
    PositionsModule,
    PlayersModule,
    CoachesModule,
    CardsModule,
    DataProvidersModule,
    DataQualityModule,
    OverallEngineModule,
    FormationsModule,
    TeamsModule,
    NationsModule,
    LeaguesModule,
    LobbiesModule,
    DraftModule,
    MatchesModule,
    SimulationModule,
  ],
})
export class AppModule {}
