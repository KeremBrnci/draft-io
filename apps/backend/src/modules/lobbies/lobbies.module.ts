import { Module, forwardRef } from '@nestjs/common';

import { provideUseCase } from '../../common/nest/provide-use-case';
import { CoachesModule } from '../coaches/coaches.module';
import { COACH_REPOSITORY } from '../coaches/domain/repositories/coach.repository';
import { ApplyDraftPickUseCase } from '../draft/application/use-cases/apply-draft-pick.use-case';
import { SwapDraftSlotAssignmentsUseCase } from '../draft/application/use-cases/swap-draft-slot-assignments.use-case';
import { CalculateTeamStrengthUseCase } from '../draft/application/use-cases/calculate-team-strength.use-case';
import { GeneratePickOptionsUseCase } from '../draft/application/use-cases/generate-pick-options.use-case';
import { GetDraftSessionByLobbyUseCase } from '../draft/application/use-cases/get-draft-session-by-lobby.use-case';
import { InitializeDraftSessionUseCase } from '../draft/application/use-cases/initialize-draft-session.use-case';
import { DRAFT_POOL_REPOSITORY } from '../draft/domain/repositories/draft-pool.repository';
import { DraftModule } from '../draft/draft.module';
import { FORMATION_REPOSITORY } from '../formations/domain/repositories/formation.repository';
import { FormationsModule } from '../formations/formations.module';
import { LEAGUE_REPOSITORY } from '../leagues/domain/repositories/league.repository';
import { LeaguesModule } from '../leagues/leagues.module';
import { CheckDraftCompletionUseCase } from '../matches/application/use-cases/room-league.use-cases';
import { StartNextMatchUseCase } from '../matches/application/use-cases/start-next-match.use-case';
import { ROOM_LEAGUE_REPOSITORY } from '../matches/domain/repositories/room-league.repository';
import { MatchesModule } from '../matches/matches.module';
import { TEAM_REPOSITORY } from '../teams/domain/repositories/team.repository';
import { TeamsModule } from '../teams/teams.module';

import { ROOM_EVENTS_PUBLISHER } from './application/services/room-events.publisher';
import {
  CheckCoachCompletionUseCase,
  GetCoachSelectionUseCase,
  SelectCoachUseCase,
} from './application/use-cases/coach-selection.use-cases';
import { CreateLobbyUseCase } from './application/use-cases/create-lobby.use-case';
import {
  ApplyLobbyDraftPickUseCase,
  GetDraftBoardUseCase,
  GetDraftPickOptionsForSlotUseCase,
  SwapLobbyDraftSlotsUseCase,
} from './application/use-cases/draft-board.use-cases';
import {
  GetFormationSelectionUseCase,
  SelectFormationUseCase,
} from './application/use-cases/formation-selection.use-cases';
import { GetLobbyByCodeUseCase } from './application/use-cases/get-lobby-by-code.use-case';
import { JoinLobbyUseCase } from './application/use-cases/join-lobby.use-case';
import {
  ListRoomChatMessagesUseCase,
  SendRoomChatMessageUseCase,
} from './application/use-cases/room-chat.use-cases';
import { SetParticipantReadyUseCase } from './application/use-cases/set-participant-ready.use-case';
import { StartDraftUseCase } from './application/use-cases/start-draft.use-case';
import { StartLobbyUseCase } from './application/use-cases/start-lobby.use-case';
import { UpdateLobbySettingsUseCase } from './application/use-cases/update-lobby-settings.use-case';
import { LOBBY_REPOSITORY } from './domain/repositories/lobby.repository';
import { ROOM_CHAT_REPOSITORY } from './domain/repositories/room-chat.repository';
import { PrismaLobbyRepository } from './infrastructure/persistence/prisma-lobby.repository';
import { PrismaRoomChatRepository } from './infrastructure/persistence/prisma-room-chat.repository';
import { LobbiesController } from './presentation/controllers/lobbies.controller';
import { RoomEventsModule } from './room-events.module';

@Module({
  imports: [
    CoachesModule,
    DraftModule,
    FormationsModule,
    LeaguesModule,
    TeamsModule,
    RoomEventsModule,
    forwardRef(() => MatchesModule),
  ],
  controllers: [LobbiesController],
  providers: [
    provideUseCase(CreateLobbyUseCase, [LOBBY_REPOSITORY]),
    provideUseCase(UpdateLobbySettingsUseCase, [LOBBY_REPOSITORY, LEAGUE_REPOSITORY]),
    provideUseCase(JoinLobbyUseCase, [LOBBY_REPOSITORY]),
    provideUseCase(GetLobbyByCodeUseCase, [LOBBY_REPOSITORY]),
    provideUseCase(SetParticipantReadyUseCase, [
      LOBBY_REPOSITORY,
      GetDraftSessionByLobbyUseCase,
      CheckDraftCompletionUseCase,
      ROOM_EVENTS_PUBLISHER,
    ]),
    provideUseCase(StartLobbyUseCase, [
      LOBBY_REPOSITORY,
      FORMATION_REPOSITORY,
      ROOM_EVENTS_PUBLISHER,
    ]),
    provideUseCase(GetFormationSelectionUseCase, [LOBBY_REPOSITORY, FORMATION_REPOSITORY]),
    provideUseCase(SelectFormationUseCase, [
      LOBBY_REPOSITORY,
      FORMATION_REPOSITORY,
      ROOM_EVENTS_PUBLISHER,
    ]),
    provideUseCase(StartDraftUseCase, [
      LOBBY_REPOSITORY,
      InitializeDraftSessionUseCase,
      GetDraftSessionByLobbyUseCase,
      ROOM_EVENTS_PUBLISHER,
    ]),
    provideUseCase(GetDraftBoardUseCase, [
      LOBBY_REPOSITORY,
      FORMATION_REPOSITORY,
      DRAFT_POOL_REPOSITORY,
      GetDraftSessionByLobbyUseCase,
      CalculateTeamStrengthUseCase,
    ]),
    provideUseCase(GetDraftPickOptionsForSlotUseCase, [
      LOBBY_REPOSITORY,
      FORMATION_REPOSITORY,
      GeneratePickOptionsUseCase,
      GetDraftSessionByLobbyUseCase,
    ]),
    provideUseCase(ApplyLobbyDraftPickUseCase, [
      LOBBY_REPOSITORY,
      FORMATION_REPOSITORY,
      ApplyDraftPickUseCase,
      GetDraftSessionByLobbyUseCase,
      CheckDraftCompletionUseCase,
    ]),
    provideUseCase(SwapLobbyDraftSlotsUseCase, [
      LOBBY_REPOSITORY,
      FORMATION_REPOSITORY,
      DRAFT_POOL_REPOSITORY,
      SwapDraftSlotAssignmentsUseCase,
      GetDraftSessionByLobbyUseCase,
    ]),
    provideUseCase(GetCoachSelectionUseCase, [
      LOBBY_REPOSITORY,
      COACH_REPOSITORY,
      TEAM_REPOSITORY,
      LEAGUE_REPOSITORY,
    ]),
    provideUseCase(SelectCoachUseCase, [
      LOBBY_REPOSITORY,
      ROOM_EVENTS_PUBLISHER,
      CheckCoachCompletionUseCase,
    ]),
    provideUseCase(CheckCoachCompletionUseCase, [
      LOBBY_REPOSITORY,
      ROOM_LEAGUE_REPOSITORY,
      ROOM_EVENTS_PUBLISHER,
      StartNextMatchUseCase,
    ]),
    provideUseCase(ListRoomChatMessagesUseCase, [LOBBY_REPOSITORY, ROOM_CHAT_REPOSITORY]),
    provideUseCase(SendRoomChatMessageUseCase, [
      LOBBY_REPOSITORY,
      ROOM_CHAT_REPOSITORY,
      ROOM_EVENTS_PUBLISHER,
    ]),
    {
      provide: LOBBY_REPOSITORY,
      useClass: PrismaLobbyRepository,
    },
    {
      provide: ROOM_CHAT_REPOSITORY,
      useClass: PrismaRoomChatRepository,
    },
  ],
  exports: [
    CreateLobbyUseCase,
    JoinLobbyUseCase,
    GetLobbyByCodeUseCase,
    LOBBY_REPOSITORY,
    ROOM_CHAT_REPOSITORY,
  ],
})
export class LobbiesModule {}
