import { Module, forwardRef } from '@nestjs/common';

import { provideUseCase } from '../../common/nest/provide-use-case';
import { CoachesModule } from '../coaches/coaches.module';
import { COACH_REPOSITORY } from '../coaches/domain/repositories/coach.repository';
import { CalculateTeamStrengthUseCase } from '../draft/application/use-cases/calculate-team-strength.use-case';
import { GetDraftSessionByLobbyUseCase } from '../draft/application/use-cases/get-draft-session-by-lobby.use-case';
import { DRAFT_POOL_REPOSITORY } from '../draft/domain/repositories/draft-pool.repository';
import { DRAFT_SESSION_REPOSITORY } from '../draft/domain/repositories/draft-session.repository';
import { DraftModule } from '../draft/draft.module';
import { FORMATION_REPOSITORY } from '../formations/domain/repositories/formation.repository';
import { FormationsModule } from '../formations/formations.module';
import { ROOM_EVENTS_PUBLISHER } from '../lobbies/application/services/room-events.publisher';
import { LOBBY_REPOSITORY } from '../lobbies/domain/repositories/lobby.repository';
import { ROOM_CHAT_REPOSITORY } from '../lobbies/domain/repositories/room-chat.repository';
import { LobbiesModule } from '../lobbies/lobbies.module';
import { RoomEventsModule } from '../lobbies/room-events.module';
import { MatchSimulationEngine } from '../simulation/domain/services/match-simulation-engine.service';
import { SimulationModule } from '../simulation/simulation.module';

import { MATCH_PLAYBACK_PORT } from './application/ports/match-playback.port';
import { MatchPlaybackService } from './application/services/match-playback.service';
import { PlayAgainUseCase } from './application/use-cases/play-again.use-case';
import {
  CheckDraftCompletionUseCase,
  GetLeagueStateUseCase,
  GetMatchStateUseCase,
  GetTeamReviewUseCase,
  StartLeagueUseCase,
} from './application/use-cases/room-league.use-cases';
import { StartNextMatchUseCase } from './application/use-cases/start-next-match.use-case';
import { ROOM_LEAGUE_REPOSITORY } from './domain/repositories/room-league.repository';
import { PrismaRoomLeagueRepository } from './infrastructure/persistence/prisma-room-league.repository';

@Module({
  imports: [
    CoachesModule,
    DraftModule,
    FormationsModule,
    SimulationModule,
    RoomEventsModule,
    forwardRef(() => LobbiesModule),
  ],
  providers: [
    MatchPlaybackService,
    {
      provide: MATCH_PLAYBACK_PORT,
      useExisting: MatchPlaybackService,
    },
    {
      provide: ROOM_LEAGUE_REPOSITORY,
      useClass: PrismaRoomLeagueRepository,
    },
    provideUseCase(GetTeamReviewUseCase, [
      LOBBY_REPOSITORY,
      FORMATION_REPOSITORY,
      COACH_REPOSITORY,
      GetDraftSessionByLobbyUseCase,
      CalculateTeamStrengthUseCase,
    ]),
    provideUseCase(StartLeagueUseCase, [
      LOBBY_REPOSITORY,
      ROOM_LEAGUE_REPOSITORY,
      ROOM_EVENTS_PUBLISHER,
    ]),
    provideUseCase(GetLeagueStateUseCase, [LOBBY_REPOSITORY, ROOM_LEAGUE_REPOSITORY]),
    provideUseCase(StartNextMatchUseCase, [
      LOBBY_REPOSITORY,
      FORMATION_REPOSITORY,
      DRAFT_POOL_REPOSITORY,
      GetDraftSessionByLobbyUseCase,
      CalculateTeamStrengthUseCase,
      ROOM_LEAGUE_REPOSITORY,
      MatchSimulationEngine,
      MATCH_PLAYBACK_PORT,
    ]),
    provideUseCase(GetMatchStateUseCase, [ROOM_LEAGUE_REPOSITORY]),
    provideUseCase(CheckDraftCompletionUseCase, [
      LOBBY_REPOSITORY,
      GetDraftSessionByLobbyUseCase,
      COACH_REPOSITORY,
      ROOM_EVENTS_PUBLISHER,
    ]),
    provideUseCase(PlayAgainUseCase, [
      LOBBY_REPOSITORY,
      ROOM_LEAGUE_REPOSITORY,
      DRAFT_SESSION_REPOSITORY,
      ROOM_CHAT_REPOSITORY,
      ROOM_EVENTS_PUBLISHER,
    ]),
  ],
  exports: [
    ROOM_LEAGUE_REPOSITORY,
    CheckDraftCompletionUseCase,
    GetTeamReviewUseCase,
    StartLeagueUseCase,
    GetLeagueStateUseCase,
    StartNextMatchUseCase,
    GetMatchStateUseCase,
    MatchPlaybackService,
    PlayAgainUseCase,
  ],
})
export class MatchesModule {}
