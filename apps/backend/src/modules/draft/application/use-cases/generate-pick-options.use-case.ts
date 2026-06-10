import type { GeneratePickOptionsCommand } from '../commands/draft-balance.commands';
import {
  DraftParticipantNotFoundError,
  DraftSessionNotFoundError,
} from '../../domain/errors/draft.errors';
import type { DraftPickOptionsResult } from '../../domain/models/draft-pick-option';
import { picksRemaining, remainingBudget } from '../../domain/models/participant-draft-state';
import type { DraftPoolRepository } from '../../domain/repositories/draft-pool.repository';
import type { DraftSessionRepository } from '../../domain/repositories/draft-session.repository';
import type { RandomSource } from '../../domain/ports/random-source.port';
import { expandDraftEligiblePositionCodes } from '../../domain/services/expand-draft-position-codes';
import { PickOptionGenerator } from '../../domain/services/pick-option-generator.service';

export class GeneratePickOptionsUseCase {
  constructor(
    private readonly draftSessionRepository: DraftSessionRepository,
    private readonly draftPoolRepository: DraftPoolRepository,
    private readonly random: RandomSource,
  ) {}

  async execute(command: GeneratePickOptionsCommand): Promise<DraftPickOptionsResult> {
    const session = await this.draftSessionRepository.findByLobbyId(command.lobbyId);
    if (session === null) {
      throw new DraftSessionNotFoundError(command.lobbyId);
    }

    const participant = session.participants.find(
      (entry) => entry.participantId === command.participantId,
    );
    if (participant === undefined) {
      throw new DraftParticipantNotFoundError(command.participantId);
    }

    const draftedRoster = await this.draftPoolRepository.findByIds(participant.draftedCardIds);
    const draftedPlayerIds = [...new Set(draftedRoster.map((card) => card.playerId))];
    const slotPositionCodes =
      command.positionCodes !== undefined && command.positionCodes.length > 0
        ? command.positionCodes
        : [command.positionCode];
    const eligiblePositionCodes = expandDraftEligiblePositionCodes(slotPositionCodes);

    const pool = await this.draftPoolRepository.findEligibleCards({
      positionCode: command.positionCode,
      positionCodes: eligiblePositionCodes,
      excludeCardIds: participant.draftedCardIds,
      excludePlayerIds: draftedPlayerIds,
    });

    const generator = new PickOptionGenerator(session.config, this.random);
    const options = generator.generate({
      positionCode: command.positionCode,
      eligiblePositionCodes,
      participantState: participant,
      pool,
      draftedRoster,
    });

    return {
      positionCode: command.positionCode,
      participantId: command.participantId,
      options,
      remainingBudget: remainingBudget(participant),
      picksRemaining: picksRemaining(participant, session.rosterSize),
    };
  }
}
