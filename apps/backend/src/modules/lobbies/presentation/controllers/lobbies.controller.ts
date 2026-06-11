import type { ApiResponse } from '@draft-io/shared-types';
import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';

import { PlayAgainUseCase } from '../../../matches/application/use-cases/play-again.use-case';
import {
  GetLeagueStateUseCase,
  GetMatchStateUseCase,
  GetTeamReviewUseCase,
  StartLeagueUseCase,
} from '../../../matches/application/use-cases/room-league.use-cases';
import { StartNextMatchUseCase } from '../../../matches/application/use-cases/start-next-match.use-case';
import { toMatchStateDto } from '../../../matches/presentation/mappers/room-league-response.mapper';
import {
  GetCoachSelectionUseCase,
  SelectCoachUseCase,
} from '../../application/use-cases/coach-selection.use-cases';
import { CreateLobbyUseCase } from '../../application/use-cases/create-lobby.use-case';
import {
  ApplyLobbyDraftPickUseCase,
  GetDraftBoardUseCase,
  GetDraftPickOptionsForSlotUseCase,
} from '../../application/use-cases/draft-board.use-cases';
import {
  GetFormationSelectionUseCase,
  SelectFormationUseCase,
} from '../../application/use-cases/formation-selection.use-cases';
import { GetLobbyByCodeUseCase } from '../../application/use-cases/get-lobby-by-code.use-case';
import { JoinLobbyUseCase } from '../../application/use-cases/join-lobby.use-case';
import {
  ListRoomChatMessagesUseCase,
  SendRoomChatMessageUseCase,
} from '../../application/use-cases/room-chat.use-cases';
import { SetParticipantReadyUseCase } from '../../application/use-cases/set-participant-ready.use-case';
import { StartDraftUseCase } from '../../application/use-cases/start-draft.use-case';
import { StartLobbyUseCase } from '../../application/use-cases/start-lobby.use-case';
import { UpdateLobbySettingsUseCase } from '../../application/use-cases/update-lobby-settings.use-case';
import { CoachSelectionQueryDto, SelectCoachDto } from '../dto/coach-selection.dto';
import { CreateLobbyDto } from '../dto/create-lobby.dto';
import {
  ApplyLobbyDraftPickDto,
  DraftBoardQueryDto,
  DraftPickOptionsQueryDto,
} from '../dto/draft-board.dto';
import { FormationSelectionQueryDto, SelectFormationDto } from '../dto/formation-selection.dto';
import { JoinLobbyDto } from '../dto/join-lobby.dto';
import { SetParticipantReadyDto, StartLobbyDto } from '../dto/lobby-ready.dto';
import { UpdateLobbySettingsDto } from '../dto/update-lobby-settings.dto';
import { RoomChatQueryDto, SendRoomChatMessageDto } from '../dto/room-chat.dto';
import { toCoachSelectionState } from '../mappers/coach-selection-response.mapper';
import { toDraftBoardStateDto } from '../mappers/draft-board-response.mapper';
import { toFormationSelectionState } from '../mappers/formation-selection-response.mapper';
import { toLobbySessionDto, toLobbySummary } from '../mappers/lobby-response.mapper';
import { toStartDraftResultDto } from '../mappers/start-draft-response.mapper';
import { toStartLobbyResultDto } from '../mappers/start-lobby-response.mapper';

@Controller('lobbies')
export class LobbiesController {
  constructor(
    private readonly createLobbyUseCase: CreateLobbyUseCase,
    private readonly joinLobbyUseCase: JoinLobbyUseCase,
    private readonly getLobbyByCodeUseCase: GetLobbyByCodeUseCase,
    private readonly setParticipantReadyUseCase: SetParticipantReadyUseCase,
    private readonly startLobbyUseCase: StartLobbyUseCase,
    private readonly getFormationSelectionUseCase: GetFormationSelectionUseCase,
    private readonly selectFormationUseCase: SelectFormationUseCase,
    private readonly getCoachSelectionUseCase: GetCoachSelectionUseCase,
    private readonly selectCoachUseCase: SelectCoachUseCase,
    private readonly startDraftUseCase: StartDraftUseCase,
    private readonly getDraftBoardUseCase: GetDraftBoardUseCase,
    private readonly getDraftPickOptionsForSlotUseCase: GetDraftPickOptionsForSlotUseCase,
    private readonly applyLobbyDraftPickUseCase: ApplyLobbyDraftPickUseCase,
    private readonly getTeamReviewUseCase: GetTeamReviewUseCase,
    private readonly startLeagueUseCase: StartLeagueUseCase,
    private readonly getLeagueStateUseCase: GetLeagueStateUseCase,
    private readonly startNextMatchUseCase: StartNextMatchUseCase,
    private readonly getMatchStateUseCase: GetMatchStateUseCase,
    private readonly playAgainUseCase: PlayAgainUseCase,
    private readonly listRoomChatMessagesUseCase: ListRoomChatMessagesUseCase,
    private readonly sendRoomChatMessageUseCase: SendRoomChatMessageUseCase,
    private readonly updateLobbySettingsUseCase: UpdateLobbySettingsUseCase,
  ) {}

  @Post()
  async create(
    @Body() dto: CreateLobbyDto,
  ): Promise<ApiResponse<ReturnType<typeof toLobbySessionDto>>> {
    const session = await this.createLobbyUseCase.execute({
      name: dto.name,
      displayName: dto.displayName,
      ...(dto.maxPlayers !== undefined ? { maxPlayers: dto.maxPlayers } : {}),
      ...(dto.draftLeagueIds !== undefined ? { draftLeagueIds: dto.draftLeagueIds } : {}),
    });

    return { data: toLobbySessionDto(session) };
  }

  @Post('join')
  async join(
    @Body() dto: JoinLobbyDto,
  ): Promise<ApiResponse<ReturnType<typeof toLobbySessionDto>>> {
    const session = await this.joinLobbyUseCase.execute({
      code: dto.code.toUpperCase(),
      displayName: dto.displayName,
    });

    return { data: toLobbySessionDto(session) };
  }

  @Get('code/:code')
  async findByCode(
    @Param('code') code: string,
  ): Promise<ApiResponse<ReturnType<typeof toLobbySummary>>> {
    const lobby = await this.getLobbyByCodeUseCase.execute({ code: code.toUpperCase() });
    return { data: toLobbySummary(lobby) };
  }

  @Post('code/:code/settings')
  async updateSettings(
    @Param('code') code: string,
    @Body() dto: UpdateLobbySettingsDto,
  ): Promise<ApiResponse<ReturnType<typeof toLobbySummary>>> {
    const lobby = await this.updateLobbySettingsUseCase.execute({
      code: code.toUpperCase(),
      sessionToken: dto.sessionToken,
      draftLeagueIds: dto.draftLeagueIds,
    });

    return { data: toLobbySummary(lobby) };
  }

  @Post('code/:code/ready')
  async setReady(
    @Param('code') code: string,
    @Body() dto: SetParticipantReadyDto,
  ): Promise<ApiResponse<ReturnType<typeof toLobbySummary>>> {
    const lobby = await this.setParticipantReadyUseCase.execute({
      code: code.toUpperCase(),
      sessionToken: dto.sessionToken,
      isReady: dto.isReady,
    });

    return { data: toLobbySummary(lobby) };
  }

  @Post('code/:code/start')
  async start(
    @Param('code') code: string,
    @Body() dto: StartLobbyDto,
  ): Promise<ApiResponse<ReturnType<typeof toStartLobbyResultDto>>> {
    const result = await this.startLobbyUseCase.execute({
      code: code.toUpperCase(),
      sessionToken: dto.sessionToken,
    });

    return { data: toStartLobbyResultDto(result) };
  }

  @Get('code/:code/formation-selection')
  async getFormationSelection(
    @Param('code') code: string,
    @Query() query: FormationSelectionQueryDto,
  ): Promise<ApiResponse<ReturnType<typeof toFormationSelectionState>>> {
    const state = await this.getFormationSelectionUseCase.execute({
      code: code.toUpperCase(),
      ...(query.sessionToken !== undefined ? { sessionToken: query.sessionToken } : {}),
    });

    const participant = state.participant;
    const canStartDraft =
      participant?.isHost === true &&
      state.lobby.allFormationsSelected &&
      state.lobby.phase === 'FORMATION_SELECTION';

    return {
      data: toFormationSelectionState(
        state.lobby,
        participant,
        state.myFormationOptions,
        canStartDraft,
      ),
    };
  }

  @Post('code/:code/formation-selection/select')
  async selectFormation(
    @Param('code') code: string,
    @Body() dto: SelectFormationDto,
  ): Promise<ApiResponse<ReturnType<typeof toFormationSelectionState>>> {
    const lobby = await this.selectFormationUseCase.execute({
      code: code.toUpperCase(),
      sessionToken: dto.sessionToken,
      formationId: dto.formationId,
    });

    const state = await this.getFormationSelectionUseCase.execute({
      code: code.toUpperCase(),
      sessionToken: dto.sessionToken,
    });

    const canStartDraft =
      state.participant?.isHost === true &&
      lobby.allFormationsSelected &&
      lobby.phase === 'FORMATION_SELECTION';

    return {
      data: toFormationSelectionState(
        lobby,
        state.participant,
        state.myFormationOptions,
        canStartDraft,
      ),
    };
  }

  @Post('code/:code/draft/start')
  async startDraft(
    @Param('code') code: string,
    @Body() dto: StartLobbyDto,
  ): Promise<ApiResponse<ReturnType<typeof toStartDraftResultDto>>> {
    const result = await this.startDraftUseCase.execute({
      code: code.toUpperCase(),
      sessionToken: dto.sessionToken,
    });

    return { data: toStartDraftResultDto(result) };
  }

  @Get('code/:code/draft')
  async getDraftBoard(
    @Param('code') code: string,
    @Query() query: DraftBoardQueryDto,
  ): Promise<ApiResponse<ReturnType<typeof toDraftBoardStateDto>>> {
    const state = await this.getDraftBoardUseCase.execute({
      code: code.toUpperCase(),
      sessionToken: query.sessionToken,
    });

    return { data: toDraftBoardStateDto(state) };
  }

  @Get('code/:code/draft/pick-options')
  async getDraftPickOptions(
    @Param('code') code: string,
    @Query() query: DraftPickOptionsQueryDto,
  ): Promise<ApiResponse<Awaited<ReturnType<GetDraftPickOptionsForSlotUseCase['execute']>>>> {
    const options = await this.getDraftPickOptionsForSlotUseCase.execute({
      code: code.toUpperCase(),
      sessionToken: query.sessionToken,
      slotIndex: query.slotIndex,
    });

    return { data: options };
  }

  @Post('code/:code/draft/pick')
  async applyDraftPick(
    @Param('code') code: string,
    @Body() dto: ApplyLobbyDraftPickDto,
  ): Promise<ApiResponse<ReturnType<typeof toDraftBoardStateDto>>> {
    await this.applyLobbyDraftPickUseCase.execute({
      code: code.toUpperCase(),
      sessionToken: dto.sessionToken,
      slotIndex: dto.slotIndex,
      cardId: dto.cardId,
    });

    const state = await this.getDraftBoardUseCase.execute({
      code: code.toUpperCase(),
      sessionToken: dto.sessionToken,
    });

    return { data: toDraftBoardStateDto(state) };
  }

  @Get('code/:code/coach-selection')
  async getCoachSelection(@Param('code') code: string, @Query() query: CoachSelectionQueryDto) {
    const state = await this.getCoachSelectionUseCase.execute({
      code: code.toUpperCase(),
      ...(query.sessionToken !== undefined ? { sessionToken: query.sessionToken } : {}),
    });

    return { data: toCoachSelectionState(state.lobby, state.participant, state.myCoachOptions) };
  }

  @Post('code/:code/coach-selection/select')
  async selectCoach(@Param('code') code: string, @Body() dto: SelectCoachDto) {
    await this.selectCoachUseCase.execute({
      code: code.toUpperCase(),
      sessionToken: dto.sessionToken,
      coachId: dto.coachId,
    });

    const state = await this.getCoachSelectionUseCase.execute({
      code: code.toUpperCase(),
      sessionToken: dto.sessionToken,
    });

    return { data: toCoachSelectionState(state.lobby, state.participant, state.myCoachOptions) };
  }

  @Get('code/:code/team-review')
  async getTeamReview(@Param('code') code: string, @Query() query: DraftBoardQueryDto) {
    const data = await this.getTeamReviewUseCase.execute({
      code: code.toUpperCase(),
      sessionToken: query.sessionToken,
    });
    return { data };
  }

  @Post('code/:code/league/start')
  async startLeague(@Param('code') code: string, @Body() dto: StartLobbyDto) {
    await this.startLeagueUseCase.execute({
      code: code.toUpperCase(),
      sessionToken: dto.sessionToken,
    });
    await this.startNextMatchUseCase.execute({ code: code.toUpperCase() });
    const data = await this.getLeagueStateUseCase.execute({ code: code.toUpperCase() });
    return { data };
  }

  @Get('code/:code/league')
  async getLeague(@Param('code') code: string) {
    const data = await this.getLeagueStateUseCase.execute({ code: code.toUpperCase() });
    return { data };
  }

  @Get('code/:code/chat')
  async listChat(
    @Param('code') code: string,
    @Query() query: RoomChatQueryDto,
  ): Promise<ApiResponse<Awaited<ReturnType<ListRoomChatMessagesUseCase['execute']>>>> {
    const data = await this.listRoomChatMessagesUseCase.execute({
      code: code.toUpperCase(),
      sessionToken: query.sessionToken,
    });
    return { data };
  }

  @Post('code/:code/chat')
  async sendChat(
    @Param('code') code: string,
    @Body() dto: SendRoomChatMessageDto,
  ): Promise<ApiResponse<Awaited<ReturnType<SendRoomChatMessageUseCase['execute']>>>> {
    const data = await this.sendRoomChatMessageUseCase.execute({
      code: code.toUpperCase(),
      sessionToken: dto.sessionToken,
      body: dto.body,
    });
    return { data };
  }

  @Post('code/:code/league/next-match')
  async startNextMatch(@Param('code') code: string) {
    await this.startNextMatchUseCase.execute({ code: code.toUpperCase() });
    const data = await this.getLeagueStateUseCase.execute({ code: code.toUpperCase() });
    return { data };
  }

  @Post('code/:code/play-again')
  async playAgain(@Param('code') code: string, @Body() dto: StartLobbyDto) {
    const lobby = await this.playAgainUseCase.execute({
      code: code.toUpperCase(),
      sessionToken: dto.sessionToken,
    });
    return { data: toLobbySummary(lobby) };
  }

  @Get('code/:code/matches/:matchId')
  async getMatch(@Param('matchId') matchId: string) {
    const result = await this.getMatchStateUseCase.execute({ matchId });
    return { data: toMatchStateDto(result.match, result.events, result.statistics) };
  }
}
