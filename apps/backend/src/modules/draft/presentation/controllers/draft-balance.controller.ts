import { Body, Controller, Get, Param, Post } from '@nestjs/common';

import { ApplyDraftPickUseCase } from '../../application/use-cases/apply-draft-pick.use-case';
import { CalculateTeamStrengthUseCase } from '../../application/use-cases/calculate-team-strength.use-case';
import { GeneratePickOptionsUseCase } from '../../application/use-cases/generate-pick-options.use-case';
import { GetDraftSessionByLobbyUseCase } from '../../application/use-cases/get-draft-session-by-lobby.use-case';
import { InitializeDraftSessionUseCase } from '../../application/use-cases/initialize-draft-session.use-case';
import { SimulateDraftFairnessUseCase } from '../../application/use-cases/simulate-draft-fairness.use-case';
import {
  ApplyDraftPickDto,
  CalculateTeamStrengthDto,
  GeneratePickOptionsDto,
  InitializeDraftSessionDto,
  SimulateDraftFairnessDto,
} from '../dto/draft-balance.dto';
import {
  toDraftPickOptionsDto,
  toDraftSessionSummaryDto,
  toSimulationResultDto,
  toTeamStrengthDto,
} from '../mappers/draft-balance-response.mapper';

@Controller('draft')
export class DraftBalanceController {
  constructor(
    private readonly initializeDraftSessionUseCase: InitializeDraftSessionUseCase,
    private readonly getDraftSessionByLobbyUseCase: GetDraftSessionByLobbyUseCase,
    private readonly generatePickOptionsUseCase: GeneratePickOptionsUseCase,
    private readonly applyDraftPickUseCase: ApplyDraftPickUseCase,
    private readonly calculateTeamStrengthUseCase: CalculateTeamStrengthUseCase,
    private readonly simulateDraftFairnessUseCase: SimulateDraftFairnessUseCase,
  ) {}

  @Post('sessions')
  async initializeSession(@Body() body: InitializeDraftSessionDto) {
    const session = await this.initializeDraftSessionUseCase.execute({
      lobbyId: body.lobbyId,
      participantIds: body.participantIds,
    });

    return { data: toDraftSessionSummaryDto(session) };
  }

  @Get('sessions/lobby/:lobbyId')
  async getSessionByLobby(@Param('lobbyId') lobbyId: string) {
    const session = await this.getDraftSessionByLobbyUseCase.execute({ lobbyId });
    if (session === null) {
      return { data: null };
    }
    return { data: toDraftSessionSummaryDto(session) };
  }

  @Post('sessions/lobby/:lobbyId/pick-options')
  async generatePickOptions(
    @Param('lobbyId') lobbyId: string,
    @Body() body: GeneratePickOptionsDto,
  ) {
    const result = await this.generatePickOptionsUseCase.execute({
      lobbyId,
      participantId: body.participantId,
      positionCode: body.positionCode,
    });

    return { data: toDraftPickOptionsDto(result) };
  }

  @Post('sessions/lobby/:lobbyId/picks')
  async applyPick(@Param('lobbyId') lobbyId: string, @Body() body: ApplyDraftPickDto) {
    const session = await this.applyDraftPickUseCase.execute({
      lobbyId,
      participantId: body.participantId,
      cardId: body.cardId,
      positionCode: body.positionCode,
    });

    return { data: toDraftSessionSummaryDto(session) };
  }

  @Post('team-strength')
  async calculateTeamStrength(@Body() body: CalculateTeamStrengthDto) {
    const result = await this.calculateTeamStrengthUseCase.execute({
      cardIds: body.cardIds,
      ...(body.coachId !== undefined ? { coachId: body.coachId } : {}),
    });

    return { data: toTeamStrengthDto(result) };
  }

  @Post('simulate/fairness')
  async simulateFairness(@Body() body: SimulateDraftFairnessDto) {
    const result = await this.simulateDraftFairnessUseCase.execute({
      ...(body.participantCount !== undefined ? { participantCount: body.participantCount } : {}),
      ...(body.runCount !== undefined ? { runCount: body.runCount } : {}),
      ...(body.seed !== undefined ? { seed: body.seed } : {}),
    });

    return { data: toSimulationResultDto(result) };
  }
}
