import { DRAFT_PICK_POOL_FETCH_LIMIT } from '../../domain/constants/draft-pool.constants';
import {
  DraftParticipantNotFoundError,
  DraftSessionNotFoundError,
} from '../../domain/errors/draft.errors';
import type { DraftPickOptionsResult } from '../../domain/models/draft-pick-option';
import type { DraftPoolCard } from '../../domain/models/draft-pool-card';
import { picksRemaining, recordOfferedPlayers } from '../../domain/models/participant-draft-state';
import type { RandomSource } from '../../domain/ports/random-source.port';
import type { DraftPoolRepository } from '../../domain/repositories/draft-pool.repository';
import type { DraftSessionRepository } from '../../domain/repositories/draft-session.repository';
import { expandDraftEligiblePositionCodes } from '../../domain/services/expand-draft-position-codes';
import { PickOptionGenerator } from '../../domain/services/pick-option-generator.service';
import type { GeneratePickOptionsCommand } from '../commands/draft-balance.commands';

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

    const draftedRoster =
      participant.draftedCardIds.length === 0
        ? []
        : await this.draftPoolRepository.findByIds(participant.draftedCardIds);
    const draftedPlayerIds = [...new Set(draftedRoster.map((card) => card.playerId))];
    const slotPositionCodes =
      command.positionCodes !== undefined && command.positionCodes.length > 0
        ? command.positionCodes
        : [command.positionCode];
    const eligiblePositionCodes = expandDraftEligiblePositionCodes(slotPositionCodes);

    const poolLeagueIds = session.config.poolLeagueIds ?? [];
    const pool = await this.draftPoolRepository.findEligibleCards({
      positionCode: command.positionCode,
      positionCodes: eligiblePositionCodes,
      excludeCardIds: participant.draftedCardIds,
      excludePlayerIds: draftedPlayerIds,
      ...(poolLeagueIds.length > 0 ? { leagueIds: poolLeagueIds } : {}),
      limit: DRAFT_PICK_POOL_FETCH_LIMIT,
    });

    const generator = new PickOptionGenerator(session.config, this.random);
    const options = generator.generate({
      positionCode: command.positionCode,
      eligiblePositionCodes,
      participantState: participant,
      pool,
      draftedRoster,
    });

    const poolById = new Map(pool.map((card) => [card.cardId, card]));
    const optionCards = options
      .map((option) => poolById.get(option.cardId))
      .filter((card): card is DraftPoolCard => card !== undefined);

    const offeredPlayerIds = options.map((option) => option.playerId);
    const participants = session.participants.map((entry) =>
      entry.participantId === command.participantId
        ? recordOfferedPlayers(entry, offeredPlayerIds)
        : entry,
    );

    void this.draftSessionRepository
      .save({
        ...session,
        participants,
        updatedAt: new Date(),
      })
      .catch(() => {
        // Recently-offered tracking is best-effort; pick options must return without blocking.
      });

    return {
      positionCode: command.positionCode,
      participantId: command.participantId,
      options,
      optionCards,
      picksRemaining: picksRemaining(participant, session.rosterSize),
    };
  }
}
